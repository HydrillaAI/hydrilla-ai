import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo, PicklePlaceholder } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Generate props and environment fill with BlueFox, and see what still needs retopology and LODs before it goes into your engine.";

export const metadata = createPageMetadata({
  title: "AI 3D Assets for Game Development | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla for game development",
  path: "/solutions/games",
  absoluteTitle: true,
});

export default function GamesSolutionPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions/games")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            3D props and environment fill for game teams
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI gives game teams props and environment pieces for your game engine, generated with BlueFox, Hydrilla&apos;s 3D model, from typed briefs or uploaded pictures.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              <strong>Most of what fills a level is not the hero.</strong> It is the crates, barrels, debris, signage, and clutter that make a space feel lived in, and it is where art time disappears. Generation takes on that volume so your artists can spend their hours on the assets players will remember.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">From greybox to a filled level</h2>
              <div className="pickle-text">
                <p>
                  Swap greybox blocks for generated crates, barrels, and debris while the layout is still changing, then keep the pieces that work. Designers get to playtest a space that reads like the final game, and art direction can react to real shapes instead of grey boxes. Working from a full level brief?{" "}
                  <Link href="/water">See Water Agent</Link>
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – before and after slider */}
            <PicklePlaceholder alt="A level shown as grey blocks on the left and dressed with generated props on the right." />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What you still do</h2>
            <div className="pickle-text">
              <p>
                A generated model is a strong starting point, not a shipped asset. Your team still owns the steps that depend on your engine, your platform, and your game&apos;s look.
              </p>
              <ul>
                <li>Retopology wherever the polygon budget is tight</li>
                <li>LODs for anything seen from several distances</li>
                <li>Collision shapes for anything the player touches</li>
                <li>A material check under your engine&apos;s own lighting and post-processing</li>
              </ul>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Straight into your engine</h2>
            <div className="pickle-text">
              <p>
                The <Link href="/integrations/unity">Unity</Link>, <Link href="/integrations/unreal">Unreal Engine</Link>, and{" "}
                <Link href="/integrations/godot">Godot</Link> plugins put generated models into your project. Review scale and pivots before you build on them, and keep generated pieces in their own folder until they pass review. Importing by hand? Use the{" "}
                <Link href="/blog/import-ai-meshes">import guide</Link>.
              </p>
            </div>
          </section>

          <PickleCta
            line="Fill the level now, and polish the pieces players will notice."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
