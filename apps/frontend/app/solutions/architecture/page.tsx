import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { DEMO_URL } from "@/lib/brand";

const DESCRIPTION =
  "Generate furniture, fixtures, and interior props from a photo or prompt with BlueFox for architectural visualization and client reviews.";

export const metadata = createPageMetadata({
  title: "AI 3D Furniture and Interiors for Archviz | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla for architecture and interiors",
  path: "/solutions/architecture",
  absoluteTitle: true,
});

const FIT_ROWS = [
  ["Good fit", "Generic chairs, lamps, plants, and decor that fill a room"],
  ["Good fit", "Placeholder furnishings for an early design review"],
  ["Poor fit", "An exact catalogue piece the client intends to buy"],
] as const;

export default function ArchitectureSolutionPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions/architecture")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            3D furniture and fixtures for visualization
          </h1>
          <div className="pickle-lead">
            <p>
              Furnish rooms for presentations and design reviews with furniture and fixtures generated in Hydrilla AI from a{" "}
              <Link href="/image-to-3d">photo</Link> or a prompt.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              <strong>An empty model is hard for a client to read.</strong> Generic chairs, lamps, plants, and decor give a space scale and character, and generating them means visualization artists can dress a room for an early review without searching libraries or modeling every piece.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Good fits and poor fits</h2>
              <div className="pickle-text">
                <p>
                  Generated pieces work best where they set a mood rather than specify a product. Use the table to decide which objects to generate and which to source from the manufacturer.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Fit</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIT_ROWS.map((row) => (
                      <tr key={row[1]}>
                        <th>{row[0]}</th>
                        <td>{row[1]}</td>
                      </tr>
                    ))}
                    <tr>
                      <th>Poor fit</th>
                      <td>
                        Fixtures that need manufacturer dimensions (<Link href="/bluefox#limits">limits</Link>)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Into your visualization tool</h2>
            <div className="pickle-text">
              <p>
                Check scale on import with the <Link href="/docs#scale">units table</Link>, since furniture that is slightly off in size undermines a whole render. Work in Blender with the{" "}
                <Link href="/integrations/blender">Hydrilla add-on</Link>, or connect another renderer through{" "}
                <Link href="/integrations">integrations</Link>. Look over the PBR maps under your scene lighting before the review, since materials read differently in every renderer.
              </p>
            </div>
          </section>

          <PickleCta
            line="Dress the room with generated pieces, and keep the specified products exact."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: DEMO_URL }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
