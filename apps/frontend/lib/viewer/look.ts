/**
 * Viewer look + part materials shared by ThreeViewer (Cloud GLB) and the Water sandbox.
 * The sandbox cannot import this module, so it receives `ResolvedViewerLook` numbers only.
 */

export type ViewerEnvLighting = "studio" | "outdoor" | "neutral";
export type ViewerMaterialType = "standard" | "matcap" | "toon" | "lambert" | "normal";
export type ViewerCameraMode = "perspective" | "isometric";
/** "overlay" draws edges over the shaded surface; "only" swaps the surface for wire. */
export type ViewerWireframeStyle = "overlay" | "only";
/** The app's color theme. The viewer follows it unless the artist picks a backdrop color. */
export type ViewerTheme = "light" | "dark";
/** Fixed camera directions; "reset" is the ¾ framing used on load. */
export type ViewerCameraPreset = "front" | "side" | "top" | "reset";
/** One-shot camera moves requested from the inspector; "selection" frames the selected part. */
export type ViewerCameraView = ViewerCameraPreset | "selection";

export type ViewerLook = {
  lighting: ViewerEnvLighting;
  lightIntensity: number;
  brightness: number;
  /** Turns the light rig and environment reflections around the model, in degrees. */
  lightRotation: number;
  background: boolean;
  /** Backdrop color when `background` is on, or "auto" to follow the theme. */
  backgroundColor: string;
  /** Set by the page from the app theme; never saved with the studio setup. */
  theme: ViewerTheme;
  grid: boolean;
  shadow: boolean;
  autoRotate: boolean;
  materialType: ViewerMaterialType;
  /** Model-wide PBR overrides; null keeps each mesh's authored value. */
  roughness: number | null;
  metalness: number | null;
  /** Environment reflection strength (envMapIntensity). */
  reflections: number;
  clearcoat: number;
  wireframe: boolean;
  wireframeStyle: ViewerWireframeStyle;
  cameraMode: ViewerCameraMode;
  /** Vertical field of view in degrees (perspective only). */
  fov: number;
};

export const FOV_RANGE = { min: 20, max: 80 } as const;

/** Full-frame sensor height in mm; `fov` is vertical, so focal length maps against it. */
const SENSOR_HEIGHT_MM = 24;

export function focalLengthFromFov(fovDeg: number): number {
  return SENSOR_HEIGHT_MM / 2 / Math.tan((fovDeg * Math.PI) / 360);
}

export function fovFromFocalLength(mm: number): number {
  return (Math.atan(SENSOR_HEIGHT_MM / 2 / Math.max(mm, 1)) * 360) / Math.PI;
}

export type LightRig = { ambient: number; hemi: number; key: number; fill: number; rim: number };

const LIGHTING_PRESETS: Record<
  ViewerEnvLighting,
  { rig: LightRig; lightIntensity: number; brightness: number }
> = {
  neutral: { rig: { ambient: 0.4, hemi: 0.5, key: 1.0, fill: 0.3, rim: 0.2 }, lightIntensity: 1, brightness: 1 },
  studio: { rig: { ambient: 0.6, hemi: 0.55, key: 1.2, fill: 0.35, rim: 0.25 }, lightIntensity: 1.2, brightness: 1.15 },
  outdoor: { rig: { ambient: 0.7, hemi: 0.6, key: 1.4, fill: 0.4, rim: 0.3 }, lightIntensity: 1.4, brightness: 1.25 },
};

export const DEFAULT_VIEWER_LOOK: ViewerLook = {
  lighting: "studio",
  lightIntensity: LIGHTING_PRESETS.studio.lightIntensity,
  brightness: LIGHTING_PRESETS.studio.brightness,
  lightRotation: 0,
  background: true,
  backgroundColor: "auto",
  theme: "light",
  grid: false,
  shadow: true,
  autoRotate: false,
  materialType: "standard",
  roughness: null,
  metalness: null,
  reflections: 1,
  clearcoat: 0,
  wireframe: false,
  wireframeStyle: "overlay",
  cameraMode: "perspective",
  fov: 40,
};

export const DEFAULT_PBR: Pick<ViewerLook, "roughness" | "metalness" | "reflections" | "clearcoat"> = {
  roughness: DEFAULT_VIEWER_LOOK.roughness,
  metalness: DEFAULT_VIEWER_LOOK.metalness,
  reflections: DEFAULT_VIEWER_LOOK.reflections,
  clearcoat: DEFAULT_VIEWER_LOOK.clearcoat,
};

/** Switching preset resets intensity/exposure to that preset unless the patch sets them. */
export function applyLookPatch(prev: ViewerLook, patch: Partial<ViewerLook>): ViewerLook {
  const next = { ...prev, ...patch };
  if (patch.lighting && patch.lighting !== prev.lighting) {
    const preset = LIGHTING_PRESETS[patch.lighting];
    next.lightIntensity = patch.lightIntensity ?? preset.lightIntensity;
    next.brightness = patch.brightness ?? preset.brightness;
  }
  return next;
}

export type ResolvedViewerLook = {
  exposure: number;
  background: string | null;
  grid: boolean;
  shadow: boolean;
  autoRotate: boolean;
  /** Surface drawn as wire (material wireframe). */
  wireframe: boolean;
  /** Edge color drawn over the shaded surface, or null when the overlay is off. */
  wireOverlay: string | null;
  /** Lightness of what sits behind the model; chrome drawn over the canvas follows it. */
  tone: ViewerTheme;
  /** Grid lines and contact shadow tuned to the backdrop's lightness. */
  stage: { gridColor: string; gridOpacity: number; shadowOpacity: number };
  /** Rig + environment yaw in radians. */
  lightRotation: number;
  lights: LightRig;
  camera: { ortho: boolean; fov: number; frustum: number };
  materialType: ViewerMaterialType;
  pbr: { roughness: number | null; metalness: number | null; reflections: number; clearcoat: number };
};

export const VIEWER_BACKGROUND = "#ffffff";

/** Backdrop per theme when the artist leaves it on "auto": the light canvas, and a lifted graphite. */
export const THEME_BACKDROP: Record<ViewerTheme, string> = { light: "#ffffff", dark: "#111114" };

/** The backdrop color the viewer actually shows for this look (theme-resolved). */
export function backdropColorOf(look: Pick<ViewerLook, "backgroundColor" | "theme">): string {
  if (look.backgroundColor === "auto") return THEME_BACKDROP[look.theme];
  return toHexColor(look.backgroundColor) ?? THEME_BACKDROP[look.theme];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Relative luminance of a `#rrggbb` color, 0 (black) to 1 (white). */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => decodeSrgb(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function resolveViewerLook(look: ViewerLook): ResolvedViewerLook {
  const scale = Math.max(0.3, Math.min(2, look.lightIntensity));
  const rig = LIGHTING_PRESETS[look.lighting].rig;
  const background = look.background ? backdropColorOf(look) : null;
  // A transparent backdrop shows the themed canvas behind it.
  const darkBackdrop = luminance(background ?? THEME_BACKDROP[look.theme]) < 0.2;
  // Silhouettes melt into dark backdrops; a stronger rim keeps the edge readable.
  const rimBoost = darkBackdrop ? 1.8 : 1;
  const overlay = look.wireframe && look.wireframeStyle === "overlay";
  return {
    exposure: look.brightness,
    background,
    grid: look.grid,
    shadow: look.shadow,
    autoRotate: look.autoRotate,
    wireframe: look.wireframe && look.wireframeStyle === "only",
    wireOverlay: overlay ? (darkBackdrop ? "#ffffff" : "#18181b") : null,
    tone: darkBackdrop ? "dark" : "light",
    stage: darkBackdrop
      ? { gridColor: "#ffffff", gridOpacity: 0.09, shadowOpacity: 0.42 }
      : { gridColor: "#000000", gridOpacity: 0.11, shadowOpacity: 0.16 },
    lightRotation: (((look.lightRotation % 360) + 360) % 360) * (Math.PI / 180),
    lights: {
      ambient: rig.ambient * scale,
      hemi: rig.hemi * scale,
      key: rig.key * scale,
      fill: rig.fill * scale,
      rim: rig.rim * scale * rimBoost,
    },
    camera: {
      ortho: look.cameraMode === "isometric",
      fov: Math.min(FOV_RANGE.max, Math.max(FOV_RANGE.min, look.fov)),
      frustum: 2.2,
    },
    materialType: look.materialType,
    pbr: {
      roughness: look.roughness == null ? null : clamp01(look.roughness),
      metalness: look.metalness == null ? null : clamp01(look.metalness),
      reflections: Math.min(3, Math.max(0, look.reflections)),
      clearcoat: clamp01(look.clearcoat),
    },
  };
}

export type PartMaterial = { color: string; roughness: number; metalness: number };
/** Keyed by mesh name. Only parts listed here are overridden; others keep their authored look. */
export type PartMaterialMap = Record<string, PartMaterial>;

export const DEFAULT_PART_MATERIAL: PartMaterial = { color: "#888888", roughness: 0.5, metalness: 0 };

function encodeSrgb(linear: number) {
  const c = clamp01(linear);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function decodeSrgb(encoded: number) {
  return encoded <= 0.04045 ? encoded / 12.92 : Math.pow((encoded + 0.055) / 1.055, 2.4);
}

function hexFromSrgb(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function parseChannel(token: string, percentScale = 1) {
  return token.endsWith("%") ? (parseFloat(token) / 100) * percentScale : parseFloat(token);
}

/**
 * Normalize picker output (hex, `oklch()`, `color(display-p3 …)`) to `#rrggbb`.
 * THREE.Color and the scene API only accept hex/sRGB.
 */
export function toHexColor(value: string): string | null {
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const h = hex[1];
    return h.length === 3 ? `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : `#${h.slice(0, 6)}`;
  }

  const oklch = v.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/);
  if (oklch) {
    const L = parseChannel(oklch[1]);
    const C = parseChannel(oklch[2], 0.4);
    const H = (parseFloat(oklch[3]) * Math.PI) / 180;
    const a = C * Math.cos(H);
    const b = C * Math.sin(H);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return hexFromSrgb(
      encodeSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      encodeSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      encodeSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    );
  }

  const p3 = v.match(/^color\(\s*display-p3\s+([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)\s*(?:\/\s*[\d.]+%?\s*)?\)$/);
  if (p3) {
    const [r, g, b] = [p3[1], p3[2], p3[3]].map((t) => decodeSrgb(parseChannel(t)));
    return hexFromSrgb(
      encodeSrgb(1.2249401 * r - 0.2249404 * g),
      encodeSrgb(-0.0420569 * r + 1.0420571 * g),
      encodeSrgb(-0.0196376 * r - 0.0786361 * g + 1.0982735 * b)
    );
  }

  return null;
}

/** Keep only well-formed entries (saved scene JSON, sandbox messages). */
export function sanitizePartMaterials(raw: unknown): PartMaterialMap {
  if (!raw || typeof raw !== "object") return {};
  const out: PartMaterialMap = {};
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!name || !value || typeof value !== "object") continue;
    const o = value as Record<string, unknown>;
    const color = typeof o.color === "string" ? toHexColor(o.color) : null;
    out[name] = {
      color: color ?? DEFAULT_PART_MATERIAL.color,
      roughness: typeof o.roughness === "number" ? clamp01(o.roughness) : DEFAULT_PART_MATERIAL.roughness,
      metalness: typeof o.metalness === "number" ? clamp01(o.metalness) : DEFAULT_PART_MATERIAL.metalness,
    };
  }
  return out;
}

/** Scene-tab fields an artist sets once and expects to find again next session. */
const STUDIO_KEYS = [
  "lighting",
  "lightIntensity",
  "brightness",
  "lightRotation",
  "background",
  "backgroundColor",
  "shadow",
  "grid",
  "cameraMode",
  "fov",
] as const satisfies readonly (keyof ViewerLook)[];

export type StudioSetup = Pick<ViewerLook, (typeof STUDIO_KEYS)[number]>;

export function studioSetupOf(look: ViewerLook): StudioSetup {
  return Object.fromEntries(STUDIO_KEYS.map((key) => [key, look[key]])) as StudioSetup;
}

/** Keep only well-formed, in-range studio fields from saved JSON. */
export function sanitizeStudioSetup(raw: unknown): Partial<StudioSetup> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: Partial<StudioSetup> = {};
  const num = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : undefined;
  if (o.lighting === "studio" || o.lighting === "neutral" || o.lighting === "outdoor") out.lighting = o.lighting;
  if (o.cameraMode === "perspective" || o.cameraMode === "isometric") out.cameraMode = o.cameraMode;
  const lightIntensity = num(o.lightIntensity, 0.3, 2);
  if (lightIntensity !== undefined) out.lightIntensity = lightIntensity;
  const brightness = num(o.brightness, 0.5, 2);
  if (brightness !== undefined) out.brightness = brightness;
  const lightRotation = num(o.lightRotation, 0, 360);
  if (lightRotation !== undefined) out.lightRotation = lightRotation;
  const fov = num(o.fov, FOV_RANGE.min, FOV_RANGE.max);
  if (fov !== undefined) out.fov = fov;
  if (typeof o.background === "boolean") out.background = o.background;
  if (typeof o.shadow === "boolean") out.shadow = o.shadow;
  if (typeof o.grid === "boolean") out.grid = o.grid;
  const backgroundColor =
    o.backgroundColor === "auto" ? "auto" : typeof o.backgroundColor === "string" ? toHexColor(o.backgroundColor) : null;
  if (backgroundColor) out.backgroundColor = backgroundColor;
  return out;
}
