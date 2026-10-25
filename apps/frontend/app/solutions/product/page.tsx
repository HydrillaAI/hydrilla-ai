import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Turn product photos into 3D models with BlueFox for marketing, web viewers, and AR, with a clear note on where a likeness differs from CAD.";

export const metadata = createPageMetadata({
  title: "AI 3D Product Models for E-commerce | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla for product visualization",
  path: "/solutions/product",
  absoluteTitle: true,
});

export default function ProductSolutionPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions/product")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            3D product models from product photos
          </h1>
          <div className="pickle-lead">
            <p>
              Upload a product photo with <Link href="/image-to-3d">image to 3D</Link>, and BlueFox, Hydrilla&apos;s 3D model, builds a model in Hydrilla AI you can spin and light for storefronts and AR.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              Shoppers want to <strong>see a product from every side</strong> before they buy, and a photo set only goes so far. A model generated from your existing product photography gives marketing and ecommerce teams a 3D view to work with, without commissioning a full modeling job for every item in the range.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">A likeness, not a CAD file</h2>
            <div className="pickle-text">
              <p>
                A generated model follows what the photo shows, so treat it as a likeness rather than an engineering replica; for exact dimensions, start from your CAD source (<Link href="/bluefox#limits">limits</Link>). Results improve with a clean, well-lit photo, and the{" "}
                <Link href="/blog/reference-images">reference guide</Link> shows how to shoot one.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">For web viewers and AR</h2>
            <div className="pickle-text">
              <p>
                Check file size before you embed, since storefront pages load on phones too. Review the model under the same light as your product photography, so color and material match what customers see elsewhere in the listing.{" "}
                <Link href="/features#exports">Which file suits web and AR</Link>
              </p>
            </div>
          </section>

          <PickleCta
            line="Show the product in 3D, and keep the spec sheet as the source of truth."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
