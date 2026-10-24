import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

const BLUEFOX_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/bluefox#model",
      name: "BlueFox",
      alternateName: "BlueFox 1",
      softwareVersion: "1",
      description:
        "BlueFox, Hydrilla's 3D model, is built by Hydrilla AI. Its current version is BlueFox 1.",
      disambiguatingDescription: "Hydrilla's 3D model, generally available in Hydrilla",
      applicationCategory: "DesignApplication",
      url: "https://hydrilla.ai/bluefox",
      creator: {
        "@id": "https://hydrilla.ai/#organization",
      },
      isPartOf: {
        "@id": "https://hydrilla.ai/features#software",
      },
      sameAs: ["https://huggingface.co/Hydrilla/BlueFox3D"],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Product",
          item: "https://hydrilla.ai/features",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "BlueFox",
          item: "https://hydrilla.ai/bluefox",
        },
      ],
    },
  ],
};

const ADVANTAGE_CARDS = [
  {
    title: "UVs and textures included",
    line: "Every model arrives unwrapped, with PBR maps already attached, so it reacts to your scene's lights straight away.",
  },
  {
    title: "Parts split for you",
    line: "Handles, lids, and panels come back as separate pieces you can select, hide, or rework, with no fused mesh to cut apart first.",
  },
  {
    title: "Works with your tools",
    line: (
      <>
        Every Hydrilla plugin works with it, in your engine or DCC.{" "}
        <Link href="/integrations">Integrations →</Link>
      </>
    ),
  },
  {
    title: "No training on your data",
    line: (
      <>
        Your prompts, pictures, and models stay out of our training sets.{" "}
        <Link href="/security">How we handle data →</Link>
      </>
    ),
  },
] as const;

export default function BlueFoxPage() {
  return (
    <>
      <JsonLd data={BLUEFOX_JSON_LD} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Model</p>
          <h1 className="pickle-article-title">BlueFox</h1>
          <div className="pickle-text" style={{ textAlign: "center" }}>
            <p>
              BlueFox, Hydrilla&apos;s 3D model, turns a prompt or a picture into a segmented 3D model with UVs and PBR textures. It&apos;s built by Hydrilla AI. Begin with a{" "}
              <Link href="/text-to-3d">typed prompt →</Link> or an{" "}
              <Link href="/image-to-3d">uploaded picture →</Link>.
            </p>
            {/* VERIFY: Wording "generally available to everyone in Hydrilla" (VERIFY-LIST #16) */}
            <p>Current version BlueFox 1, generally available to everyone in Hydrilla.</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/studio" className="pickle-pill-solid">
              Start generating
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – interactive viewer of a segmented sample with a parts toggle */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="A generated lantern in a 3D viewer, its frame, glass, and handle highlighted as separate parts."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Ready for your pipeline from the first export</h2>
              <div className="pickle-text">
                <p>
                  BlueFox is made for the many props, set pieces, and visualization assets a studio needs, and it delivers them in a shape your tools already read.
                </p>
              </div>
            </div>

            <div className="pickle-research-grid" style={{ width: "100%", marginTop: 0 }}>
              {ADVANTAGE_CARDS.map((card) => (
                <div key={card.title} className="pickle-card-surface">
                  <h3 className="pickle-h3" style={{ width: "100%" }}>
                    {card.title}
                  </h3>
                  <p className="pickle-text" style={{ width: "100%", marginTop: "12px" }}>
                    {card.line}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Parts, UVs, and PBR textures</h2>
              <div className="pickle-text">
                {/* VERIFY: Safe wording "Select one part in Studio and leave the rest alone" (VERIFY-LIST #17) */}
                <p>
                  BlueFox returns a mesh split into parts, with UVs and PBR texture maps. Select one part in Studio and leave the rest alone, or repaint the maps in your own tools.
                </p>
              </div>
            </div>

            {/* TODO(kit): visual – exploded view of the sample's parts */}
            <figure className="pickle-figure">
              <div
                role="img"
                aria-label="The lantern pulled apart into its frame, glass panels, handle, and base."
                className="pickle-card-surface"
              />
            </figure>
          </section>

          <section id="specs" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">BlueFox at a glance</h2>
            </div>

            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Spec</th>
                      <th>BlueFox 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Version</th>
                      <td>BlueFox 1</td>
                    </tr>
                    <tr>
                      <th>Availability</th>
                      <td>Generally available to everyone in Hydrilla</td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>Typed prompt or uploaded image</td>
                    </tr>
                    <tr>
                      <th>Output</th>
                      <td>Mesh in parts, UV-unwrapped, with PBR maps</td>
                    </tr>
                    <tr>
                      <th>Exports</th>
                      <td>
                        <Link href="/features#exports">Hydrilla&apos;s export formats →</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section id="limits" className="pickle-head-block scroll-mt-28">
            <h2 className="pickle-h2">Where BlueFox fits, and where it stops</h2>
            <div className="pickle-text">
              {/* VERIFY: Limits line (VERIFY-LIST #16) */}
              <p>
                Use it for props, environment pieces, and visualization assets an artist will finish. BlueFox isn&apos;t built for CAD, manufacturing drawings, or finished hero assets that skip an artist pass. The full{" "}
                <Link href="/research#model-card">model card →</Link> lists intended use and inputs.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/research#model-card"
                className="pickle-glass-pill"
                style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
              >
                Read the model card
              </Link>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
