import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { McpSetup } from "@/components/integrations/McpSetup";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "MCP Server for AI 3D Generation | Hydrilla AI",
  description:
    "Connect Claude Code, Cursor, Codex, and other MCP clients to Hydrilla so your agent can generate 3D models from text or images.",
  ogTitle: "Hydrilla MCP server",
  path: "/integrations/mcp",
  absoluteTitle: true,
  keywords: [
    "MCP server 3D generation",
    "Model Context Protocol 3D AI",
    "Cursor 3D MCP plugin",
    "Claude Code 3D MCP",
    "best AI 3D plugin",
  ],
});

export default function McpIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/mcp")} />
      <article className="pickle-article pickle-article--setup">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title">MCP</h1>
          <p className="pickle-article-subtitle">
            Use Hydrilla from the agent or app you already work in. Requires Pro plan or above.
          </p>
        </header>
        <div className="pickle-article-column">
          <McpSetup />
        </div>
      </article>
      <Footer />
    </>
  );
}
