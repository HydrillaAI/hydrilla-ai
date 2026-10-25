import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Unity Plugin for AI 3D Models | Hydrilla AI",
  description:
    "Install the Hydrilla plugin for Unity, generate with BlueFox from the editor, and receive GLB models straight into your project.",
  ogTitle: "Hydrilla for Unity",
  path: "/integrations/unity",
  absoluteTitle: true,
});

export default function UnityIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/unity")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla for Unity
          </h1>
          <div className="pickle-lead">
            <p>
              Generate and import 3D models without leaving the Unity Editor. The plugin adds an Editor window that generates with your API key, and it accepts Studio sends over the Bridge whenever the project is open.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Available</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
          <div className="pickle-actions">
            <a href="/plugins/hydrilla-unity.zip" className="pickle-pill-solid">
              Install the Unity plugin
            </a>
            <Link href="/app/api-keys" className="pickle-pill-ghost">
              Get an API key
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Unity teams use it to <strong>fill scenes while the design is still moving</strong>. A designer can generate a stand-in prop beside the Scene view, drop it into a level, and keep iterating on layout without waiting on an art queue.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Install</h2>
            <div className="pickle-text">
              <p>Installation is a folder copy, with no package registry to configure.</p>
              <ol className="pickle-steps">
                <li>Download hydrilla-unity.zip from this page and unzip it.</li>
                <li>Copy the Hydrilla folder into your project&apos;s Assets folder.</li>
                <li>In the menu bar, open Window &gt; Hydrilla &gt; Generate 3D.</li>
                <li>Paste your hyd_live_ API key, or start the Bridge to receive models.</li>
              </ol>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Generate from the editor</h2>
              <div className="pickle-text">
                <p>
                  Type a prompt or choose an image in the Hydrilla window and generate. Finished models download as GLB into Assets/Hydrilla, ready to drag into a scene. Keeping every generated asset in one folder makes it easy to review, rename, or move them into your own project structure later.
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – replace with a screenshot of the Hydrilla window in Unity */}
            <PickleFlow
              label="Unity flow: the Hydrilla window generates with your API key and saves GLB files into Assets/Hydrilla."
              steps={[
                { title: "Hydrilla window", detail: "Window > Hydrilla > Generate 3D" },
                { title: "Prompt or image", detail: "Generates with your API key" },
                { title: "Assets/Hydrilla", detail: "GLB, ready to drag into a scene", emphasis: true },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check the import</h2>
            <div className="pickle-text">
              <p>
                Unity works in meters with Y up, which matches GLB, so most models arrive at a sensible size and orientation. If scale still looks off, check the{" "}
                <Link href="/docs#scale">units table</Link>. For axis or material questions, work through the{" "}
                <Link href="/blog/import-ai-meshes">import checklist</Link> before you change anything by hand.
              </p>
            </div>
          </section>
          <PickleCta line="Generate the prop you need beside the Scene view, and keep building." />
        </div>
      </article>
      <Footer />
    </>
  );
}
