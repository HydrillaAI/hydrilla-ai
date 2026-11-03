import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla vs Trellis: Studio Workspace and Open Weights | Hydrilla AI",
  description:
    "How Hydrilla with BlueFox and Microsoft's open-weights Trellis compare on hosting, outputs, exports, integrations, API, and studio workflows.",
  ogTitle: "Hydrilla vs Trellis",
  path: "/compare/trellis",
  absoluteTitle: true,
  keywords: [
    "Hydrilla vs Trellis",
    "Trellis 3D AI alternative",
    "Microsoft Trellis vs BlueFox",
    "best 3D AI generator",
    "AI 3D model generator comparison",
  ],
});

export default function CompareTrellisPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/trellis")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How does Hydrilla compare to Trellis?
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI and Trellis take different routes to 3D generation. Hydrilla is a hosted AI 3D workspace running BlueFox, Hydrilla&apos;s 3D model, with plugins, an API, and Water Agent, while Trellis is an open-weights 3D model released by Microsoft Research that teams host on their own GPUs.
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
              Weighing a hosted studio workspace against open weights comes down to <strong>where your team wants to spend its time</strong>: building and maintaining GPU pipelines, or directing and shipping 3D assets into scenes. The table below compares both options row by row.
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
                      <th>Trellis (confirm on github.com/microsoft/TRELLIS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Model</th>
                      <td>
                        <Link href="/bluefox">BlueFox 1</Link>, hosted in Hydrilla
                      </td>
                      <td>TRELLIS open-weights checkpoints, run on your own GPU or a third-party host</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>A text prompt or one reference image</td>
                      <td>Image or text variants, per its repository</td>
                    </tr>
                    <tr>
                      <th>Output</th>
                      <td>Segmented mesh with UVs and PBR maps</td>
                      <td>Structured 3D latents decoded to radiance fields, Gaussian splats, or meshes</td>
                    </tr>
                    <tr>
                      <th>Export formats</th>
                      <td>
                        Four formats (<Link href="/features#exports">list</Link>)
                      </td>
                      <td>GLB and Gaussian splat ply exports in the reference code</td>
                    </tr>
                    <tr>
                      <th>Engine and DCC tools</th>
                      <td>
                        Four plugins plus a local Bridge (<Link href="/integrations">integrations</Link>)
                      </td>
                      <td>Community scripts and ComfyUI nodes; no first-party DCC bridge</td>
                    </tr>
                    <tr>
                      <th>API and agents</th>
                      <td>
                        Managed REST API and an MCP server (<Link href="/api">API</Link>)
                      </td>
                      <td>Self-hosted Python inference or third-party inference endpoints</td>
                    </tr>
                    <tr>
                      <th>Pricing model</th>
                      <td>
                        Monthly credit plans with a Free tier; costs per model on <Link href="/pricing">pricing</Link>
                      </td>
                      <td>Open-source code under MIT license; you pay for GPU hardware and hosting</td>
                    </tr>
                    <tr>
                      <th>Model card</th>
                      <td>
                        Published on <Link href="/research#model-card">research</Link>, with limits
                      </td>
                      <td>Research paper and GitHub repository documentation</td>
                    </tr>
                    <tr>
                      <th>AI 3D agent</th>
                      <td>
                        <Link href="/water">Water Agent</Link> builds and revises whole asset sets in conversation, on every plan, no credits
                      </td>
                      <td>None included in the repository</td>
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
                Hydrilla fits studios and artists who want a managed workspace, segmented parts with PBR maps, plugins that connect through a local Bridge, and an AI 3D agent that plans and revises whole asset sets without managing GPU servers.
              </p>
              <p>
                Trellis fits ML engineers and technical teams who have Linux GPUs, want to inspect or fine-tune open weights locally, or need 3D Gaussian splat outputs from code.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check before you decide</h2>
            <div className="pickle-text">
              <p>
                Trellis checkpoints, community integrations, and license terms live in its public repository. Check{" "}
                <a href="https://github.com/microsoft/TRELLIS">github.com/microsoft/TRELLIS</a> before you plan infrastructure around it, and run a{" "}
                <Link href="/compare/how-to-choose">bake-off</Link> on your own brief.
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
