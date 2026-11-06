import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCode, PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "MCP Server for AI 3D Generation | Hydrilla AI",
  description:
    "Connect an MCP client to Hydrilla so your AI agent can generate 3D models from text or images with BlueFox through the REST API.",
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

const MCP_CONFIG = `{
  "mcpServers": {
    "hydrilla": {
      "command": "node",
      "args": ["/absolute/path/to/plugins/mcp/dist/index.js"],
      "env": {
        "HYDRILLA_API_KEY": "hyd_live_…"
      }
    }
  }
}`;

export default function McpIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/mcp")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla MCP server
          </h1>
          <div className="pickle-lead">
            <p>
              Let AI agents generate 3D through Hydrilla over MCP. Hydrilla&apos;s MCP server calls the{" "}
              <Link href="/api">REST API</Link>{" "}on an agent&apos;s behalf, running locally over stdio for Cursor, Claude Code, and other MCP clients.
            </p>
          </div>
          <div className="pickle-actions">
            <Link href="/app/api-keys" className="pickle-pill-solid">
              Get an API key
            </Link>
            <Link href="/docs" className="pickle-pill-ghost">
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* Copied from plugins/mcp/README.md. Not a new sample. */}
          <PickleCode
            label="Code block showing an MCP client configuration entry for the Hydrilla server, with the API key set as an environment variable."
            panes={[{ title: "MCP client configuration", code: MCP_CONFIG }]}
          />

          <div className="pickle-intro">
            <p>
              Your agent describes the asset, and the server handles the job <strong>from submission to the finished files</strong>. It suits developers and technical artists who already work with an AI coding agent and want 3D generation available as one more tool it can call.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Install</h2>
            <div className="pickle-text">
              <p>Setup takes three steps, and the server runs on your own machine.</p>
              <ol className="pickle-steps">
                <li>
                  Download the MCP package,{" "}
                  <a href="/plugins/hydrilla-mcp.zip">hydrilla-mcp.zip</a>, from this page.
                </li>
                <li>Set HYDRILLA_API_KEY to your hyd_live_ key in the server&apos;s environment.</li>
                <li>Register the server in your MCP client, following the integration guide, then restart the client.</li>
              </ol>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What happens when your agent asks for a model</h2>
            <div className="pickle-text">
              <p>
                The agent sends a request to the server in plain language. The server submits a generation job, follows its status, and returns the finished files to the agent, so the agent can place them in a project or report back to you.
              </p>
              <p>
                The MCP server needs REST API access, included with Pro. <Link href="/pricing">Plans</Link>
              </p>
            </div>
          </section>

          <PickleCta
            title="Looking for an agent inside Hydrilla?"
            line={
              <>
                The MCP server is for your own agent. If you want an agent that plans and builds whole sets with you inside Hydrilla,{" "}
                <Link href="/water">see Water Agent</Link>.
              </>
            }
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
