import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Image to 3D: Turn a Picture into a 3D Model | Hydrilla AI",
  description:
    "Upload a reference image and BlueFox builds a segmented 3D model that follows its silhouette and materials. Preview it, then export it.",
  ogTitle: "Image to 3D: turn a picture into a 3D model",
  path: "/image-to-3d",
  absoluteTitle: true,
});

const IMAGE_TO_3D_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/image-to-3d#howto",
      name: "Image to 3D with BlueFox",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          text: "Upload a picture of the object you want.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          text: "Start the job, and the picture becomes a model split into parts.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          text: "Spin it in the preview, check each part, then export.",
        },
      ],
    },
  ],
};

export default function ImageTo3DPage() {
  return (
    <>
      <JsonLd data={IMAGE_TO_3D_JSON_LD} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Image to 3D: turn a picture into a 3D model
          </h1>
          <div className="pickle-text" style={{ textAlign: "center" }}>
            <p>
              Upload a picture, and BlueFox, Hydrilla&apos;s 3D model, builds a segmented 3D model from it in Hydrilla AI, ready to preview and export.
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
          {/* TODO(kit): visual – before and after viewer (reference photo beside the orbiting 3D result) */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="A photo of a ceramic vase on the left and the generated 3D vase turning slowly on the right."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">From picture to model in three steps</h2>
            <div className="pickle-text">
              <ol>
                <li>Upload a picture of the object you want.</li>
                <li>
                  Start the job, and the picture becomes a model split into parts.{" "}
                  <Link href="/pricing">Credits per job →</Link>
                </li>
                <li>
                  Spin it in the preview, check each part, then{" "}
                  <Link href="/features#exports">export →</Link>.
                </li>
              </ol>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What BlueFox reads from your image</h2>
            <div className="pickle-text">
              <p>
                Image to 3D uses your reference to follow its silhouette, materials, and style. It works from what the camera captured, so sides the photo doesn&apos;t show are inferred.{" "}
                <Link href="/blog/reference-images">How to shoot a good reference →</Link>
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
