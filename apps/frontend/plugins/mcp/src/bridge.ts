/**
 * Hydrilla Bridge: each Hydrilla plugin can listen on its own local port so a
 * finished model can be sent straight into the open scene or project.
 */

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

/** True when that app's Hydrilla plugin has its Bridge running. */
export async function isAppListening(app: App): Promise<boolean> {
  try {
    const response = await fetch(`${bridgeUrl(app)}/health`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { service?: string };
    return data.service === BRIDGE_SERVICE;
  } catch {
    // Nothing is listening on that port, or it is not a Hydrilla Bridge.
    return false;
  }
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
