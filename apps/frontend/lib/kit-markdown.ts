import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/lib/seo";

const KIT_PAGES = path.join(process.cwd(), "BUILD-KIT", "pages");

const ROUTE_FILES: Record<string, string> = {
  features: "features.md",
  bluefox: "bluefox.md",
  water: "water.md",
  "text-to-3d": "text-to-3d.md",
  "image-to-3d": "image-to-3d.md",
  integrations: "integrations.md",
  "integrations/blender": "integrations-blender.md",
  "integrations/unity": "integrations-unity.md",
  "integrations/unreal": "integrations-unreal.md",
  "integrations/godot": "integrations-godot.md",
  "integrations/mcp": "integrations-mcp.md",
  api: "api.md",
  pricing: "pricing.md",
  solutions: "solutions.md",
  "solutions/games": "solutions-games.md",
  "solutions/film": "solutions-film.md",
  "solutions/architecture": "solutions-architecture.md",
  "solutions/xr": "solutions-xr.md",
  "solutions/product": "solutions-product.md",
  enterprise: "enterprise.md",
  docs: "docs.md",
  faq: "faq.md",
  blog: "blog.md",
  "blog/reference-images": "blog-reference-images.md",
  "blog/import-ai-meshes": "blog-import-ai-meshes.md",
  changelog: "changelog.md",
  compare: "compare.md",
  "compare/meshy": "compare-meshy.md",
  "compare/tripo": "compare-tripo.md",
  "compare/hyper3d": "compare-hyper3d.md",
  "compare/trellis": "compare-trellis.md",
  "compare/sloyd": "compare-sloyd.md",
  "compare/how-to-choose": "compare-how-to-choose.md",
  about: "about.md",
  research: "research.md",
  team: "team.md",
  careers: "careers.md",
  contact: "contact.md",
  security: "security.md",
};

function absolutize(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
    return href;
  }
  if (href.startsWith("/")) return `${SITE_URL}${href}`;
  return href;
}

function convertCopy(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    if (/^\*\*\[Section[^\]]*\]\*\*$/.test(trimmed)) continue;
    if (/^(Visual:|Alt text)/.test(trimmed)) continue;
    if (/^Logo row \(/.test(trimmed)) continue;
    if (/^Diagram \(/.test(trimmed)) continue;
    if (/^Screenshots:/.test(trimmed)) continue;
    if (/^Asset grid labels:/.test(trimmed)) continue;
    if (/^Copy buttons:/.test(trimmed)) continue;
    if (/^Form fields:/.test(trimmed)) continue;
    if (/^Form submit:/.test(trimmed)) continue;
    if (/^Toggle:/.test(trimmed)) continue;
    if (/^Monthly view$/.test(trimmed) || /^Hourly view$/.test(trimmed)) continue;
    if (/^Person \d+:/.test(trimmed)) {
      out.push(`- ${trimmed.replace(/^Person \d+:\s*/, "")}`);
      continue;
    }
    let next = trimmed
      .replace(/^\*\*(.+)\*\*$/, "$1")
      .replace(/^Eyebrow:\s*/, "")
      .replace(/^Kicker:\s*/, "")
      .replace(/^Close line:\s*/, "")
      .replace(/^Date line:\s*/, "")
      .replace(/^Spec line:\s*/, "")
      .replace(/^Note:\s*/, "")
      .replace(/^Button:\s*/, "")
      .replace(/^Card \d+ title:\s*/, "")
      .replace(/^Card \d+ line:\s*/, "")
      .replace(/^Card \d+ date:\s*/, "")
      .replace(/^Sign-in \(anchor #[^)]+\):\s*/, "")
      .replace(/^Diagram labels:\s*/, "")
      .replace(/\s·\sBadge:\s*/, " · ");
    next = next.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => `[${text}](${absolutize(href)})`);
    out.push(next);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function kitPageMarkdown(slug: string): string | null {
  const file = ROUTE_FILES[slug];
  if (!file) return null;
  const full = path.join(KIT_PAGES, file);
  if (!fs.existsSync(full)) return null;
  const md = fs.readFileSync(full, "utf8");
  const match = md.match(/<!-- COPY:START -->([\s\S]*?)<!-- COPY:END -->/);
  if (!match) return null;
  const body = match[1].trim();
  if (body.startsWith("No copy change")) return null;
  return convertCopy(match[1]);
}

export function legalPageMarkdown(slug: "privacy" | "terms" | "cookies"): string {
  const file = path.join(process.cwd(), "app", slug, "page.tsx");
  const source = fs.readFileSync(file, "utf8");
  const text = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{`[\s\S]*?`\}/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/\{[^}]+\}/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 40 && !line.includes("import ") && !line.includes("className"));
  const title = slug === "privacy" ? "Privacy Policy" : slug === "terms" ? "Terms of Service" : "Cookie Policy";
  return `# ${title}\n\n${text.join("\n\n")}\n`;
}
