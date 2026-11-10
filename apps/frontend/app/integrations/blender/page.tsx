import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleFlow, PickleMedia, PickleMediaGrid, PickleQA } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Blender Add-on for AI 3D Generation | Hydrilla AI",
  description:
    "Install the Hydrilla add-on for Blender, sign in, and generate from a prompt or image in the Hydrilla tab, or import GLB from Studio.",
  ogTitle: "Hydrilla for Blender",
  path: "/integrations/blender",
  absoluteTitle: true,
  keywords: [
    "Blender AI 3D add-on",
    "best AI 3D plugin for Blender",
    "best AI 3D plugin",
    "Hydrilla Blender plugin",
    "generate 3D in Blender",
  ],
});

export default function BlenderIntegrationPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/integrations/blender")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">
            <Link href="/integrations">Integrations</Link>
          </p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla for Blender
          </h1>
          <div className="pickle-lead">
            <p>
              The Hydrilla add-on for Blender generates from a prompt or image inside your scene. It also receives models that you send from Studio through the local Bridge.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Available</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
          <div className="pickle-actions">
            <a href="/plugins/hydrilla-blender.zip" className="pickle-pill-solid">
              Install the Blender add-on
            </a>
            <Link href="/app/api-keys" className="pickle-pill-ghost">
              Get an API key
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleMedia
            ratio="1024 / 886"
            tone="dark"
            src="/integrations/blender/03-hydrilla-tab.jpg"
            alt="Blender 3D Viewport with the sidebar open and the Hydrilla tab highlighted."
          />

          <div className="pickle-intro">
            <p>
              For Blender artists, that means <strong>the whole loop happens in one window</strong>. You can block out a scene, generate the pieces it needs from the sidebar, and keep modeling, sculpting, or shading around them without a browser download in between.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Install from disk</h2>
              <div className="pickle-text">
                <p>The add-on installs like any other Blender add-on, from a single zip file.</p>
                <ol className="pickle-steps">
                  <li>Download hydrilla-blender.zip using the button on this page.</li>
                  <li>In Blender, open Edit &gt; Preferences &gt; Add-ons.</li>
                  <li>Open the menu at the top right and choose Install from Disk.</li>
                  <li>Select hydrilla-blender.zip, then tick the box to enable the Hydrilla add-on.</li>
                  <li>In the 3D Viewport, press N to open the sidebar, then click the Hydrilla tab.</li>
                </ol>
              </div>
            </div>
            <PickleMediaGrid
              ratio="1024 / 776"
              items={[
                {
                  src: "/integrations/blender/01-install-from-disk.jpg",
                  alt: "Blender Preferences, Add-ons section, with Install from Disk chosen in the top-right menu.",
                  label: <><strong>Step 3</strong>Install from Disk</>,
                  tone: "dark",
                },
                {
                  src: "/integrations/blender/02-open-sidebar.jpg",
                  alt: "Blender 3D Viewport with the N-panel sidebar opened.",
                  label: <><strong>Step 5</strong>Open the sidebar</>,
                  tone: "dark",
                },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Direct whole sets from Blender</h2>
            <div className="pickle-text">
              <p>
                Once the add-on is installed, Water Agent works inside Blender through it. Brief a full set, check the plan, and refine individual pieces while the scene stays open in front of you.{" "}
                <Link href="/water">What Water Agent does</Link>
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Generate in the Hydrilla tab</h2>
              <div className="pickle-text">
                <p>
                  Paste your API key once, then generate from a typed prompt or a picture. Click Run Bridge to receive models from Send to DCC in Studio or from your AI agent. Generated models arrive in the open scene, ready for you to place, light, and shade.
                </p>
              </div>
            </div>
            {/* TODO(kit): visual – replace with a capture of the open Hydrilla panel (API key, Generate, Run Bridge) */}
            <PickleFlow
              label="The Hydrilla tab workflow: paste your API key, generate, and run the Bridge to receive from Studio or your agent."
              steps={[
                { title: "API key", detail: "Paste it once" },
                { title: "Generate", detail: "Prompt or picture", emphasis: true },
                { title: "Run Bridge", detail: "Receive from Studio or your agent" },
              ]}
            />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Troubleshooting</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "The add-on says my key was not accepted.",
                  a: (
                    <>
                      Create a new key under <Link href="/app/api-keys">API keys</Link>, paste it into the Hydrilla tab, and choose Check. The add-on uses an API key, so there is no browser sign-in to keep open.
                    </>
                  ),
                },
                {
                  q: "Nothing arrives when I send from Studio.",
                  a: (
                    <>
                      Check that Run Bridge is active in the Hydrilla panel and Blender is open on a scene, then send again. Formats other than GLB are covered on{" "}
                      <Link href="/features#exports">exports</Link>.
                    </>
                  ),
                },
                {
                  q: "The model looks too small or too large.",
                  a: (
                    <>
                      Blender works in meters with Z up. Check the <Link href="/docs#scale">units table</Link> before you scale anything by hand.
                    </>
                  ),
                },
              ]}
            />
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
