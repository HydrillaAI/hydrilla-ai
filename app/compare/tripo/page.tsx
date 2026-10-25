import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla vs Tripo: Inputs, Exports, and API | Hydrilla AI",
  description:
    "Hydrilla and Tripo both turn text or images into 3D. Compare BlueFox with Tripo on outputs, formats, plugins, API, and plans, with dates.",
  ogTitle: "Hydrilla vs Tripo",
  path: "/compare/tripo",
  absoluteTitle: true,
});

export default function CompareTripoPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/tripo")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How does Hydrilla compare to Tripo?
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI and Tripo both turn text or images into 3D. They come from separate companies with separate models: BlueFox, Hydrilla&apos;s 3D model, on one side, Tripo&apos;s own model line on the other.
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
              The table compares what each product says it offers on its public pages, from inputs and outputs to plugins and plans. Use it to <strong>narrow the field</strong>, then run a{" "}
              <Link href="/compare/how-to-choose">bake-off</Link> in your own scene before you decide.
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
                      <th>Tripo (confirm on tripo3d.ai)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Generation model</th>
                      <td><Link href="/bluefox">BlueFox 1</Link></td>
                      <td>Tripo&apos;s own model line</td>
                    </tr>
                    <tr>
                      <th>Input types</th>
                      <td>A prompt, or a single reference image</td>
                      <td>Its API page lists multiview input alongside text and image</td>
                    </tr>
                    <tr>
                      <th>What comes back</th>
                      <td>A mesh in parts, PBR maps included</td>
                      <td>Textured models; API services for segmentation, retopology, and rigging</td>
                    </tr>
                    <tr>
                      <th>File formats</th>
                      <td>Four <Link href="/features#exports">export formats</Link></td>
                      <td>GLB, FBX, OBJ, USDZ, and more; STL and 3MF for printing</td>
                    </tr>
                    <tr>
                      <th>Plugins</th>
                      <td>Four engine and DCC <Link href="/integrations">plugins</Link>, plus the local Bridge</td>
                      <td>A DCC bridge for Blender, 3ds Max, Unity, Unreal, Maya, Cocos, Godot, and ZBrush</td>
                    </tr>
                    <tr>
                      <th>Developer access</th>
                      <td>Job-based REST API, plus MCP for AI agents</td>
                      <td>Credit-priced API with task completion notices</td>
                    </tr>
                    <tr>
                      <th>Plans</th>
                      <td>Free, paid, and Hourly plans, all priced in credits (<Link href="/pricing">plans</Link>)</td>
                      <td>Free, Pro, Max, and per-seat Team plans, priced in credits</td>
                    </tr>
                    <tr>
                      <th>Public limits</th>
                      <td>Stated on the <Link href="/bluefox#limits">BlueFox page</Link> and model card</td>
                      <td>Confirm on tripo3d.ai</td>
                    </tr>
                    <tr>
                      <th>AI 3D agent</th>
                      <td><Link href="/water">Water Agent</Link> builds and revises whole asset sets in conversation, on every plan, no credits</td>
                      <td>Confirm on tripo3d.ai</td>
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
                Choose Hydrilla when you want segmented parts, a public model card, and an AI 3D agent that directs whole sets with you, from input to export. Hourly plans also suit artists who generate at the same time each day.
              </p>
              <p>
                Tripo may fit better when the work also covers 3D printing, rigging, or a tool on its bridge list that Hydrilla doesn&apos;t support. Test the steps your pipeline depends on most.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check before you decide</h2>
            <div className="pickle-text">
              <p>
                Plans and features change over time, so confirm every row on <a href="https://www.tripo3d.ai">tripo3d.ai</a> before you choose, and note the date you checked.
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
