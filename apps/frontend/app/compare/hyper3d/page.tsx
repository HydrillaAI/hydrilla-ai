import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla vs Hyper3D Rodin: Facts Side by Side | Hydrilla AI",
  description:
    "How Hydrilla with BlueFox and Hyper3D's Rodin compare on inputs, outputs, exports, integrations, and API. Facts from both sites, dated.",
  ogTitle: "Hydrilla vs Hyper3D",
  path: "/compare/hyper3d",
  absoluteTitle: true,
  keywords: [
    "Hydrilla vs Hyper3D",
    "Hydrilla vs Rodin",
    "Hyper3D Rodin alternative",
    "BlueFox vs Rodin",
    "best 3D AI generator",
  ],
});

export default function CompareHyper3dPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/hyper3d")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How does Hydrilla compare to Hyper3D?
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI and Hyper3D build separate 3D models. Hydrilla uses BlueFox, Hydrilla&apos;s 3D model, and Hyper3D runs Rodin. Both accept text or images; their exports, plugins, and plans differ.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Checked 24 Oct 2026</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              For a studio, those differences decide <strong>how an asset moves from generation into production</strong>. The table sets them out from each company&apos;s public pages, and the sections after it describe where each product tends to fit.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Side by side</h2>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Hydrilla</th>
                      <th>Hyper3D (confirm on hyper3d.ai)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Model</th>
                      <td><Link href="/bluefox">BlueFox 1</Link></td>
                      <td>Rodin; its site names Gen-2.5</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>Text, or a reference image</td>
                      <td>Image, text, and multi-image</td>
                    </tr>
                    <tr>
                      <th>Result</th>
                      <td>Segmented mesh carrying PBR maps</td>
                      <td>Textured mesh, with parts and low-poly options listed</td>
                    </tr>
                    <tr>
                      <th>Exports</th>
                      <td>Four formats, listed on <Link href="/features#exports">exports</Link></td>
                      <td>STL, FBX, OBJ, GLB, glTF, and USDZ, per its FAQ</td>
                    </tr>
                    <tr>
                      <th>Plugins</th>
                      <td>Plugins for four tools, through a <Link href="/integrations">local Bridge</Link></td>
                      <td>Blender, Unity, Unreal, Godot, Maya, 3ds Max, and ComfyUI</td>
                    </tr>
                    <tr>
                      <th>API and MCP</th>
                      <td>REST jobs and an MCP server, see <Link href="/api">API</Link></td>
                      <td>API and MCP, both listed in its navigation</td>
                    </tr>
                    <tr>
                      <th>Plans</th>
                      <td>Credits, a Free plan, and a published cost per model</td>
                      <td>Free, Creator, Business, and Enterprise tiers</td>
                    </tr>
                    <tr>
                      <th>Team features</th>
                      <td>Seats and API concurrency through Enterprise</td>
                      <td>Multi-team management, shared workspace, and compliance, per its homepage</td>
                    </tr>
                    <tr>
                      <th>AI 3D agent</th>
                      <td><Link href="/water">Water Agent</Link> builds and revises whole asset sets in conversation, on every plan, no credits</td>
                      <td>Confirm on hyper3d.ai</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">When each one fits</h2>
            <div className="pickle-text">
              <p>
                Hydrilla fits studios that want a documented flagship model, an agent that works through whole sets with your artists, and a local Bridge into their existing scene tools. A published cost per model also makes budgeting simple.
              </p>
              <p>
                Hyper3D fits teams that need printing formats, ComfyUI, or Maya and 3ds Max plugins today. If one of those is a hard requirement, start your test there.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check before you decide</h2>
            <div className="pickle-text">
              <p>
                Rodin&apos;s tiers, formats, and plugins can change. Confirm each row on <a href="https://hyper3d.ai">hyper3d.ai</a> first, then test both tools against one shared brief in a real scene of yours.
              </p>
            </div>
          </section>
          <PickleCta primary={{ label: "Start generating", href: "/app/studio" }} />
        </div>
      </article>
      <Footer />
    </>
  );
}
