import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla vs Meshy: AI 3D Tools Side by Side | Hydrilla AI",
  description:
    "How Hydrilla with BlueFox and Meshy compare on inputs, outputs, export formats, integrations, API, and pricing. Facts from both sites, dated.",
  ogTitle: "Hydrilla vs Meshy",
  path: "/compare/meshy",
  absoluteTitle: true,
});

export default function CompareMeshyPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/meshy")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How does Hydrilla compare to Meshy?
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI and Meshy are separate products, each with its own models. Hydrilla runs BlueFox, Hydrilla&apos;s 3D model, in an AI 3D workspace, while Meshy runs its own models and adds tools such as texturing and print export.
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
              Both turn text and images into 3D, so <strong>the useful differences sit in the details</strong>: what the output contains, how it reaches your tools, and how each product is priced. The table below sets those out row by row, using each company&apos;s public pages.
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
                      <th>Meshy (confirm on meshy.ai)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Model</th>
                      <td><Link href="/bluefox">BlueFox 1</Link>, Hydrilla&apos;s own model</td>
                      <td>Meshy&apos;s own models; its pricing page names Meshy 6</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>A text prompt or one reference image</td>
                      <td>Text, image, and multi-image, per its API page</td>
                    </tr>
                    <tr>
                      <th>Output</th>
                      <td>Segmented mesh with PBR maps</td>
                      <td>Textured models, with separate texturing, rigging, and animation tools</td>
                    </tr>
                    <tr>
                      <th>Export formats</th>
                      <td>Four formats (<Link href="/features#exports">list</Link>)</td>
                      <td>FBX, OBJ, USDZ, GLB, STL, and BLEND, per its pricing FAQ</td>
                    </tr>
                    <tr>
                      <th>Engine and DCC tools</th>
                      <td>A plugin for each of four tools, linked by a local Bridge (<Link href="/integrations">integrations</Link>)</td>
                      <td>A DCC bridge listing Roblox, Blender, Godot, Unity, Unreal, Maya, and 3ds Max</td>
                    </tr>
                    <tr>
                      <th>API and agents</th>
                      <td>REST API and an MCP server</td>
                      <td>Credit-billed API and an MCP server</td>
                    </tr>
                    <tr>
                      <th>Pricing model</th>
                      <td>Monthly credit plans with a Free tier; costs per model on <Link href="/pricing">pricing</Link></td>
                      <td>Monthly credit plans with a Free tier and several paid levels</td>
                    </tr>
                    <tr>
                      <th>Model card</th>
                      <td>Published, with intended use and limits</td>
                      <td>Confirm on meshy.ai</td>
                    </tr>
                    <tr>
                      <th>AI 3D agent</th>
                      <td><Link href="/water">Water Agent</Link> builds and revises whole asset sets in conversation, on every plan, no credits</td>
                      <td>Confirm on meshy.ai</td>
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
                Hydrilla suits teams that want a flagship model with a published card and segmented parts, an AI agent that works through whole asset sets with your artists, and plugins for four engines and DCCs. Its strength is the path from a brief to editable assets inside the tools a studio already uses.
              </p>
              <p>
                Meshy suits teams that also need 3D printing formats, rigging, or animation inside the same product. If those steps are central to your work, weigh them heavily in your test.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check before you decide</h2>
            <div className="pickle-text">
              <p>
                Meshy&apos;s prices, formats, and features change. Verify on their site, <a href="https://www.meshy.ai">meshy.ai</a>, before you rely on any row, and run both tools on the same brief in your own scene.
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
