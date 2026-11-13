import { API_KEYS_URL, SERVER_VERSION, resolveApiBase, resolveApiKey } from "./config.js";

export type Task = {
  id: string;
  object?: string;
  type?: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELLED" | string;
  progress?: number;
  status_message?: string | null;
  prompt?: string | null;
  error?: string | null;
  result?: { mesh_url?: string | null; preview_image_url?: string | null; format?: string } | null;
  /** Unix seconds. */
  created_at?: number;
};

const REQUEST_TIMEOUT_MS = 60_000;
/** Text-to-3D creates its concept image before the request returns. */
export const CREATE_TIMEOUT_MS = 240_000;
const POLL_INTERVAL_MS = 3_000;
/** Shortest timeout given to one status request, so a nearly spent wait still gets an answer. */
const MIN_POLL_TIMEOUT_MS = 10_000;
const MAX_POLL_FAILURES = 5;

const NO_KEY_MESSAGE =
  `No Hydrilla API key found. Ask the user to add their key in the Hydrilla plugin (for example the Hydrilla tab in Blender), ` +
  `or to set HYDRILLA_API_KEY in this MCP server's config. Keys are created at ${API_KEYS_URL}. ` +
  `Do not ask the user to paste the key into the chat.`;

const BAD_KEY_MESSAGE =
  `Hydrilla did not accept the API key. Ask the user to check it or create a new one at ${API_KEYS_URL}, ` +
  `then update it in the Hydrilla plugin or this MCP server's config. Do not ask for the key in the chat.`;

export class HydrillaError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "HydrillaError";
    this.status = status;
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function isTerminal(status: string): boolean {
  return status === "SUCCEEDED" || status === "FAILED" || status === "CANCELLED";
}

function messageFor(status: number, data: unknown): string {
  if (status === 401) {
    return BAD_KEY_MESSAGE;
  }
  const body = (data ?? {}) as { error?: { message?: string } | string; message?: string };
  const nested = typeof body.error === "object" ? body.error?.message : body.error;
  const fromBody = nested || body.message;
  if (fromBody) {
    return String(fromBody);
  }
  if (status === 402) {
    return "Not enough Hydrilla credits. The user can top up at hydrilla.ai.";
  }
  if (status === 429) {
    return "Too many requests to Hydrilla. Wait a moment and try again.";
  }
  if (status >= 500) {
    return `Hydrilla is having trouble right now (${status}). Try again shortly.`;
  }
  return `Hydrilla API request failed (${status}).`;
}

const fetchResponse = async (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new HydrillaError(`Could not reach the Hydrilla API at ${new URL(url).host}: ${reason}`);
  }
};

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A gateway error page or other non-JSON body; the status code carries the meaning.
    return {};
  }
};

export async function api<T>(path: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new HydrillaError(NO_KEY_MESSAGE, 401);
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Accept", "application/json");
  headers.set("User-Agent", `Hydrilla-MCP/${SERVER_VERSION}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchResponse(`${resolveApiBase()}${path}`, { ...init, headers }, timeoutMs);
  const data = await parseJson(response);
  if (!response.ok) {
    throw new HydrillaError(messageFor(response.status, data), response.status);
  }
  return data as T;
}

export const getTask = (taskId: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Task> =>
  api<Task>(`/v1/3d/tasks/${encodeURIComponent(taskId)}`, {}, timeoutMs);

const pollOnce = async (taskId: string, timeoutMs: number): Promise<Task | null> => {
  try {
    return await getTask(taskId, timeoutMs);
  } catch (error) {
    // A brief network or server hiccup should not lose a paid task.
    const retryable = error instanceof HydrillaError && (error.status === 0 || error.status >= 500);
    if (!retryable) {
      throw error;
    }
    return null;
  }
};

export type WaitOutcome = { task: Task; timedOut: boolean };

/**
 * Poll until the task finishes or the wait budget runs out. Always checks at
 * least once, and no request outlives the deadline by more than
 * MIN_POLL_TIMEOUT_MS. On timeout the task keeps running on Hydrilla and can
 * be checked again with its id.
 */
export async function waitForTask(
  taskId: string,
  maxWaitMs: number,
  onProgress: (task: Task) => Promise<void>
): Promise<WaitOutcome> {
  const deadline = Date.now() + maxWaitMs;
  const state: { polls: number; failures: number; last: Task } = {
    polls: 0,
    failures: 0,
    last: { id: taskId, status: "PENDING" },
  };

  while (state.polls === 0 || Date.now() < deadline) {
    state.polls += 1;
    const timeoutMs = Math.max(MIN_POLL_TIMEOUT_MS, Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now()));
    const task = await pollOnce(taskId, timeoutMs);
    if (task) {
      state.failures = 0;
      state.last = task;
      if (isTerminal(task.status)) {
        return { task, timedOut: false };
      }
      await onProgress(task);
    } else {
      state.failures += 1;
      if (state.failures > MAX_POLL_FAILURES) {
        throw new HydrillaError("Lost contact with Hydrilla while waiting. Check the task again with hydrilla_get_task.");
      }
    }
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await sleep(Math.min(POLL_INTERVAL_MS, remainingMs));
  }
  return { task: state.last, timedOut: true };
}
