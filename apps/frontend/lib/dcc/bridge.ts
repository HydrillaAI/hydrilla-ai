import { bridgeUrlFor } from "@/lib/integrations";

/**
 * Hydrilla Bridge: each plugin (Blender, Unity, …) can listen on its own
 * local port so Studio can send a model straight into the open scene.
 * The Bridge only receives meshes; no account data or tokens are sent to it.
 */

const BRIDGE_SERVICE = "hydrilla-bridge";
const HEALTH_TIMEOUT_MS = 1500;

export type BridgeHealth = {
  ok: boolean;
  service?: string;
  app?: string;
  version?: string;
};

/** True when a Hydrilla plugin is listening on that port. */
export async function isBridgeOnline(port: number): Promise<boolean> {
  try {
    const response = await fetch(`${bridgeUrlFor(port)}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return false;
    }
    const health = (await response.json()) as BridgeHealth;
    return health.ok === true && health.service === BRIDGE_SERVICE;
  } catch {
    // Nothing is listening on that port: the app is closed or its Bridge is off.
    return false;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // Converted in chunks: spreading a whole mesh into one call overflows the stack.
  const chunk = 0x8000;
  const parts = Array.from({ length: Math.ceil(bytes.length / chunk) }, (_unused, index) =>
    String.fromCharCode(...bytes.subarray(index * chunk, (index + 1) * chunk))
  );
  return btoa(parts.join(""));
}

/**
 * Download the GLB in the browser (Studio mesh links may need the signed-in
 * session) and push the bytes to the plugin listening on `port`.
 */
export async function sendGlbBytesToBridge(options: {
  port: number;
  meshUrl: string;
  name?: string;
  jobId?: string;
  getToken?: () => Promise<string | null>;
}): Promise<void> {
  const token = options.getToken ? await options.getToken() : null;
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(options.meshUrl, {
    headers,
    credentials: token ? "include" : "omit",
  });
  if (!response.ok) {
    throw new Error(`Could not download mesh for Bridge (${response.status})`);
  }
  const fileBase64 = arrayBufferToBase64(await response.arrayBuffer());

  const importResponse = await fetch(`${bridgeUrlFor(options.port)}/import-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      file_base64: fileBase64,
      name: options.name,
      job_id: options.jobId,
    }),
  });
  if (!importResponse.ok) {
    const text = await importResponse.text();
    throw new Error(text || `Bridge import failed (${importResponse.status})`);
  }
}
