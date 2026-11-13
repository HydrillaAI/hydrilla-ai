/**
 * Hydrilla Bridge: each Hydrilla plugin can listen on its own local port so a
 * finished model can be sent straight into the open scene or project. A plugin
 * may also take agent commands (read the scene, run a script, capture the
 * viewport), authenticated with the session token it writes to
 * <config dir>/bridge/<app>.token while its Bridge is running.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hydrillaConfigDir } from "./config.js";

export const APPS = ["blender", "maya", "3dsmax", "unreal", "unity", "godot"] as const;
export type App = (typeof APPS)[number];

const BRIDGE_HOST = "127.0.0.1";
const BRIDGE_SERVICE = "hydrilla-bridge";
const HEALTH_TIMEOUT_MS = 1_500;
/** The plugin downloads the mesh before it replies; kept short so the tool call still answers. */
const IMPORT_TIMEOUT_MS = 2 * 60_000;

const BRIDGE_PORTS: Record<App, number> = {
  blender: 7345,
  maya: 7346,
  "3dsmax": 7347,
  unreal: 7348,
  unity: 7349,
  godot: 7350,
};

const APP_NAMES: Record<App, string> = {
  blender: "Blender",
  maya: "Maya",
  "3dsmax": "3ds Max",
  unreal: "Unreal Editor",
  unity: "Unity",
  godot: "Godot",
};

const BRIDGE_HINTS: Record<App, string> = {
  blender: "In Blender, press N in the 3D viewport, open the Hydrilla tab and click Run Bridge.",
  maya: "In Maya, open the Hydrilla window (import hydrilla_maya; hydrilla_maya.show()) and click Run Bridge.",
  "3dsmax": "In 3ds Max, open the Hydrilla window (import hydrilla_max; hydrilla_max.show()) and click Run Bridge.",
  unreal: "In Unreal Editor, choose Hydrilla > Run Bridge from the main menu.",
  unity: "In Unity, open Window > Hydrilla and click Run Bridge.",
  godot: "In Godot, open the Hydrilla dock and click Run Bridge.",
};

export class BridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BridgeError";
  }
}

const bridgeUrl = (app: App): string => `http://${BRIDGE_HOST}:${BRIDGE_PORTS[app]}`;

export const appName = (app: App): string => APP_NAMES[app];

type BridgeHealth = { service?: string; commands?: unknown };

/** The Bridge's health payload, or null when no Hydrilla Bridge answers on that port. */
const fetchHealth = async (app: App): Promise<BridgeHealth | null> => {
  try {
    const response = await fetch(`${bridgeUrl(app)}/health`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as BridgeHealth;
    return data.service === BRIDGE_SERVICE ? data : null;
  } catch {
    // Nothing is listening on that port, or it is not a Hydrilla Bridge.
    return null;
  }
};

/** True when that app's Hydrilla plugin has its Bridge running. */
export async function isAppListening(app: App): Promise<boolean> {
  return (await fetchHealth(app)) !== null;
}

export async function listListeningApps(): Promise<App[]> {
  const checks = await Promise.all(
    APPS.map(async (app) => ({ app, listening: await isAppListening(app) }))
  );
  return checks.filter((check) => check.listening).map((check) => check.app);
}

const postImport = async (app: App, body: Record<string, string | undefined>): Promise<Response> => {
  try {
    return await fetch(`${bridgeUrl(app)}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(IMPORT_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new BridgeError(
      `${APP_NAMES[app]} did not confirm the import (${reason}). It may still be importing; ask the user to check the app before sending the model again.`
    );
  }
};

const readBridgeError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `status ${response.status}`;
  } catch {
    // The plugin replied without a JSON body; the status code is all there is.
    return `status ${response.status}`;
  }
};

/** Hand a finished mesh to the app. The plugin downloads and imports it. */
export async function sendMeshToApp(
  app: App,
  mesh: { meshUrl: string; name?: string; taskId?: string }
): Promise<void> {
  if (!(await isAppListening(app))) {
    throw new BridgeError(
      `${APP_NAMES[app]} is not ready to receive models. ${BRIDGE_HINTS[app]} Then call hydrilla_send_to_app again with the same task_id; the model does not need to be generated again.`
    );
  }
  const response = await postImport(app, {
    mesh_url: mesh.meshUrl,
    name: mesh.name,
    job_id: mesh.taskId,
  });
  if (!response.ok) {
    throw new BridgeError(`${APP_NAMES[app]} could not import the model: ${await readBridgeError(response)}`);
  }
}

// ---- agent commands --------------------------------------------------------

const TOKEN_HEADER = "X-Hydrilla-Token";
/** Extra time over the Bridge's own wait, for the reply to travel back. */
const COMMAND_SLACK_MS = 5_000;

const UPDATE_HINTS: Partial<Record<App, string>> = {
  blender:
    "Ask the user to install the latest Hydrilla add-on from https://hydrilla.ai/integrations/blender (remove the old one first), restart Blender and click Run Bridge.",
};

/** What a plugin replies to a command: ok plus the command's own fields, or an error code and message. */
export type CommandReply = { ok: boolean; error?: string; message?: string } & Record<string, unknown>;

const tokenPath = (app: App): string => join(hydrillaConfigDir(), "bridge", `${app}.token`);

const readToken = async (app: App): Promise<string> => {
  try {
    return (await readFile(tokenPath(app), "utf8")).trim();
  } catch {
    // No file: the Bridge is off, or it could not write one.
    return "";
  }
};

const postCommand = async (
  app: App,
  token: string,
  body: { type: string; params: Record<string, unknown>; timeout: number }
): Promise<Response> => {
  try {
    return await fetch(`${bridgeUrl(app)}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", [TOKEN_HEADER]: token },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(body.timeout * 1000 + COMMAND_SLACK_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new BridgeError(
      `${APP_NAMES[app]} did not answer (${reason}). It may still be running the command; check the scene before sending it again.`
    );
  }
};

const readCommandReply = async (response: Response): Promise<CommandReply> => {
  try {
    const data = (await response.json()) as CommandReply;
    return response.ok ? data : { ...data, ok: false };
  } catch {
    // The plugin replied without a JSON body; the status code is all there is.
    return { ok: false, error: "bad_reply", message: `status ${response.status}` };
  }
};

/**
 * Run one command in the app's open session, on its main thread, and return
 * the plugin's reply. Throws a BridgeError the agent can act on when the app
 * is not reachable or its plugin does not take commands.
 */
export async function runAppCommand(
  app: App,
  type: string,
  params: Record<string, unknown>,
  timeoutSeconds: number
): Promise<CommandReply> {
  const health = await fetchHealth(app);
  if (!health) {
    throw new BridgeError(`${APP_NAMES[app]} is not connected. ${BRIDGE_HINTS[app]}`);
  }
  const commands = Array.isArray(health.commands) ? health.commands : [];
  if (!commands.includes(type)) {
    throw new BridgeError(
      `The Hydrilla plugin in ${APP_NAMES[app]} does not take agent commands yet (it is an older version, or its Bridge could not write its token file). ${UPDATE_HINTS[app] ?? ""}`.trim()
    );
  }
  const body = { type, params, timeout: timeoutSeconds };
  const first = await postCommand(app, await readToken(app), body);
  // The Bridge makes a new token each time it starts; read the file again once.
  const response = first.status === 401 ? await postCommand(app, await readToken(app), body) : first;
  if (response.status === 401) {
    throw new BridgeError(
      `${APP_NAMES[app]} rejected the session token in ${tokenPath(app)}. Ask the user to click Stop Bridge and then Run Bridge in the Hydrilla panel, and try again.`
    );
  }
  return readCommandReply(response);
}
