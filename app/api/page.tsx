import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "REST API: BlueFox Text and Image to 3D | Hydrilla AI",
  description:
    "Generate 3D models from your own code with BlueFox. Submit a text or image job, poll its status, and download the mesh and maps.",
  ogTitle: "Hydrilla REST API",
  path: "/api",
  absoluteTitle: true,
});

const API_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebAPI",
      "@id": "https://hydrilla.ai/api#webapi",
      name: "Hydrilla REST API",
      url: "https://hydrilla.ai/api",
      description:
        "Generate 3D models from your own code with BlueFox. Submit a text or image job, poll its status, and download the mesh and maps.",
      provider: {
        "@id": "https://hydrilla.ai/#organization",
      },
    },
  ],
};

export default function ApiPage() {
  return (
    <>
      <JsonLd data={API_JSON_LD} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Developers</p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla REST API
          </h1>
          <div className="pickle-text" style={{ textAlign: "center" }}>
            <p>
              Run BlueFox, Hydrilla&apos;s 3D model, from your own code. The REST API uses the same AI 3D generation as the Hydrilla AI workspace, for asset pipelines, engines, and internal tools.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/api-keys" className="pickle-pill-solid">
              Get an API key
            </Link>
            <Link
              href="/docs"
              className="pickle-glass-pill"
              style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
            >
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – dark code panel with the documented submit request and its job response, copied from the real API reference. No sample is written here, so no endpoint is invented. */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="Code panel showing an API request that submits a generation job and the job record it returns."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Submit, poll, download</h2>
              <div className="pickle-text">
                <p>
                  Submit a job, poll its status, then download the mesh and maps. Each job moves from queued to processing and ends completed or failed, so your pipeline can retry.
                </p>
              </div>
            </div>

            <div
              role="img"
              aria-label="Four-step strip: submit a job, queued, processing, then completed or failed."
              className="pickle-card-surface flex flex-wrap items-center justify-center gap-4 text-[17px] font-medium"
            >
              <span>Submit</span>
              <span aria-hidden className="text-black/25">|</span>
              <span>Queued</span>
              <span aria-hidden className="text-black/25">|</span>
              <span>Processing</span>
              <span aria-hidden className="text-black/25">|</span>
              <span>Completed or failed</span>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What you can send and get back</h2>
            </div>

            <div className="pickle-research-grid" style={{ width: "100%", marginTop: 0 }}>
              <div className="pickle-card-surface">
                <p className="pickle-text" style={{ width: "100%" }}>
                  <strong>You send</strong>
                </p>
                <div className="pickle-text" style={{ width: "100%" }}>
                  <ul>
                    <li>A text prompt describing the asset and its use</li>
                    <li>Or a reference image to follow</li>
                    <li>Your API key with every request</li>
                  </ul>
                </div>
              </div>

              <div className="pickle-card-surface">
                <p className="pickle-text" style={{ width: "100%" }}>
                  <strong>You get back</strong>
                </p>
                <div className="pickle-text" style={{ width: "100%" }}>
                  <ul>
                    <li>A job ID and its current status</li>
                    <li>A mesh in parts, with UVs and texture maps</li>
                    <li>
                      Files in any of Hydrilla&apos;s{" "}
                      <Link href="/features#exports">export formats →</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Access and authentication</h2>
            <div className="pickle-text">
              {/* VERIFY: REST API on plans other than Pro (VERIFY-LIST #11, #26) */}
              <p>
                Create a key in your account; keep it server-side. Plan access is on{" "}
                <Link href="/pricing">pricing →</Link>, and volume through{" "}
                <Link href="/enterprise">Enterprise →</Link>. Building for an AI agent? Use the{" "}
                <Link href="/integrations/mcp">MCP server →</Link>.
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
