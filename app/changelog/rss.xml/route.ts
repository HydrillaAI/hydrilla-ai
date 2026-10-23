import { CHANGELOG } from "@/lib/changelog";
import { SITE } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-static";

export function GET() {
  const items = CHANGELOG.map(
    (entry) => `    <item>
      <title>${escapeXml(`Hydrilla ${entry.version}`)}</title>
      <link>${SITE.docsUrl}/changelog#${entry.version}</link>
      <guid isPermaLink="false">${escapeXml(`hydrilla-${entry.version}-${entry.date}`)}</guid>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <description>${escapeXml(entry.items.join(" "))}</description>
    </item>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hydrilla API Changelog</title>
    <link>${SITE.docsUrl}/changelog</link>
    <description>Release notes for the Hydrilla API.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
