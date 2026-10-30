import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleMediaGrid } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { cloudinaryImage } from "@/lib/cloudinary";

export const metadata = createPageMetadata({
  title: "Text to 3D: Generate a 3D Model from a Prompt | Hydrilla AI",
  description:
    "Write a prompt, refine the reference image, then let BlueFox generate a segmented 3D model with PBR maps. Preview it and export it.",
  ogTitle: "Text to 3D with BlueFox",
  path: "/text-to-3d",
  absoluteTitle: true,
});


const PROMPT_ROWS = [
  ["Low-poly wooden crate for a Unity mobile game", "Names the style and engine"],
  ["Weathered brass ship lantern with worn edges", "Sets the material and detail level"],
  ["Walnut lounge chair at real scale, for interior renders", "Gives scale and use"],
  ["Cargo container for a background set", "Says it sits far from camera"],
] as const;

export default function TextTo3DPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/text-to-3d")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Text to 3D with BlueFox
          </h1>
          <div className="pickle-lead">
            <p>
              Describe an asset, approve a picture of it, and BlueFox, Hydrilla&apos;s 3D model, builds it as a segmented 3D model in Hydrilla AI.{" "}
              <Link href="/bluefox">About BlueFox</Link>
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
          {/* TODO(kit): visual – replace with the three-frame capture (prompt, reference image, 3D model) for one asset */}
          <PickleMediaGrid
            ratio="4 / 5"
            items={[
              {
                src: cloudinaryImage("hydrilla-landing/workflow/describe"),
                alt: "The 3D character generator panel with a typed prompt for a greyhound explorer in a long coat.",
                label: <><strong>1</strong>Prompt</>,
                fit: "contain",
                tone: "white",
              },
              {
                src: cloudinaryImage("hydrilla-landing/workflow/refine"),
                alt: "The reference image rendered from the prompt: a greyhound character in a long coat and scarf.",
                label: <><strong>2</strong>Reference image</>,
                tone: "white",
              },
              {
                src: cloudinaryImage("hydrilla-landing/workflow/generated-model2"),
                alt: "The finished 3D model of the character, shown untextured and textured side by side.",
                label: <><strong>3</strong>3D model</>,
                tone: "white",
              },
            ]}
          />

          <div className="pickle-intro">
            <p>
              Text to 3D is the right start <strong>when the idea exists only as words</strong>: a prop list from a level designer, a line in a script, or a note from an art director. You write what the asset is and how it will be used, and Hydrilla turns that description into a model you can preview and take further.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Four steps from prompt to model</h2>
            <div className="pickle-text">
              <p>
                Text to 3D starts with a reference image that you can refine before the 3D model is generated. That picture is your chance to agree on the look before any geometry exists.
              </p>
              <ol className="pickle-steps">
                <li>Write a prompt naming the subject, its style, and its use.</li>
                <li>
                  An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame.
                </li>
                <li>Adjust the image with an Edit prompt until it looks right.</li>
                <li>
                  Generate the 3D model, then preview it and <Link href="/features#exports">export</Link>.
                </li>
              </ol>
              <p>
                Every model comes back UV-unwrapped, with PBR maps, so it is ready for material work from the start.{" "}
                <Link href="/bluefox">What BlueFox returns</Link>
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Write prompts that say how the asset will be used</h2>
              <div className="pickle-text">
                <p>
                  Be specific about scale and use. A prompt that names the use, the scale, and how close the camera will get gives BlueFox a clearer brief than a list of adjectives. The examples below show the difference that one extra detail makes.
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
                Settle the look at the image stage, where a change is one more Edit prompt. Adjust color, proportion, or wear on the picture until it reads the way you want, then generate the model once. It keeps review short and credits focused on the version you actually approve.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">When another start fits better</h2>
            <div className="pickle-text">
              <p>
                If you already have a photo or concept image, start from it with{" "}
                <Link href="/image-to-3d">image to 3D</Link>. If the job is a whole set of pieces rather than one model, brief{" "}
                <Link href="/water">Water Agent</Link> instead. <Link href="/pricing">See what a model costs</Link>
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
