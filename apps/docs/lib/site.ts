export const SITE = {
  name: "Hydrilla",
  titleName: "Hydrilla AI",
  docsUrl: "https://docs.hydrilla.ai",
  apiBaseUrl: "https://api.hydrilla.co",
  studioUrl: "https://hydrilla.co/app/studio",
  apiKeysUrl: "https://hydrilla.co/app/api-keys",
  versions: ["v1.0"] as string[],
  defaultVersion: "v1.0",
  statusUrl: process.env.NEXT_PUBLIC_STATUS_URL || "/api/status",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "",
};

export const API_KEY_PLACEHOLDER = "hyd_live_your_api_key_here";

export function maskKey(key: string): string {
  if (!key) return "hyd_live_••••••••••••";
  const tail = key.length > 4 ? key.slice(-4) : "";
  return `hyd_live_••••••••${tail}`;
}

export function titleFor(slug: string): string {
  if (slug === "/introduction") return "Introduction · Hydrilla API Docs";
  return `${slug} · Hydrilla API Docs`;
}

export function docTitle(heading: string): string {
  return `${heading} · Hydrilla API Docs`;
}
