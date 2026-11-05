// Builds email/templates/*.mjml into email/dist/{ID_name}.html, .txt and .json.
// Run: node email/scripts/build.mjs [--strict]
// --strict turns warnings (including unfilled legal placeholders) into errors.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mjml2html from "mjml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

// Footer identity. Postal address is required in the footer of marketing mail (CAN-SPAM, GDPR).
const LEGAL_NAME = "Hydrilla AI Pvt Ltd";
const LEGAL_ADDRESS =
  "5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India";
const LOGO_URL = "https://hydrilla.ai/logo-hydrilla/hydrilla-email-logo.png";

const EMOJI =/\p{Extended_Pictographic}/u;
const BANNED = ["revolutionary", "seamless", "unlock", "game-changing", "supercharge"];

function parseTemplate(raw, file) {
  const m = raw.match(/^<!--\n([\s\S]*?)\n-->\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing metadata comment at top`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of ["id", "name", "layout", "kind", "sender", "topic", "trigger", "subject", "preheader", "footer_reason", "optional"]) {
    if (!(key in meta)) throw new Error(`${file}: metadata "${key}" is required`);
  }
  if (meta.sender !== "hi") throw new Error(`${file}: sender must be "hi"`);
  if (!["transactional", "campaign", "broadcast"].includes(meta.kind)) {
    throw new Error(`${file}: kind must be transactional, campaign or broadcast`);
  }
  if (meta.optional === "true" && meta.topic === "none") throw new Error(`${file}: optional mail needs a subscription topic`);
  return { meta, body: m[2] };
}

function lint(meta, body, file) {
  const issues = [];
  const text = `${meta.subject}\n${meta.preheader}\n${body}`;
  // Liquid in a subject renders short values, so count each {{ }} as 8 characters.
  const subjectLength = meta.subject.replace(/\{\{[^}]*\}\}/g, "x".repeat(8)).length;
  if (subjectLength > 50) issues.push(`subject is about ${subjectLength} characters, limit is 50`);
  if (EMOJI.test(text)) issues.push("contains emoji");
  // Liquid operators such as != are fine; only copy is checked.
  const copy = text.replace(/\{%[\s\S]*?%\}/g, "").replace(/\{\{[\s\S]*?\}\}/g, "");
  if (copy.includes("!")) issues.push("contains an exclamation mark");
  // Transactional templates get their data as trigger.*, campaigns as event.*.
  if (meta.kind === "transactional" && /\{\{[^}]*\bevent\./.test(body)) issues.push("transactional template uses event.* (use trigger.*)");
  if (meta.kind === "campaign" && /\{\{[^}]*\btrigger\./.test(body)) issues.push("campaign template uses trigger.* (use event.*)");
  for (const w of BANNED) if (text.toLowerCase().includes(w)) issues.push(`banned word "${w}"`);
  for (const [, expr] of text.matchAll(/\{\{([^}]*(?:customer|trigger|event)\.[^}]*)\}\}/g)) {
    if (!expr.includes("default")) issues.push(`Liquid variable without fallback: {{${expr.trim()}}}`);
    if (/\|\s*escape\b/.test(expr)) issues.push(`Customer.io's escape filter percent-encodes text, so spaces show as %20. Replace < and > instead: {{${expr.trim()}}}`);
  }
  return issues.map((i) => `${file}: ${i}`);
}

function footerPrefs(optional) {
  return optional
    ? ' <a href="{% manage_subscription_preferences_url %}">Email preferences</a> · <a href="{% unsubscribe_url %}">Unsubscribe</a>.'
    : "";
}

function toText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  return body
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<div[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<a\s[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const text = label.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!text) return "";
      return href.startsWith("mailto:") || href === text ? text : `${text} (${href})`;
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|tr)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#8202;|&zwnj;|&#847;|&#8199;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const files = (await readdir(join(root, "templates"))).filter((f) => f.endsWith(".mjml")).sort();
await mkdir(join(root, "dist"), { recursive: true });

const problems = [];
const warnings = [];
const manifest = [];

for (const file of files) {
  const { meta, body } = parseTemplate(await readFile(join(root, "templates", file), "utf8"), file);
  warnings.push(...lint(meta, body, file));

  const layout = await readFile(join(root, "layouts", `${meta.layout}.mjml`), "utf8");
  const source = layout
    .replaceAll("%%SUBJECT%%", meta.subject)
    .replaceAll("%%PREHEADER%%", meta.preheader)
    .replaceAll("%%HEADING%%", meta.heading ?? meta.subject)
    .replaceAll("%%LOGO_URL%%", LOGO_URL)
    .replaceAll("%%LEGAL_LINE%%", `${LEGAL_NAME}, ${LEGAL_ADDRESS}`)
    .replaceAll("%%FOOTER_REASON%%", meta.footer_reason)
    .replaceAll("%%FOOTER_PREFS%%", footerPrefs(meta.optional === "true"))
    .replaceAll("%%BODY%%", body);

  const { html, errors } = await mjml2html(source, { validationLevel: "soft" });
  for (const e of errors ?? []) problems.push(`${file}: ${e.formattedMessage ?? e.message}`);

  if (html.includes("%%")) problems.push(`${file}: unresolved %% token in output`);
  if (/\[[A-Z ]{6,}\]/.test(html)) warnings.push(`${file}: output still has a [PLACEHOLDER]`);

  const base = file.replace(/\.mjml$/, "");
  await writeFile(join(root, "dist", `${base}.html`), html);
  await writeFile(join(root, "dist", `${base}.txt`), toText(html) + "\n");
  await writeFile(join(root, "dist", `${base}.json`), JSON.stringify(meta, null, 2) + "\n");
  // The Customer.io Trigger Name is the file name, e.g. "T01_welcome".
  manifest.push({ ...meta, file: base });
  console.log(`built ${base}`);
}

await writeFile(join(root, "dist", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

for (const w of warnings) console.warn(`warning: ${w}`);
for (const p of problems) console.error(`error: ${p}`);
if (problems.length || (strict && warnings.length)) process.exit(1);
