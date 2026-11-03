import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Unreal Engine Plugin for AI 3D Models | Hydrilla AI",
  description:
    "Install the Hydrilla plugin for Unreal Engine and bring BlueFox meshes into the Unreal Editor, ready to place, light, and test.",
  ogTitle: "Hydrilla for Unreal Engine",
  path: "/integrations/unreal",
  absoluteTitle: true,
  keywords: [
    "Unreal Engine AI 3D plugin",
    "best AI 3D plugin for Unreal Engine",
    "best AI 3D plugin",
    "Hydrilla Unreal plugin",
    "generate 3D in Unreal Editor",
  ],
});

export default function UnrealIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/unreal")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla for Unreal Engine
          </h1>
          <div className="pickle-lead">
            <p>
              Generate 3D models and bring them into Unreal Editor. A Python editor plugin runs generation from the toolbar, and it receives models you send from Studio over the Bridge.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Available</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
          <div className="pickle-actions">
            <a href="/plugins/hydrilla-unreal.zip" className="pickle-pill-solid">
              Install the Unreal plugin
            </a>
            <Link href="/app/api-keys" className="pickle-pill-ghost">
              Get an API key
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              For level artists and previs teams working in Unreal, the plugin <strong>removes the round trip between a browser and the Content Browser</strong>. Generated assets arrive where Unreal expects them, ready to place, light, and test in the level you are building.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Install</h2>
            <div className="pickle-text">
              <p>The plugin runs on Unreal&apos;s built-in Python support, so the first step is to switch that on.</p>
              <ol className="pickle-steps">
                <li>Enable the Python Editor Script Plugin in Unreal, then restart the editor.</li>
                <li>Unzip the download and place its Hydrilla folder in Content/Python or Plugins.</li>
                <li>Open the Hydrilla actions from the editor toolbar.</li>
                <li>Set your API key there, or switch on the Bridge listener.</li>
              </ol>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Generate from the editor</h2>
              <div className="pickle-text">
                <p>
                  Run a job from the Hydrilla toolbar with your own brief. GLB files land in Content/Hydrilla, where the glTF importer turns them into assets you can place, light, and test. From there they behave like any other imported asset in your project.
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – replace with a screenshot of the Hydrilla toolbar in Unreal */}
            <PickleFlow
              label="Unreal flow: run a job from the Hydrilla toolbar, and GLB files land in Content/Hydrilla for the glTF importer."
              steps={[
                { title: "Hydrilla toolbar", detail: "Python editor plugin" },
                { title: "Your brief", detail: "Runs with your API key" },
                { title: "Content/Hydrilla", detail: "Imported by the glTF importer", emphasis: true },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check the import</h2>
            <div className="pickle-text">
              <p>
                Unreal works in centimeters with Z up, while GLB is defined in meters with Y up, so it is worth confirming the import scale on your first asset. The{" "}
                <Link href="/docs#scale">units table</Link> shows what to expect, and the{" "}
                <Link href="/blog/import-ai-meshes">import guide</Link> covers axis and normal-map settings.
              </p>
            </div>
          </section>
          <PickleCta line="Dress the level from the toolbar, and spend review time on the shots that matter." />
        </div>
      </article>
      <Footer />
    </>
  );
}
