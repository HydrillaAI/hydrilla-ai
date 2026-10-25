import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function ChangelogPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/changelog")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <h1 className="pickle-article-title">Changelog</h1>
          <div className="pickle-lead">
            <p>Releases to Hydrilla AI and BlueFox, Hydrilla&apos;s 3D model, newest first.</p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Each entry records what shipped and links to the page that explains it. When something changes how you work, such as a new input, a new integration, or a change to plans, <strong>it appears here first</strong>.
            </p>
          </div>

          <div className="pickle-log">
          <section className="pickle-head-block">
            <h2 className="pickle-h2">19 Aug 2026: BlueFox 1 in Studio</h2>
            <div className="pickle-text">
              <p>
                BlueFox 1 now runs in Studio: text or image input, segmented meshes with PBR maps, and a browser preview. Artists can generate, check parts and materials, and download results in one place.{" "}
                <Link href="/bluefox">About BlueFox</Link>
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">19 Aug 2026: REST API</h2>
            <div className="pickle-text">
              <p>
                Job-based generation for pipelines: send a prompt or a reference, track the job, fetch the files. Teams can now run the same generation as the workspace from their own code.{" "}
                <Link href="/api">REST API</Link>
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">19 Aug 2026: Docs, FAQ, and pipeline notes</h2>
            <div className="pickle-text">
              <p>
                Getting-started docs, a buyer FAQ, and the BlueFox 1 model card went public, so teams can evaluate Hydrilla before they sign up. <Link href="/docs">Docs</Link>
              </p>
            </div>
          </section>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
