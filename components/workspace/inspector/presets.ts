import type { PartMaterial, ViewerEnvLighting, ViewerLook, ViewerMaterialType } from "@/lib/viewer/look";

type Finish = Pick<ViewerLook, "roughness" | "metalness" | "reflections" | "clearcoat">;

/** Model-wide surface finishes. They change how light reads, never the model's colors. */
export const FINISH_PRESETS: { id: string; label: string; finish: Finish }[] = [
  { id: "authored", label: "Authored", finish: { roughness: null, metalness: null, reflections: 1, clearcoat: 0 } },
  { id: "matte", label: "Matte", finish: { roughness: 0.92, metalness: 0, reflections: 0.6, clearcoat: 0 } },
  { id: "satin", label: "Satin", finish: { roughness: 0.55, metalness: 0, reflections: 1, clearcoat: 0 } },
  { id: "gloss", label: "Gloss", finish: { roughness: 0.2, metalness: 0, reflections: 1.2, clearcoat: 0.6 } },
  { id: "metal", label: "Metal", finish: { roughness: 0.35, metalness: 1, reflections: 1.2, clearcoat: 0 } },
  { id: "chrome", label: "Chrome", finish: { roughness: 0.05, metalness: 1, reflections: 1.6, clearcoat: 0 } },
];

export function finishMatches(look: ViewerLook, finish: Finish) {
  const near = (a: number | null, b: number | null) => (a == null || b == null ? a === b : Math.abs(a - b) < 0.011);
  return (
    near(look.roughness, finish.roughness) &&
    near(look.metalness, finish.metalness) &&
    near(look.reflections, finish.reflections) &&
    near(look.clearcoat, finish.clearcoat)
  );
}

/** Per-part materials: color and finish together. */
export const PART_PRESETS: { id: string; label: string; material: PartMaterial }[] = [
  { id: "porcelain", label: "Porcelain", material: { color: "#f2efe9", roughness: 0.25, metalness: 0 } },
  { id: "clay", label: "Clay", material: { color: "#c9c1b6", roughness: 0.9, metalness: 0 } },
  { id: "terracotta", label: "Terracotta", material: { color: "#b5603f", roughness: 0.75, metalness: 0 } },
  { id: "graphite", label: "Graphite", material: { color: "#3b3b3f", roughness: 0.6, metalness: 0 } },
  { id: "obsidian", label: "Obsidian", material: { color: "#0e0e10", roughness: 0.08, metalness: 0 } },
  { id: "chrome", label: "Chrome", material: { color: "#dcdde0", roughness: 0.06, metalness: 1 } },
  { id: "gold", label: "Gold", material: { color: "#d6a54a", roughness: 0.22, metalness: 1 } },
  { id: "copper", label: "Copper", material: { color: "#b8714a", roughness: 0.3, metalness: 1 } },
];

export function partMatches(a: PartMaterial, b: PartMaterial) {
  return (
    a.color.toLowerCase() === b.color.toLowerCase() &&
    Math.abs(a.roughness - b.roughness) < 0.011 &&
    Math.abs(a.metalness - b.metalness) < 0.011
  );
}

/** Previews mirror the viewer's shading modes (see deriveMaterial in ThreeViewer). */
export const SHADING_PRESETS: { value: ViewerMaterialType; label: string; preview: string }[] = [
  {
    value: "standard",
    label: "PBR",
    preview:
      "radial-gradient(circle at 33% 27%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 38% 32%, #d4d4d8 0%, #9ca3af 46%, #3f3f46 100%)",
  },
  {
    value: "matcap",
    label: "Matcap",
    preview: "radial-gradient(circle at 40% 35%, #ffffff 0%, #b0b0b0 40%, #707070 70%, #404040 100%)",
  },
  {
    value: "toon",
    label: "Toon",
    preview: "radial-gradient(circle at 38% 32%, #ffffff 0 20%, #c7c7cc 20% 46%, #8e8e96 46% 72%, #3f3f48 72%)",
  },
  {
    value: "lambert",
    label: "Lambert",
    preview: "radial-gradient(circle at 36% 30%, #e4e4e7 0%, #a1a1aa 55%, #52525b 100%)",
  },
  {
    value: "normal",
    label: "Normals",
    preview:
      "radial-gradient(circle at 50% 50%, #8a8aff 0 18%, rgba(128,128,255,0) 66%), linear-gradient(135deg, #7fffb2 0%, #8080ff 52%, #ff86c8 100%)",
  },
];

/** Tiles hint at each rig: studio is a soft top light, neutral is flat, outdoor is warm sky. */
export const LIGHT_PRESETS: { value: ViewerEnvLighting; label: string; backdrop: string; sphere: string }[] = [
  {
    value: "studio",
    label: "Studio",
    backdrop: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #e7e5e4 60%, #d6d3d1 100%)",
    sphere: "radial-gradient(circle at 40% 25%, #ffffff 0%, #d4d4d8 38%, #71717a 100%)",
  },
  {
    value: "neutral",
    label: "Neutral",
    backdrop: "linear-gradient(180deg, #f4f4f5 0%, #e4e4e7 100%)",
    sphere: "radial-gradient(circle at 42% 36%, #e4e4e7 0%, #a1a1aa 60%, #71717a 100%)",
  },
  {
    value: "outdoor",
    label: "Outdoor",
    backdrop: "linear-gradient(180deg, #bfdbfe 0%, #e0f2fe 55%, #f5e6cf 56%, #e9d5b5 100%)",
    sphere: "radial-gradient(circle at 36% 26%, #fffbeb 0%, #e7d8bd 36%, #7c6f5a 100%)",
  },
];

export const BACKDROP_SWATCHES: { label: string; color: string }[] = [
  { label: "White", color: "#ffffff" },
  { label: "Paper", color: "#f4f4f4" },
  { label: "Stone", color: "#e7e5e4" },
  { label: "Slate", color: "#94a3b8" },
  { label: "Charcoal", color: "#27272a" },
  { label: "Black", color: "#0a0a0a" },
];

/** Common prime focal lengths (full-frame mm) inside the viewer's FOV range. */
export const FOCAL_STOPS = [18, 24, 35, 50] as const;
