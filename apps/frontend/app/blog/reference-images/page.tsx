import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo, PicklePlaceholder } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reference Images for Image to 3D: A Guide | Hydrilla AI",
  description:
    "How to frame, light, and crop a reference image so image to 3D has a good starting point, plus a checklist to run before you upload.",
  ogTitle: "Preparing reference images for image to 3D",
  path: "/blog/reference-images",
  absoluteTitle: true,
});

export default function ReferenceImagesPost() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/blog/reference-images")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Guide</p>
          <h1 className="pickle-article-title" data-wide="true">
            What makes a good reference image for image to 3D?
          </h1>
          <div className="pickle-lead">
            <p>
              A good reference shows one subject, whole and in focus, against a plain background in soft, even light, from a slight angle rather than flat on. The clearer its outline, the less guessing{" "}
              <Link href="/image-to-3d">image to 3D</Link> in Hydrilla AI does.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>24 Oct 2026</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
        </header>
        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              <strong>The model can only work from what the picture contains.</strong> Every shadow, reflection, and cropped edge is information it has to interpret, so a few minutes spent on the photo usually saves several rounds of regeneration.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Subject, framing, and light</h2>
              <div className="pickle-text">
                <p>
                  Let the object fill most of the frame, with a small margin on every side. A three-quarter angle shows two faces and a sense of depth. Avoid hard shadows and strong reflections, which can read as shape. A sharp phone photo is enough; you do not need a studio, only a plain wall and light from a window on an overcast day.
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – two-up good and poor pair */}
            <div className="pickle-media-grid" style={{ "--cols": 2 } as React.CSSProperties}>
              <div>
                <PicklePlaceholder
                  ratio="4 / 3"
                  alt="A wooden chair photographed from a three-quarter angle against a plain light wall, fully in frame."
                />
                <p className="pickle-media-label">One chair, three-quarter view, plain wall, soft daylight, nothing cropped.</p>
              </div>
              <div>
                <PicklePlaceholder
                  ratio="4 / 3"
                  alt="A wooden chair cropped at the legs in a cluttered room, with a harsh shadow across the seat."
                />
                <p className="pickle-media-label">The same chair cut off at the legs, in a busy room, under hard window light.</p>
              </div>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">The sides the camera can&apos;t see</h2>
            <div className="pickle-text">
              <p>
                A single image can&apos;t show the back of an object, so the model has to infer it. When the hidden side matters, pick the angle that shows the faces you care about most. For objects that look very different from behind, such as a chair with a carved back, photograph the side that carries the most detail.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Why the background matters</h2>
            <div className="pickle-text">
              <p>
                A busy background competes with the subject for the model&apos;s attention, and an object that matches its background loses its outline. Choose a plain surface that contrasts with the subject: a light wall behind a dark object, or a dark cloth behind a light one. Avoid colored light, which can tint the textures the model produces.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Before you upload</h2>
            <div className="pickle-text">
              <ul>
                <li>One subject, with nothing touching it</li>
                <li>Sharp at full size, without blur or heavy compression</li>
                <li>The whole object in frame, with every edge visible</li>
                <li>A plain background that contrasts with the subject</li>
                <li>Even light, without blown highlights or colored casts</li>
              </ul>
            </div>
          </section>
          <PickleCta primary={{ label: "Start generating", href: "/app/studio" }} />
        </div>
      </article>
      <Footer />
    </>
  );
}
