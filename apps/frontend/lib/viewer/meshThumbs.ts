/**
 * Front-view mesh renders for library cards, shared by the workspace library and /app/assets
 * so a model shows the same picture everywhere. A cloud job's server preview is its input
 * photo, so we render the GLB once (renderLibraryMeshSnapshot) and keep it for the session.
 */

const MESH_THUMB_STORAGE = "hydrilla.meshThumbs.front";
const MESH_THUMB_LIMIT = 48;

export function readMeshThumbs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(MESH_THUMB_STORAGE);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function writeMeshThumb(jobId: string, url: string) {
  if (typeof window === "undefined" || !url) return;
  try {
    const map = readMeshThumbs();
    map[jobId] = url;
    const ids = Object.keys(map);
    if (ids.length > MESH_THUMB_LIMIT) {
      for (const id of ids.slice(0, ids.length - MESH_THUMB_LIMIT)) delete map[id];
    }
    window.sessionStorage.setItem(MESH_THUMB_STORAGE, JSON.stringify(map));
  } catch {
    /* quota — the in-memory cache still covers this session */
  }
}
