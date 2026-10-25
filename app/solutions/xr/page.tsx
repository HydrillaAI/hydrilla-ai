import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Generate 3D assets with BlueFox for AR, VR, and spatial apps, and check each one against your headset's budget before it ships.";

export const metadata = createPageMetadata({
  title: "AI 3D Assets for AR, VR, and Spatial Apps | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla for XR",
  path: "/solutions/xr",
  absoluteTitle: true,
});

export default function XrSolutionPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions/xr")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            3D assets for AR, VR, and spatial apps
          </h1>
          <div className="pickle-lead">
            <p>
              VR, AR, and spatial apps need many small, believable objects. BlueFox, Hydrilla&apos;s 3D model, generates them in Hydrilla AI, so you can check each against a headset&apos;s limits.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              In a headset, users can walk up to anything, pick it up, and turn it over. That makes a room full of convincing props essential, and it makes <strong>the performance budget unforgiving</strong>. Generation covers the volume, and your team keeps control of the budget.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check the headset budget</h2>
            <div className="pickle-text">
              <p>
                Standalone headsets have tight limits on triangles, draw calls, and texture memory. Measure each asset against your target before it ships, and reduce or bake anything that exceeds it. These are the numbers to track per object.
              </p>
              <ul>
                <li>Triangle count per asset</li>
                <li>Texture resolution per map</li>
                <li>Draw calls per material</li>
                <li>Collision and grab volumes for objects users can pick up</li>
              </ul>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check it before the headset build</h2>
            <div className="pickle-text">
              <p>
                Preview each object in the browser first, where problems with shape or material are quick to spot, then route headset builds through the{" "}
                <Link href="/integrations/unity">Unity</Link> or <Link href="/integrations/unreal">Unreal</Link> plugin. Testing on the device is still the final word, so keep a short list of assets to review in the headset after every build.{" "}
                <Link href="/features#exports">Which file suits each platform</Link>
              </p>
            </div>
          </section>

          <PickleCta
            line="Prototype the space with generated objects, then budget each one for the headset."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
