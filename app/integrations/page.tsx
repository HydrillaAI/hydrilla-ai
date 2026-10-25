import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow, PickleLinkCards, type PickleLinkItem } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Integrations: Blender, Unity, Unreal, Godot | Hydrilla AI",
  description:
    "Send Hydrilla models into Blender, Unity, Unreal, and Godot through plugins and the local Bridge, or connect AI agents over MCP and code over REST.",
  ogTitle: "Hydrilla integrations",
  path: "/integrations",
  absoluteTitle: true,
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
    line: "Hydrilla generation for any MCP client.",
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
  ["Blender", "Yes", "Bridge", "Studio account or API key"],
  ["Unity", "Yes", "Bridge", "API key"],
  ["Unreal Engine", "Yes", "Bridge", "API key"],
  ["Godot 4", "Yes", "Bridge", "API key"],
  ["MCP server", "Through your agent", "No", "API key"],
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
              Hydrilla AI connects to the tools you already run: a Blender add-on, plugins for Unity, Unreal, and Godot, a local Bridge from Studio, and MCP and REST for custom pipelines.
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
                  The local Bridge runs on your machine and sends meshes from Studio into Blender, Unity, Unreal, or Godot. Start it from a plugin, then use Send to DCC in Studio. The model arrives in the tool you have open, so you can review it in context, under your own lighting, at the moment you need it.
                </p>
              </div>
            </div>
            <PickleFlow
              label="Diagram: Hydrilla Studio in the browser, an arrow to the Bridge running locally on port 7345, and an arrow to an open Blender scene."
              steps={[
                { title: "Studio", detail: "In your browser" },
                { title: "Bridge on your machine", detail: "127.0.0.1:7345" },
                { title: "Your open tool", detail: "Blender, Unity, Unreal, or Godot", emphasis: true },
              ]}
            />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">One workspace, six ways in</h2>
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
                      <th>Sign-in</th>
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
                The Blender add-on can use your Studio sign-in in the browser. Every plugin, and the MCP server, also accepts a hyd_live_ API key, created from your account.
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
