import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla vs Sloyd: Generative 3D and Parametric Templates | Hydrilla AI",
  description:
    "How Hydrilla with BlueFox and Sloyd compare on generative 3D vs parametric templates, segmented meshes, PBR maps, plugins, API, and pricing.",
  ogTitle: "Hydrilla vs Sloyd",
  path: "/compare/sloyd",
  absoluteTitle: true,
  keywords: [
    "Hydrilla vs Sloyd",
    "Sloyd AI alternative",
    "Sloyd vs BlueFox",
    "best AI 3D plugin",
    "best 3D AI generator",
  ],
});

export default function CompareSloydPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/sloyd")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How does Hydrilla compare to Sloyd?
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI and Sloyd approach 3D creation differently. Hydrilla runs BlueFox, Hydrilla&apos;s 3D model, to generate segmented 3D meshes with PBR maps from open prompts or reference images, while Sloyd combines a parametric template editor with text and image generation.
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
              Choosing between open-domain 3D generation and template-assisted tools depends on <strong>how bespoke your assets need to be</strong>. The table below sets out how each product works using its public pages.
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
                      <th>Sloyd (confirm on sloyd.ai)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Approach</th>
                      <td>
                        Open-domain generation with <Link href="/bluefox">BlueFox 1</Link>
                      </td>
                      <td>Parametric template generator plus text, image, and 3D-to-3D tools</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>A text prompt or one reference image</td>
                      <td>Sliders on parametric templates, text prompts, or an image</td>
                    </tr>
                    <tr>
                      <th>Output</th>
                      <td>Segmented mesh with UVs and PBR maps</td>
                      <td>Low-poly template meshes or generated textured meshes</td>
                    </tr>
                    <tr>
                      <th>Export formats</th>
                      <td>
                        Four formats (<Link href="/features#exports">list</Link>)
                      </td>
                      <td>GLB, OBJ, FBX, and STL, per its site</td>
                    </tr>
                    <tr>
                      <th>Engine and DCC tools</th>
                      <td>
                        Four plugins linked by a local Bridge (<Link href="/integrations">integrations</Link>)
                      </td>
                      <td>Blender, Unity, Unreal, and Roblox plugins listed on its site</td>
                    </tr>
                    <tr>
                      <th>API and agents</th>
                      <td>
                        Job-based REST API and an MCP server (<Link href="/api">API</Link>)
                      </td>
                      <td>Real-time template SDK and generation API</td>
                    </tr>
                    <tr>
                      <th>Pricing model</th>
                      <td>
                        Monthly credit plans with a Free tier and Hourly plans (<Link href="/pricing">pricing</Link>)
                      </td>
                      <td>Free tier plus Plus, Studio, and Enterprise subscription plans</td>
                    </tr>
                    <tr>
                      <th>Model card</th>
                      <td>
                        Published on <Link href="/research#model-card">research</Link>, with intended use and limits
                      </td>
                      <td>Confirm on sloyd.ai</td>
                    </tr>
                    <tr>
                      <th>AI 3D agent</th>
                      <td>
                        <Link href="/water">Water Agent</Link> builds and revises whole asset sets in conversation, on every plan, no credits
                      </td>
                      <td>Confirm on sloyd.ai</td>
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
                Hydrilla suits studios and artists who start from custom reference photos, concept art, or scene briefs, and want segmented meshes with PBR maps plus Water Agent to direct whole sets inside their tools.
              </p>
              <p>
                Sloyd suits teams that want slider-driven variations on categories covered by its template library or need STL exports for printing.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check before you decide</h2>
            <div className="pickle-text">
              <p>
                Sloyd&apos;s template library, generated modes, and plans change over time. Confirm each row on{" "}
                <a href="https://www.sloyd.ai">sloyd.ai</a> before you commit, then test both tools using the{" "}
                <Link href="/compare/how-to-choose">buying guide</Link>.
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
