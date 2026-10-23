export type ChangeTag = "New" | "Improved" | "Fixed" | "Breaking";

export interface ChangeEntry {
  version: string;
  date: string;
  tags: ChangeTag[];
  items: string[];
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "v1.0",
    date: "2026-09-30",
    tags: ["New"],
    items: [
      "First public release of the Hydrilla API.",
      "Text to 3D and Image to 3D generation with cascade mesh resolution.",
      "Tasks and polling endpoint for asynchronous jobs.",
      "2D concept generation and image editing.",
    ],
  },
];

export const TAG_STYLE: Record<ChangeTag, { bg: string; fg: string }> = {
  New: { bg: "var(--bg-muted)", fg: "var(--text)" },
  Improved: { bg: "var(--bg-muted)", fg: "var(--text)" },
  Fixed: { bg: "var(--bg-muted)", fg: "var(--text-2)" },
  Breaking: { bg: "color-mix(in srgb, var(--danger) 12%, transparent)", fg: "var(--danger)" },
};
