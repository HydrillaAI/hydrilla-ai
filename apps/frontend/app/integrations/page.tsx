import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow, PickleLinkCards, type PickleLinkItem } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Integrations: Blender, Maya, 3ds Max, Unity, Unreal, Godot | Hydrilla AI",
  description:
    "Send Hydrilla models into Blender, Maya, 3ds Max, Unity, Unreal, and Godot through plugins and the local Bridge, or connect AI agents over MCP and code over REST.",
  ogTitle: "Hydrilla integrations",
  path: "/integrations",
  absoluteTitle: true,
  keywords: [
    "best AI 3D plugin",
    "AI 3D plugin for Blender",
    "AI 3D plugin for Maya",
    "AI 3D plugin for 3ds Max",
    "AI 3D plugin for Unity",
    "AI 3D plugin for Unreal Engine",
    "AI 3D plugin for Godot 4",
    "MCP server for 3D generation",
    "3D DCC bridge",
  ],
});

const TOOL_CARDS = [
  {
    title: "Blender",
    tileLabel: "Blender",
    tileDetail: "Add-on",
    href: "/integrations/blender",
    line: "Generation in a sidebar tab, plus models sent from Studio.",
  },
  {
    title: "Maya",
    tileLabel: "Maya",
    tileDetail: "Hydrilla window",
    href: "/integrations/maya",
    line: "Generation and GLB import in the open Maya scene.",
  },
  {
    title: "3ds Max",
    tileLabel: "3ds Max",
    tileDetail: "Hydrilla window",
    href: "/integrations/3dsmax",
    line: "Generation and GLB import in the open 3ds Max scene.",
  },
  {
    title: "Unity",
    tileLabel: "Unity",
    tileDetail: "Editor window",
    href: "/integrations/unity",
    line: "Generation and GLB import inside the Unity Editor.",
  },
  {
    title: "Unreal Engine",
    tileLabel: "Unreal Engine",
    tileDetail: "Python plugin",
    href: "/integrations/unreal",
    line: "A Python editor plugin for generation and import.",
  },
  {
    title: "Godot",
    tileLabel: "Godot",
    tileDetail: "Godot 4 dock",
    href: "/integrations/godot",
    line: "A Godot 4 editor dock that generates and receives.",
  },
  {
    title: "MCP server",
    tileLabel: "MCP server",
    tileDetail: "stdio",
    href: "/integrations/mcp",
    line: "Your AI agent generates and places models in your open app.",
  },
  {
    title: "REST API",
    tileLabel: "REST API",
    tileDetail: "/v1/3d",
    href: "/api",
    line: "Generation jobs from your own code.",
  },
] satisfies PickleLinkItem[];

const MATRIX_ROWS = [
  ["Blender", "Yes", "Bridge", "API key"],
  ["Maya", "Yes", "Bridge", "API key"],
  ["3ds Max", "Yes", "Bridge", "API key"],
  ["Unity", "Yes", "Bridge", "API key"],
  ["Unreal Engine", "Yes", "Bridge", "API key"],
  ["Godot 4", "Yes", "Bridge", "API key"],
  ["MCP server", "Through your agent", "Sends to your open app", "API key"],
  ["REST API", "From your code", "No", "API key"],
] as const;

export default function IntegrationsPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title">Integrations</h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI connects to the tools you already run: plugins for Blender, Maya, 3ds Max, Unity, Unreal, and Godot, a local Bridge from Studio, and MCP and REST for custom pipelines.
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
          <div className="pickle-intro">
            <p>
              <strong>Generation is most useful when it happens next to the work.</strong> Each integration below brings Hydrilla into a tool your team already knows, so artists can generate, receive, and place models without leaving their scene, and engineers can wire generation into the systems around it.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">From Studio to your open scene</h2>
              <div className="pickle-text">
                <p>
                  The local Bridge runs on your machine and sends meshes from Studio, or from your AI agent, into Blender, Maya, 3ds Max, Unity, Unreal, or Godot. Click Run Bridge in a plugin, then use Send to DCC in Studio. The model arrives in the tool you have open, so you can review it in context, under your own lighting, at the moment you need it.
                </p>
              </div>
            </div>
            <PickleFlow
              label="Diagram: Hydrilla Studio or your AI agent, an arrow to the Bridge running locally in the plugin, and an arrow to the open scene."
              steps={[
                { title: "Studio or your agent", detail: "Send to DCC, or MCP" },
                { title: "Bridge on your machine", detail: "Run Bridge in the plugin" },
                { title: "Your open tool", detail: "Blender, Maya, 3ds Max, Unity, Unreal, or Godot", emphasis: true },
              ]}
            />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">One workspace, eight ways in</h2>
              <div className="pickle-text">
                <p>
                  Pick the integration that matches where the work happens. Artists usually start with a plugin; pipeline and tools teams reach for the API or MCP.
                </p>
              </div>
            </div>
            <PickleLinkCards items={TOOL_CARDS} columns={3} />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What each integration does</h2>
              <div className="pickle-text">
                <p>
                  Every plugin can generate inside the tool and receive models over the Bridge. Plugins import GLB, and every model can also be exported from Studio in GLB, FBX, OBJ, or USDZ for tools you connect by hand.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Tool</th>
                      <th>Generate in the tool</th>
                      <th>Receive from Studio</th>
                      <th>Authentication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_ROWS.map((row) => (
                      <tr key={row[0]}>
                        <th>{row[0]}</th>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
            <div id="sign-in" className="pickle-text scroll-mt-28">
              <p>
                Every plugin and the MCP server use a hyd_live_ API key from <Link href="/app/api-keys">API keys</Link>. There is no browser sign-in to keep open. Paste the key once in a plugin and the other Hydrilla plugins and the MCP server on that computer use it too, so it never goes into an AI chat.
              </p>
            </div>
          </section>
          <PickleCta line="Install the plugin for the tool you use most, and keep generation inside your scene." />
        </div>
      </article>
      <Footer />
    </>
  );
}
