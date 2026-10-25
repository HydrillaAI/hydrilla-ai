import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { PickleActions, type PickleCardItem, PickleCards, PickleCta, PickleHeroVideo, PickleMediaGrid } from "@/components/layout/PicklePage";


const ADVANTAGE_CARDS = [
  {
    title: "UVs and textures included",
    icon: "preview",
    body: "Every model arrives unwrapped, with PBR maps already attached. It reacts to your scene's lights straight away, and the maps are ready to repaint if the look needs to change.",
  },
  {
    title: "Parts split for you",
    icon: "bluefox",
    body: "Handles, lids, and panels come back as separate pieces you can select, hide, or rework. There is no fused mesh to cut apart before material work can start.",
  },
  {
    title: "Works with your tools",
    icon: "integrations",
    body: (
      <>
        Every Hydrilla plugin works with BlueFox, in your engine or DCC, so results reach the scene you are building.{" "}
        <Link href="/integrations">Integrations</Link>
      </>
    ),
  },
  {
    title: "No training on your data",
    icon: "security",
    body: (
      <>
        Your prompts, pictures, and models stay out of our training sets, on every plan.{" "}
        <Link href="/security">How we handle data</Link>
      </>
    ),
  },
] satisfies PickleCardItem[];

export default function BlueFoxPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/bluefox")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Model</p>
          <h1 className="pickle-article-title">BlueFox</h1>
          <div className="pickle-lead">
            {/* VERIFY: Wording "generally available to everyone in Hydrilla" (VERIFY-LIST #16) */}
            <p>
              BlueFox, Hydrilla&apos;s 3D model, turns a prompt or a picture into a segmented 3D model with UVs and PBR textures. It&apos;s built by Hydrilla AI. Begin with a{" "}
              <Link href="/text-to-3d">typed prompt</Link> or an{" "}
              <Link href="/image-to-3d">uploaded picture</Link>.
            </p>
          </div>
          <p className="pickle-chip">Current version BlueFox 1, generally available to everyone in Hydrilla.</p>
          <PickleActions primary={{ label: "Start generating", href: "/app/studio" }} />
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              BlueFox is <strong>the flagship of the Hydrilla workspace</strong>. It is designed for the volume work that fills a studio&apos;s schedule, the props, set pieces, and visualization assets that every scene needs and few teams have time to model by hand.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Ready for your pipeline from the first export</h2>
              <div className="pickle-text">
                <p>
                  A generated model is only useful if your tools can work with it. BlueFox delivers assets in a structure artists already expect, so the first minutes after generation go into creative decisions rather than repair.
                </p>
              </div>
            </div>

            <PickleCards cards={ADVANTAGE_CARDS} />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Parts, UVs, and PBR textures</h2>
              <div className="pickle-text">
                {/* VERIFY: Safe wording "Select one part in Studio and leave the rest alone" (VERIFY-LIST #17) */}
                <p>
                  BlueFox returns a mesh split into parts, with UVs and PBR texture maps. That structure is what makes a generated asset editable: select one part in Studio and leave the rest alone, assign a different material to a single panel, or repaint the maps in your own tools without unwrapping anything first.
                </p>
              </div>
            </div>

            {/* TODO(kit): visual – replace with the exploded view of the sample's parts */}
            <PickleMediaGrid
              ratio="4 / 3"
              items={[
                {
                  src: "/features/3d2.png",
                  alt: "A generated house separated into roof, floors, walls, and deck, with a segmentation list beside it.",
                  label: <><strong>Parts</strong>Segmented mesh</>,
                },
                {
                  src: "/new-features/3df2.png",
                  alt: "Base color, roughness, metalness, and normal maps laid out beside the textured helmet.",
                  label: <><strong>Maps</strong>PBR textures</>,
                },
              ]}
            />
          </section>

          <section id="specs" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">BlueFox at a glance</h2>
              <div className="pickle-text">
                <p>
                  The current release is BlueFox 1. The table summarizes what it takes in and what it returns; the full model card on the research page covers intended use in more detail.
                </p>
              </div>
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
                        <Link href="/features#exports">Hydrilla&apos;s export formats</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          {/* VERIFY: Limits line (VERIFY-LIST #16) */}
          <PickleCta
            id="limits"
            title="Where BlueFox fits, and where it stops"
            line={
              <>
                Use it for props, environment pieces, and visualization assets an artist will finish. BlueFox isn&apos;t built for CAD, manufacturing drawings, or finished hero assets that skip an artist pass. Being clear about that line helps teams plan where generation saves time and where a modeler should lead. The full{" "}
                <Link href="/research#model-card">model card</Link> lists intended use and inputs.
              </>
            }
            secondary={{ label: "Read the model card", href: "/research#model-card" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
