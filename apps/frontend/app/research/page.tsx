import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleActions, PickleMediaGrid } from "@/components/layout/PicklePage";
import { cloudinaryImage } from "@/lib/cloudinary";

export default function ResearchPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/research")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Company</p>
          <h1 className="pickle-article-title">Research</h1>
          <div className="pickle-lead">
            <p>
              Hawan Research Labs is Hydrilla AI&apos;s research lab. It&apos;s where we build BlueFox, Hydrilla&apos;s 3D model. Below is the model card.{" "}
              <Link href="/about">About Hydrilla</Link>
            </p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              The lab is Hydrilla AI&apos;s <strong>home for 3D experimentation and research</strong>. Its work starts from the problems artists meet when generated assets enter a real pipeline, and it ends in the models that ship in the Hydrilla workspace.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What we work on</h2>
              <div className="pickle-text">
                <p>
                  Generating 3D from text and images: meshes split into usable parts, physically based materials, and assets that hold up in game, film, architecture, and XR scenes. Each of those goals comes from the same test, whether an artist can take the result and keep working without starting over.{" "}
                  <Link href="/team">Meet the team</Link>
                </p>
              </div>
            </div>
            <PickleMediaGrid
              ratio="4 / 3"
              items={[
                {
                  src: cloudinaryImage("hydrilla-landing/features/3df3"),
                  alt: "A generated helmet separated into shell, visor, straps, horns, crystal, and padding.",
                  label: <><strong>Parts</strong>Meshes split into usable parts</>,
                },
                {
                  src: cloudinaryImage("hydrilla-landing/features/3df2"),
                  alt: "Base color, roughness, metalness, and normal maps beside the textured helmet.",
                  label: <><strong>Materials</strong>Physically based maps</>,
                },
              ]}
            />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">How we publish</h2>
            <div className="pickle-text">
              <p>
                We document what a model is for and where it stops, so teams can plan around it. The model card below is the reference for the current release, and the{" "}
                <Link href="/bluefox">BlueFox page</Link> describes what it does in practice.
              </p>
            </div>
          </section>

          <section id="model-card" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">BlueFox 1 model card</h2>
              <div className="pickle-text">
                <p>The card lists what the current model takes in, what it returns, and what it&apos;s for.</p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Model</th>
                      <td>BlueFox 1, in the BlueFox family</td>
                    </tr>
                    <tr>
                      <th>Built by</th>
                      <td>Hawan Research Labs, the research lab of Hydrilla AI</td>
                    </tr>
                    <tr>
                      <th>Availability</th>
                      <td>Generally available to everyone in Hydrilla</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>Text prompt, reference image</td>
                    </tr>
                    <tr>
                      <th>Outputs</th>
                      <td>Segmented mesh with UVs and textures (PBR maps)</td>
                    </tr>
                    <tr>
                      <th>Exports</th>
                      <td>
                        <Link href="/features#exports">Hydrilla&apos;s export formats</Link>
                      </td>
                    </tr>
                    <tr>
                      <th>Intended use</th>
                      <td>Props, environments, visualization, and starting assets for an artist pass</td>
                    </tr>
                    <tr>
                      <th>Not intended for</th>
                      <td>CAD or precision engineering</td>
                    </tr>
                    <tr>
                      <th>Training data</th>
                      <td>
                        Customer data isn&apos;t used (<Link href="/security">security</Link>)
                      </td>
                    </tr>
                    <tr>
                      <th>Repository</th>
                      <td>
                        <a href="https://huggingface.co/Hydrilla/BlueFox3D">Hugging Face</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
            <div className="mt-6">
              <Link href="/bluefox" className="pickle-pill-ghost">
              Read about BlueFox
            </Link>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
