import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Godot 4 Plugin for AI 3D Models | Hydrilla AI",
  description:
    "Install the Hydrilla plugin for Godot 4 and bring GLB models generated with BlueFox into your project.",
  ogTitle: "Hydrilla for Godot 4",
  path: "/integrations/godot",
  absoluteTitle: true,
  keywords: [
    "Godot 4 AI 3D plugin",
    "best AI 3D plugin for Godot",
    "best AI 3D plugin",
    "Hydrilla Godot plugin",
    "generate 3D in Godot 4",
  ],
});

export default function GodotIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/godot")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla for Godot 4
          </h1>
          <div className="pickle-lead">
            <p>
              Bring Hydrilla GLB into Godot 4 projects. The editor plugin generates through the API with your key and listens on the Bridge for models sent from Studio, so both routes end in the same folder.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Available</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
          <div className="pickle-actions">
            <a href="/plugins/hydrilla-godot.zip" className="pickle-pill-solid">
              Install the Godot plugin
            </a>
            <Link href="/app/api-keys" className="pickle-pill-ghost">
              Get an API key
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              <strong>Godot reads glTF natively</strong>, which makes it a natural fit for generated assets. The plugin adds a dock to the editor, so small teams and solo developers can generate the props a scene needs without leaving the project.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Install</h2>
            <div className="pickle-text">
              <p>The plugin follows Godot&apos;s standard addon layout and is enabled from Project Settings.</p>
              <ol className="pickle-steps">
                <li>Download the plugin and copy addons/hydrilla into your Godot project.</li>
                <li>Open Project Settings &gt; Plugins and enable the Hydrilla plugin.</li>
                <li>Open the Hydrilla dock and add your hyd_live_ key.</li>
                <li>Generate from the dock, or listen on the Bridge for Studio sends.</li>
              </ol>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Where models land</h2>
              <div className="pickle-text">
                <p>
                  Imported meshes land under res://hydrilla/, so every generated asset sits in one folder you can move or version. Keeping them together makes it simple to review what was generated, commit it alongside your scenes, or swap a stand-in for a finished asset later.
                </p>
              </div>
            </div>
            <PickleFlow
              label="Godot flow: the Hydrilla dock generates through the API, Studio sends arrive over the Bridge, and both land in res://hydrilla/."
              steps={[
                { title: "Hydrilla dock", detail: "Generates with your key" },
                { title: "Bridge", detail: "Receives Studio sends" },
                { title: "res://hydrilla/", detail: "One folder for every asset", emphasis: true },
              ]}
            />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Check the import</h2>
            <div className="pickle-text">
              <p>
                Godot 4 works in meters with Y up, like GLB, so models usually arrive at the right scale and orientation. Compare the first one against a one-meter box, and see the{" "}
                <Link href="/docs#scale">units table</Link> and the <Link href="/blog/import-ai-meshes">import guide</Link> if anything looks wrong.
              </p>
            </div>
          </section>

          <PickleCta line="Generate inside the editor, and keep every asset in one versioned folder." />
        </div>
      </article>
      <Footer />
    </>
  );
}
