import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Import AI 3D Meshes into Unity, Unreal, Godot | Hydrilla AI",
  description:
    "Fix axis and material problems when you import a generated GLB or FBX into Unity, Unreal, or Godot, with a step-by-step checklist.",
  ogTitle: "Importing AI meshes into game engines",
  path: "/blog/import-ai-meshes",
  absoluteTitle: true,
});

export default function ImportAiMeshesPost() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/blog/import-ai-meshes")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Guide</p>
          <h1 className="pickle-article-title" data-wide="true">
            How do you import an AI-generated mesh into a game engine?
          </h1>
          <div className="pickle-lead">
            <p>
              <Link href="/features#exports">Export a GLB or FBX</Link>, then check the up axis and materials on import. Most problems come from tools disagreeing about orientation and texture setup, not from the mesh itself.
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
              The good news is that <strong>these problems repeat</strong>. Once you have fixed them for one asset and saved the settings, every later import from the same source arrives the same way. This guide covers the two checks that matter and a checklist to keep beside your engine.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Why does the model arrive on its side?</h2>
            <div className="pickle-text">
              <p>
                Tools disagree on the up axis: Blender and Unreal use Z up, while Unity, Godot, and glTF use Y up, so a model can arrive lying on its side. Fix it in the importer rather than rotating the object, so the correction applies to every asset and pivots stay where they should be. Units and scale are covered in the{" "}
                <Link href="/docs#scale">docs</Link>.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">How do you keep the materials?</h2>
            <div className="pickle-text">
              <p>
                GLB packs its textures inside the file, so materials usually arrive assigned. Other formats often point to separate texture files, so keep the maps beside the mesh and check the UVs came through. Base color is sRGB; roughness, metalness, and normal maps are linear. If a material looks washed out or too dark, a color-space setting is the first thing to check.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Import checklist</h2>
            <div className="pickle-text">
              <ol className="pickle-steps">
                <li>Pick the format your importer prefers: GLB or FBX.</li>
                <li>Fix the up axis in import settings, not by rotating the object.</li>
                <li>Open each material and confirm every texture slot has a map.</li>
                <li>If bumps look inverted, flip the normal map&apos;s green channel (Unreal uses DirectX style).</li>
                <li>Save the import settings as a preset, so every later asset arrives the same way.</li>
              </ol>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Prefer a plugin?</h2>
            <div className="pickle-text">
              <p>
                Plugins for the three engines, <Link href="/integrations/unity">Unity</Link>, <Link href="/integrations/unreal">Unreal Engine</Link>, and{" "}
                <Link href="/integrations/godot">Godot</Link>, place GLB files in a fixed project folder for you, so most of these checks are handled once and reused.
              </p>
            </div>
          </section>
          <PickleCta primary={{ label: "Start generating", href: "/app/studio" }} />
        </div>
      </article>
      <Footer />
    </>
  );
}
