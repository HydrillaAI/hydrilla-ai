import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "How to Choose an AI 3D Model Generator | Hydrilla AI",
  description:
    "Ten criteria for judging any AI 3D generator, from parts and PBR maps to licensing and API, plus a simple method for a fair bake-off.",
  ogTitle: "How to choose an AI 3D generator",
  path: "/compare/how-to-choose",
  absoluteTitle: true,
});

const CRITERIA = [
  ["Inputs", "Text, one image, or several views change how much you can direct", "Run the same prompt and photo in each tool"],
  ["Output type", "A mesh, a point cloud, and a splat need different pipelines", "Open the file and see what is inside"],
  ["Parts", "Separate parts make material and edit work simpler", "Count the objects after import"],
  ["PBR maps", "The maps decide how an asset reacts to your lighting", "List the texture maps that come with the file"],
  ["Formats", "The file has to open where your team works", "Export every format you need and import each one"],
  ["Engine and DCC path", "Plugins and bridges remove manual import steps", "Install the plugin and bring one asset across"],
  ["API", "Pipelines and internal tools need jobs run from code", "Read the API reference and run a single job"],
  ["Licensing", "Commercial use and ownership can differ by plan", "Check the license wording for the plan you would buy"],
  ["Data and security", "Studios need to know where inputs and outputs go", "Ask for the security page and data-use terms"],
  ["Cost predictability", "Published credit math sets the real cost per asset", "Work out the cost of one finished model"],
] as const;

export default function HowToChoosePage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare/how-to-choose")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Compare</p>
          <h1 className="pickle-article-title" data-wide="true">
            How do you choose an AI 3D generator?
          </h1>
          <div className="pickle-lead">
            <p>
              Start from the job, not the demo reel. Decide what the asset has to do in your engine or DCC, then test each tool against ten practical criteria and one shared brief in your own scene.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Checked 24 Oct 2026</span>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Demo reels show each tool at its best, on subjects chosen to flatter it. <strong>Your pipeline has its own polygon budgets, lighting, and review standards</strong>, and those decide whether a generated asset saves time or creates cleanup. The criteria and method below work for any tool you are weighing.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Ten criteria that decide fit</h2>
              <div className="pickle-text">
                <p>
                  Not every criterion matters equally to every team. Mark the three that would end the evaluation if a tool failed them, and weigh those first.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Why it matters</th>
                      <th>How to check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRITERIA.map((row) => (
                      <tr key={row[0]}>
                        <th>{row[0]}</th>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Run a fair bake-off</h2>
            <div className="pickle-text">
              <p>
                Test any AI 3D generator on the same brief, in your own engine or DCC, before you commit. Keep the brief short and the scoring sheet fixed, so the comparison stays about the output and not the presentation.
              </p>
              <ol className="pickle-steps">
                <li>Write one brief with three assets taken from a real task.</li>
                <li>Generate each asset in every tool with identical inputs.</li>
                <li>Import the results into your scene, under your own lighting.</li>
                <li>Score each criterion, then log the cleanup time per asset.</li>
              </ol>
              <p>
                Cleanup time is the number that matters most. A tool that produces a slightly weaker first result but needs half the fixing often costs less per finished asset.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Where Hydrilla fits</h2>
            <div className="pickle-text">
              <p>
                Hydrilla AI runs BlueFox, Hydrilla&apos;s 3D model, which returns segmented meshes with PBR maps from a prompt or an image. Its{" "}
                <Link href="/bluefox#limits">fit and limits</Link> are stated on the model page. Its <Link href="/bluefox">model</Link>,{" "}
                <Link href="/features#exports">exports</Link>, <Link href="/security">security</Link>, and{" "}
                <Link href="/pricing">credit costs</Link> are all public, so you can score it against the same criteria as any other tool.
              </p>
            </div>
          </section>
          <PickleCta
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
