import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleMediaGrid, PicklePlaceholder } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { cloudinaryImage } from "@/lib/cloudinary";

export const metadata = createPageMetadata({
  title: "Image to 3D: Turn a Picture into a 3D Model | Hydrilla AI",
  description:
    "Upload a reference image and BlueFox builds a segmented 3D model that follows its silhouette and materials. Preview it, then export it.",
  ogTitle: "Image to 3D: turn a picture into a 3D model",
  path: "/image-to-3d",
  absoluteTitle: true,
});


export default function ImageTo3DPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/image-to-3d")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Image to 3D: turn a picture into a 3D model
          </h1>
          <div className="pickle-lead">
            <p>
              Upload a picture, and BlueFox, Hydrilla&apos;s 3D model, builds a segmented 3D model from it in Hydrilla AI, ready to preview and export.
            </p>
          </div>
          <div className="pickle-actions">
            <Link href="/app/studio" className="pickle-pill-solid">
              Start generating
            </Link>
            <Link href="/pricing" className="pickle-pill-ghost">
              See pricing
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – replace with the before-and-after viewer (reference photo beside the orbiting 3D result) */}
          <PickleMediaGrid
            ratio="4 / 5"
            items={[
              {
                src: cloudinaryImage("hydrilla-landing/workflow/refine"),
                alt: "An uploaded picture of a greyhound character in a long coat and scarf.",
                label: <><strong>Before</strong>Your picture</>,
                tone: "white",
              },
              {
                src: cloudinaryImage("hydrilla-landing/workflow/generated-model2"),
                alt: "The 3D model built from that picture, shown untextured and textured.",
                label: <><strong>After</strong>Segmented 3D model</>,
                tone: "white",
              },
            ]}
          />

          <div className="pickle-intro">
            <p>
              Image to 3D is for the moments <strong>when the look is already decided</strong>. A product shot, a reference photo from a location scout, or an approved concept frame carries more visual information than any description, and BlueFox uses it as the brief.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">From picture to model in three steps</h2>
            <div className="pickle-text">
              <p>
                The workflow is short on purpose. There is no image stage to approve, because your picture is the approved look.
              </p>
              <ol className="pickle-steps">
                <li>Upload a picture of the object you want.</li>
                <li>
                  Start the job, and the picture becomes a model split into parts.{" "}
                  <Link href="/pricing">Credits per job</Link>
                </li>
                <li>
                  Spin it in the preview, check each part, then{" "}
                  <Link href="/features#exports">export</Link>.
                </li>
              </ol>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What BlueFox reads from your image</h2>
              <div className="pickle-text">
                <p>
                  Image to 3D uses your reference to follow its silhouette, materials, and style. It works from what the camera captured, so sides the photo doesn&apos;t show are inferred. Shoot from the side that carries the detail you need, and the model will follow it most closely.
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – reference photo with silhouette, material, and style callouts */}
            <PicklePlaceholder alt="A reference photo of a leather armchair with labels pointing to its outline, its leather surface, and its overall style." />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Better pictures make better models</h2>
            <div className="pickle-text">
              <p>
                The quality of the reference sets the ceiling for the model. One clear subject, in even light, against a plain background, gives BlueFox the least to guess. The guide below walks through framing, light, and a short checklist.{" "}
                <Link href="/blog/reference-images">How to shoot a good reference</Link>
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Starting without a picture</h2>
            <div className="pickle-text">
              <p>
                No picture yet? Describe the asset with <Link href="/text-to-3d">text to 3D</Link>, which creates a reference for you to refine first. Every result arrives with parts, UVs, and PBR maps,{" "}
                <Link href="/bluefox">detailed on the model page</Link>.
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
