#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PostHog, instrument } from "@posthog/mcp";
import { z } from "zod";
import { CREATE_TIMEOUT_MS, type Task, api, getTask, waitForTask } from "./api.js";
import {
  APPS,
  type App,
  type CommandReply,
  appName,
  listListeningApps,
  runAppCommand,
  sendMeshToApp,
} from "./bridge.js";
import { SERVER_VERSION, getPostHogHost, getPostHogProjectToken, loadLocalEnv } from "./config.js";

loadLocalEnv();

/**
 * Longest a tool call waits on a running task before it answers. A generation
 * takes 10 to 20 minutes, far longer than many clients let one tool call run
 * (Codex stops at 60 seconds), and the user sees nothing while a call is open.
 * So each call answers with the current progress, and the agent calls
 * hydrilla_get_task again to keep waiting.
 */
const CALL_BUDGET_MS = 45_000;

type ToolContent = { type: "text"; text: string } | { type: "image"; data: string; mimeType: string };

type ToolResult = {
  content: ToolContent[];
  isError?: boolean;
};

/** Default wait for a Blender command; under the 60 seconds some clients give one tool call. */
const BLENDER_COMMAND_TIMEOUT_S = 50;

/** What a tool handler is given besides its arguments; only the parts used here. */
type ToolExtra = {
  _meta?: { progressToken?: string | number };
  sendNotification: (notification: {
    method: "notifications/progress";
    params: { progressToken: string | number; progress: number; total: number; message?: string };
  }) => Promise<void>;
};

const jsonResult = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

const errorResult = (error: unknown): ToolResult => ({
  content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
  isError: true,
});

/** Run a tool body and turn any failure into a readable tool error. */
const guarded = async (work: () => Promise<ToolResult>): Promise<ToolResult> => {
  try {
    return await work();
  } catch (error) {
    return errorResult(error);
  }
};

/** Progress keeps long generations from hitting the client's request timeout. */
const progressReporter = (extra: ToolExtra) => async (task: Task): Promise<void> => {
  const progressToken = extra._meta?.progressToken;
  if (progressToken === undefined) {
    return;
  }
  try {
    await extra.sendNotification({
      method: "notifications/progress",
      params: {
        progressToken,
        progress: Math.max(0, Math.min(99, Math.round(task.progress ?? 0))),
        total: 100,
        message: task.status_message || (task.status === "PENDING" ? "Waiting for a GPU" : "Generating"),
      },
    });
  } catch {
    // Progress is a courtesy; the tool result still arrives without it.
  }
};

const meshUrlOf = (task: Task): string => task.result?.mesh_url || "";

type Delivery = { sent_to?: string; send_error?: string };

/** Send a finished model to an app, reporting a failure without losing the result. */
const deliver = async (task: Task, app: App | undefined, name: string | undefined): Promise<Delivery> => {
  if (!app) {
    return {};
  }
  try {
    await sendMeshToApp(app, { meshUrl: meshUrlOf(task), name, taskId: task.id });
    return { sent_to: appName(app) };
  } catch (error) {
    return { send_error: error instanceof Error ? error.message : String(error) };
  }
};

const STILL_GENERATING_NOTE =
  "Still generating; a model usually takes 10 to 20 minutes in total. Tell the user the progress so far, " +
  "then call hydrilla_get_task with this task_id (and the same send_to and name, if any) to keep waiting. " +
  "Do not start the generation again.";

const elapsedSecondsOf = (task: Task): number | undefined =>
  typeof task.created_at === "number" ? Math.max(0, Math.round(Date.now() / 1000 - task.created_at)) : undefined;

/**
 * Wait on a task for at most waitMs, then report where it stands. Once it has
 * succeeded, place the model in the user's open app if asked.
 */
const awaitTask = async (
  taskId: string,
  options: { waitMs: number; sendTo?: App; name?: string },
  extra: ToolExtra
): Promise<ToolResult> => {
  const { task, timedOut } = await waitForTask(taskId, options.waitMs, progressReporter(extra));
  if (timedOut) {
    return jsonResult({
      ...task,
      id: taskId,
      elapsed_seconds: elapsedSecondsOf(task),
      note: STILL_GENERATING_NOTE,
    });
  }
  if (task.status !== "SUCCEEDED") {
    return errorResult(new Error(task.error || `Generation ${task.status.toLowerCase()}.`));
  }
  const delivery = await deliver({ ...task, id: taskId }, options.sendTo, options.name);
  return jsonResult({ ...task, id: taskId, ...delivery });
};

/** After the create request, wait only for what is left of this call's budget. */
const finishGeneration = async (
  taskId: string,
  startedAt: number,
  options: { wait: boolean; sendTo?: App; name?: string },
  extra: ToolExtra
): Promise<ToolResult> => {
  if (!options.wait) {
    return jsonResult({
      id: taskId,
      status: "PENDING",
      note: "Generation started; it usually takes 10 to 20 minutes. Check it with hydrilla_get_task (pass send_to there to place it in an app when it is done).",
    });
  }
  const waitMs = Math.max(0, CALL_BUDGET_MS - (Date.now() - startedAt));
  return awaitTask(taskId, { waitMs, sendTo: options.sendTo, name: options.name }, extra);
};

const server = new McpServer({
  name: "hydrilla",
  version: SERVER_VERSION,
});

const posthogToken = getPostHogProjectToken();
const posthog = posthogToken
  ? new PostHog(posthogToken, {
      host: getPostHogHost(),
      // Stdio processes exit quickly; flush aggressively so tool-call events land.
      flushAt: 1,
      flushInterval: 0,
    })
  : null;

if (posthog) {
  instrument(server, posthog, {
    // Stdio must not write analytics warnings to stdout (corrupts MCP framing).
    logger: (message) => {
      process.stderr.write(`[posthog-mcp] ${message}\n`);
    },
  });
}

const shutdownPostHog = async (): Promise<void> => {
  if (!posthog) {
    return;
  }
  try {
    await posthog.shutdown();
  } catch {
    // Analytics must never break the MCP process.
  }
};

const exitAfterFlush = async (): Promise<void> => {
  await shutdownPostHog();
  process.exit(0);
};

process.once("SIGTERM", () => {
  void exitAfterFlush();
});

process.once("SIGINT", () => {
  void exitAfterFlush();
});

const sendToSchema = z
  .enum(APPS)
  .optional()
  .describe(
    "Put the finished model straight into this open app (the app's Hydrilla plugin must have its Bridge running). Use when the user asks for the model in their scene or project."
  );

const nameSchema = z
  .string()
  .max(48)
  .optional()
  .describe("Short name for the imported object, e.g. 'treasure-chest'");

server.tool(
  "hydrilla_me",
  "Return the Hydrilla account plan and credit balance. Free; use it to check the connection.",
  {},
  async () => guarded(async () => jsonResult(await api<Record<string, unknown>>("/v1/user/me")))
);

server.tool(
  "hydrilla_text_to_3d",
  "Generate a textured 3D model (GLB) from a text prompt. Costs credits and takes 10 to 20 minutes: the call returns a task_id within about a minute, then keep calling hydrilla_get_task with it until the model is ready. Set send_to to place it in the user's open Blender, Unity, Unreal, Godot, Maya or 3ds Max.",
  {
    prompt: z.string().min(1).describe("What to generate"),
    wait: z
      .boolean()
      .optional()
      .describe("Wait up to about 45 seconds for progress before answering (default true). The model is rarely ready that fast; keep checking with hydrilla_get_task."),
    send_to: sendToSchema,
    name: nameSchema,
  },
  async ({ prompt, wait = true, send_to, name }, extra) =>
    guarded(async () => {
      const startedAt = Date.now();
      const created = await api<{ id: string }>(
        "/v1/3d/text-to-3d",
        { method: "POST", body: JSON.stringify({ prompt }) },
        CREATE_TIMEOUT_MS
      );
      return finishGeneration(created.id, startedAt, { wait, sendTo: send_to, name }, extra as ToolExtra);
    })
);

server.tool(
  "hydrilla_image_to_3d",
  "Generate a textured 3D model (GLB) from a public image URL. Costs credits and takes 10 to 20 minutes: the call returns a task_id within about a minute, then keep calling hydrilla_get_task with it until the model is ready. Set send_to to place it in the user's open app.",
  {
    image_url: z.string().url().describe("Public image URL"),
    wait: z
      .boolean()
      .optional()
      .describe("Wait up to about 45 seconds for progress before answering (default true). The model is rarely ready that fast; keep checking with hydrilla_get_task."),
    send_to: sendToSchema,
    name: nameSchema,
  },
  async ({ image_url, wait = true, send_to, name }, extra) =>
    guarded(async () => {
      const startedAt = Date.now();
      const created = await api<{ id: string }>(
        "/v1/3d/image-to-3d",
        { method: "POST", body: JSON.stringify({ image_url }) },
        CREATE_TIMEOUT_MS
      );
      return finishGeneration(created.id, startedAt, { wait, sendTo: send_to, name }, extra as ToolExtra);
    })
);

server.tool(
  "hydrilla_get_task",
  "Check a Hydrilla 3D task by id, waiting up to about 45 seconds for it to finish. Returns its status and progress and, once it has succeeded, the mesh URL. While it is still generating, tell the user the progress and call this again with the same task_id. Pass send_to to place the model in an open app as soon as it is ready.",
  {
    task_id: z.string().min(1),
    wait: z
      .boolean()
      .optional()
      .describe("Wait up to about 45 seconds for the task to finish (default true). Set false for an instant status check."),
    send_to: sendToSchema,
    name: nameSchema,
  },
  async ({ task_id, wait = true, send_to, name }, extra) =>
    guarded(async () =>
      awaitTask(task_id, { waitMs: wait ? CALL_BUDGET_MS : 0, sendTo: send_to, name }, extra as ToolExtra)
    )
);

server.tool(
  "hydrilla_list_tasks",
  "List the user's recent Hydrilla 3D models, newest first. Free. Use it to find a model that already exists instead of generating it again.",
  {
    limit: z.number().int().min(1).max(100).optional().describe("How many to return (default 20)"),
  },
  async ({ limit = 20 }) =>
    guarded(async () => jsonResult(await api<Record<string, unknown>>(`/v1/3d/tasks?limit=${limit}`)))
);

server.tool(
  "hydrilla_cancel_task",
  "Stop a Hydrilla 3D task that is still generating. Unused credits are refunded.",
  {
    task_id: z.string().min(1),
  },
  async ({ task_id }) =>
    guarded(async () =>
      jsonResult(
        await api<Record<string, unknown>>(`/v1/3d/tasks/${encodeURIComponent(task_id)}`, { method: "DELETE" })
      )
    )
);

server.tool(
  "hydrilla_list_apps",
  "List which of the user's apps (Blender, Maya, 3ds Max, Unreal, Unity, Godot) are open with the Hydrilla Bridge running and can receive a model right now. Free.",
  {},
  async () =>
    guarded(async () => {
      const listening = await listListeningApps();
      return jsonResult({
        ready: listening,
        note:
          listening.length > 0
            ? "Pass one of these as send_to, or use hydrilla_send_to_app."
            : "No app is listening. Ask the user to open the Hydrilla plugin in their app and click Run Bridge.",
      });
    })
);

server.tool(
  "hydrilla_send_to_app",
  "Put an already generated model into the user's open app (Blender, Unity, Unreal, Godot, Maya or 3ds Max). Free; does not generate anything.",
  {
    app: z.enum(APPS).describe("Which app to send the model to"),
    task_id: z.string().min(1).describe("Id of a task that has succeeded"),
    name: nameSchema,
  },
  async ({ app, task_id, name }) =>
    guarded(async () => {
      const task = await getTask(task_id);
      if (task.status !== "SUCCEEDED" || !meshUrlOf(task)) {
        return errorResult(
          new Error(`Task ${task_id} is ${task.status}, so there is no model to send yet. Check it with hydrilla_get_task.`)
        );
      }
      await sendMeshToApp(app, { meshUrl: meshUrlOf(task), name, taskId: task_id });
      return jsonResult({ id: task_id, sent_to: appName(app) });
    })
);

/** A failed command as a tool error, keeping the traceback and printed output. */
const commandErrorResult = (reply: CommandReply): ToolResult => {
  const parts = [
    reply.message || reply.error || "The command failed.",
    typeof reply.traceback === "string" && reply.traceback ? `\n${reply.traceback}` : "",
    typeof reply.output === "string" && reply.output ? `\nPrinted before the error:\n${reply.output}` : "",
  ];
  return { content: [{ type: "text", text: parts.join("\n").trim() }], isError: true };
};

const withoutOk = (reply: CommandReply): Record<string, unknown> => {
  const { ok: _ok, ...rest } = reply;
  return rest;
};

server.tool(
  "hydrilla_blender_scene_info",
  "See what is in the user's open Blender scene: each object's name, type, parent, world location, rotation (degrees), scale and world bounding box (bounds_min, bounds_max, size in metres, children included), plus the selection, active object and mode. Free and read-only. Lists top-level objects by default; pass root to list one object and everything under it, or query to find objects by name. Models placed by Hydrilla are named Hydrilla_<name>. Call it before hydrilla_blender_run_python to learn exact names and sizes, and after it to check the result. Needs the Hydrilla Bridge running in Blender.",
  {
    query: z.string().max(200).optional().describe("Only objects whose name contains this text (any depth)"),
    root: z.string().max(200).optional().describe("Exact name of an object whose whole hierarchy to list"),
    limit: z.number().int().min(1).max(500).optional().describe("Most objects to list (default 50)"),
  },
  { title: "Read Blender scene", readOnlyHint: true, openWorldHint: false },
  async ({ query, root, limit }) =>
    guarded(async () => {
      const reply = await runAppCommand("blender", "scene_info", { query, root, limit }, BLENDER_COMMAND_TIMEOUT_S);
      return reply.ok ? jsonResult(withoutOk(reply)) : commandErrorResult(reply);
    })
);

server.tool(
  "hydrilla_blender_run_python",
  [
    "Run Python in the user's open Blender session to create, move, rotate, scale, duplicate, delete or change objects, materials, lights and cameras. Returns everything the script prints, or the error with a traceback.",
    "Already imported: bpy, bmesh, mathutils, Vector, Matrix, Euler, math. Units are metres and Z is up. bpy.ops calls run with the 3D viewport as context.",
    "Work in small steps: one task per call, print the values you need, then check with hydrilla_blender_scene_info or hydrilla_blender_screenshot. Use exact names from hydrilla_blender_scene_info. After moving objects, call bpy.context.view_layer.update() before reading matrix_world.",
    "Blender freezes while a script runs and a running script cannot be stopped, so avoid long loops, renders, file dialogs and saving over the user's file unless they ask. Each call is one Ctrl+Z step for the user.",
    "The user must turn on “Let AI agent edit this scene” in Blender's Hydrilla panel; if it is off, the call fails with a message to pass on to them.",
  ].join(" "),
  {
    code: z.string().min(1).max(1_000_000).describe("Python to run. print() what you want returned."),
    timeout_seconds: z
      .number()
      .int()
      .min(1)
      .max(300)
      .optional()
      .describe("How long to wait for Blender to finish (default 50). The script is not stopped when this runs out."),
  },
  { title: "Run Python in Blender", readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  async ({ code, timeout_seconds = BLENDER_COMMAND_TIMEOUT_S }) =>
    guarded(async () => {
      const reply = await runAppCommand("blender", "run_python", { code }, timeout_seconds);
      if (!reply.ok) {
        return commandErrorResult(reply);
      }
      const output = typeof reply.output === "string" ? reply.output : "";
      return {
        content: [{ type: "text", text: output ? `Script ran. Output:\n${output}` : "Script ran. It printed nothing." }],
      };
    })
);

server.tool(
  "hydrilla_blender_screenshot",
  "Look at the user's Blender 3D viewport as an image, from the same angle and with the same shading they see. Free and read-only. Use it to check layout and appearance after changing the scene; for exact positions and sizes use hydrilla_blender_scene_info. Images stay in the conversation, so use a small max_size for quick checks.",
  {
    max_size: z
      .number()
      .int()
      .min(128)
      .max(2000)
      .optional()
      .describe("Longest side of the image in pixels (default 768)"),
  },
  { title: "Capture Blender viewport", readOnlyHint: true, openWorldHint: false },
  async ({ max_size }) =>
    guarded(async () => {
      const reply = await runAppCommand("blender", "screenshot", { max_size }, BLENDER_COMMAND_TIMEOUT_S);
      if (!reply.ok || typeof reply.image_base64 !== "string") {
        return commandErrorResult(reply.ok ? { ok: false, message: "Blender returned no image." } : reply);
      }
      const mimeType = typeof reply.mime_type === "string" ? reply.mime_type : "image/png";
      return {
        content: [
          { type: "image", data: reply.image_base64, mimeType },
          { type: "text", text: `Blender viewport, ${String(reply.width)}x${String(reply.height)} px.` },
        ],
      };
    })
);

const transport = new StdioServerTransport();
await server.connect(transport);

process.once("beforeExit", () => {
  void shutdownPostHog();
});
