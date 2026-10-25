import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCards, PickleCta, PickleHeroVideo } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Generate props, set pieces, and lookdev bases with BlueFox for previs and layout, and keep hero assets with your artists.";

export const metadata = createPageMetadata({
  title: "AI 3D Assets for Film Previs and Set Dressing | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla for film and animation",
  path: "/solutions/film",
  absoluteTitle: true,
});

export default function FilmSolutionPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions/film")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            3D props and sets for previs and layout
          </h1>
          <div className="pickle-lead">
            <p>
              Props and environments for animation and VFX often start as stand-ins. Hydrilla AI fills previs and layout scenes with set pieces generated from a{" "}
              <Link href="/text-to-3d">written prompt</Link> or a still.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              That changes when decisions can be made. Instead of blocking a sequence with grey shapes and waiting for modeled assets, directors and layout artists can <strong>judge framing, scale, and mood</strong> against pieces that already look like the world of the film.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Where generated assets fit</h2>
              <div className="pickle-text">
                <p>Generated assets earn their place in the stages where speed of iteration matters more than final detail.</p>
              </div>
            </div>
            <PickleCards
              columns={3}
              titleAs="p"
              cards={[
                {
                  icon: "film",
                  title: "Previs",
                  body: (
                    <>
                      Block a sequence with generated props, so camera and timing work starts early. Work in{" "}
                      <Link href="/integrations/blender">Blender</Link> or <Link href="/integrations/unreal">Unreal Engine</Link> with the Hydrilla plugin.
                    </>
                  ),
                },
                {
                  icon: "architecture",
                  title: "Background set dressing",
                  body: "Fill shelves, streets, and rooms far from camera, where silhouette and material read count more than fine detail.",
                },
                {
                  icon: "preview",
                  title: "Lookdev bases",
                  body: "Begin a material study from a generated model and its PBR maps, then hand it to an artist to refine.",
                },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Dress a whole set from one brief</h2>
            <div className="pickle-text">
              <p>
                A scene rarely needs one prop. Describe the market street, the workshop, or the ship&apos;s hold to{" "}
                <Link href="/water">Water Agent</Link>, review its plan, and revise individual pieces until the set supports the shot.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Background first, hero by hand</h2>
            <div className="pickle-text">
              <p>
                Assets close to camera still need an artist&apos;s pass. Use generated models as a starting point for hero work, and check{" "}
                <Link href="/bluefox#limits">the limits of BlueFox, Hydrilla&apos;s 3D model</Link>. Keeping that line clear protects the quality of the shots audiences study most.
              </p>
            </div>
          </section>

          <PickleCta
            line="Generate what the camera passes by, and save artist hours for what it lingers on."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
