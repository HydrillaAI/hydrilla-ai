import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCards, PickleCode, PickleFlow } from "@/components/layout/PicklePage";
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


export default function ApiPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/api")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Developers</p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla REST API
          </h1>
          <div className="pickle-lead">
            <p>
              Run BlueFox, Hydrilla&apos;s 3D model, from your own code. The REST API uses the same AI 3D generation as the Hydrilla AI workspace, for asset pipelines, engines, and internal tools.
            </p>
          </div>
          <div className="pickle-actions">
            <Link href="/app/api-keys" className="pickle-pill-solid">
              Get an API key
            </Link>
            <Link href="/docs" className="pickle-pill-ghost">
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* Request and response copied from the API quickstart (hdocs/hydrilla_doc/app/quickstart). Keep in sync with the API reference. */}
          <PickleCode
            label="Code panel showing an API request that submits a generation job and the job record it returns."
            panes={[
              {
                title: "POST /v1/3d/text-to-3d",
                code: `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "resolution": 1536
  }'`,
              },
              {
                title: "Response",
                code: `{
  "id": "job_c18ab44d03e192a40",
  "status": "queued",
  "resolution": 1536,
  "links": {
    "poll": "https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_c18ab44d03e192a40"
  }
}`,
              },
            ]}
          />

          <div className="pickle-intro">
            <p>
              The API is for teams that want <strong>generation to happen where their work already lives</strong>: an asset library that fills itself from a request queue, a review tool that creates stand-ins on demand, or a build step that produces placeholder props for a new level.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Submit, poll, download</h2>
              <div className="pickle-text">
                <p>
                  Submit a job, poll its status, then download the mesh and maps. Each job moves from queued to processing and ends completed or failed, so your pipeline always knows where a request stands and can retry the ones that fail.
                </p>
              </div>
            </div>

            <PickleFlow
              label="Four-step strip: submit a job, queued, processing, then completed or failed."
              steps={[
                { title: "Submit" },
                { title: "Queued" },
                { title: "Processing" },
                { title: "Completed or failed", emphasis: true },
              ]}
            />

            <div className="pickle-text">
              <p>
                Because jobs run asynchronously, a single script can submit a batch, carry on with other work, and collect finished models as they complete. Nothing in your pipeline has to wait on one request.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What you can send and get back</h2>
              <div className="pickle-text">
                <p>
                  Requests mirror the two ways to start in the workspace, and results come back in the same structure an artist would see in the preview.
                </p>
              </div>
            </div>

            <PickleCards
              titleAs="p"
              cards={[
                {
                  icon: "text",
                  title: "You send",
                  body: (
                    <ul>
                      <li>A text prompt describing the asset and its use</li>
                      <li>Or a reference image to follow</li>
                      <li>Your API key with every request</li>
                    </ul>
                  ),
                },
                {
                  icon: "export",
                  title: "You get back",
                  body: (
                    <ul>
                      <li>A job ID and its current status</li>
                      <li>A mesh in parts, with UVs and texture maps</li>
                      <li>
                        Files in any of Hydrilla&apos;s{" "}
                        <Link href="/features#exports">export formats</Link>
                      </li>
                    </ul>
                  ),
                },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Access and authentication</h2>
            <div className="pickle-text">
              {/* VERIFY: REST API on plans other than Pro (VERIFY-LIST #11, #26) */}
              <p>
                Create a key in your account and keep it server-side, never in a client app or a public repository. Plan access is listed on{" "}
                <Link href="/pricing">pricing</Link>, and higher volume runs through{" "}
                <Link href="/enterprise">Enterprise</Link>. Building for an AI agent? Use the{" "}
                <Link href="/integrations/mcp">MCP server</Link>, which calls this API on the agent&apos;s behalf.
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
