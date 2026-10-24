import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Text to 3D: Generate a 3D Model from a Prompt | Hydrilla AI",
  description:
    "Write a prompt, refine the reference image, then let BlueFox generate a segmented 3D model with PBR maps. Preview it and export it.",
  ogTitle: "Text to 3D with BlueFox",
  path: "/text-to-3d",
  absoluteTitle: true,
});

const TEXT_TO_3D_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/text-to-3d#howto",
      name: "Text to 3D with BlueFox",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          text: "Write a prompt naming the subject, its style, and its use.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          text: "An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          text: "Adjust the image with an Edit prompt until it looks right.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          text: "Generate the 3D model, then preview it and export.",
        },
      ],
    },
  ],
};

const PROMPT_ROWS = [
  ["Low-poly wooden crate for a Unity mobile game", "Names the style and engine"],
  ["Weathered brass ship lantern with worn edges", "Sets the material and detail level"],
  ["Walnut lounge chair at real scale, for interior renders", "Gives scale and use"],
  ["Cargo container for a background set", "Says it sits far from camera"],
] as const;

export default function TextTo3DPage() {
  return (
    <>
      <JsonLd data={TEXT_TO_3D_JSON_LD} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Text to 3D with BlueFox
          </h1>
          <div className="pickle-text" style={{ textAlign: "center" }}>
            <p>
              Describe an asset, approve a picture of it, and BlueFox, Hydrilla&apos;s 3D model, builds it as a segmented 3D model in Hydrilla AI.{" "}
              <Link href="/bluefox">About BlueFox →</Link>
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/studio" className="pickle-pill-solid">
              Start generating
            </Link>
            <Link
              href="/pricing"
              className="pickle-glass-pill"
              style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
            >
              See pricing
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – three frames in sequence (prompt, reference image, 3D model) */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="Three frames left to right: a typed prompt for a brass lantern, the image it produced, and the finished 3D lantern."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Four steps from prompt to model</h2>
            <div className="pickle-text">
              <p>
                Text to 3D starts with a reference image that you can refine before the 3D model is generated.
              </p>
              <ol>
                <li>Write a prompt naming the subject, its style, and its use.</li>
                <li>
                  An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame.
                </li>
                <li>Adjust the image with an Edit prompt until it looks right.</li>
                <li>
                  Generate the 3D model, then preview it and <Link href="/features#exports">export →</Link>.
                </li>
              </ol>
              <p>
                Every model comes back UV-unwrapped, with PBR maps, <Link href="/bluefox">details →</Link>.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Write prompts that say how the asset will be used</h2>
              <div className="pickle-text">
                <p>
                  Be specific about scale and use. Naming the use, scale, and camera distance gives BlueFox a clearer brief.
                </p>
              </div>
            </div>

            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Prompt</th>
                      <th>Why it works</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROMPT_ROWS.map(([prompt, why]) => (
                      <tr key={prompt}>
                        <th>{prompt}</th>
                        <td>{why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Refine the image before you spend on 3D</h2>
            <div className="pickle-text">
              <p>
                Settle the look at the image stage, where a change is one more Edit prompt. Have a picture already? Use{" "}
                <Link href="/image-to-3d">image to 3D →</Link>.{" "}
                <Link href="/pricing">See what a model costs →</Link>
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
