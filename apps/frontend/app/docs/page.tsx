import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PicklePlaceholder } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Docs: Get Started with Hydrilla AI 3D | Hydrilla AI",
  description:
    "Create a workspace, generate your first model from text or an image with BlueFox, preview it in the browser, and export it for your tools.",
  ogTitle: "Get started with Hydrilla",
  path: "/docs",
  absoluteTitle: true,
});

const SCALE_ROWS = [
  ["Blender", "Meters", "Z up", "Apply scale before you export again"],
  ["Unreal Engine", "Centimeters", "Z up", "Check the import scale field"],
  ["Unity", "Meters", "Y up", "Compare against a default cube"],
  ["glTF 2.0 (GLB)", "Meters", "Y up", "Importers read this as the source"],
  ["Godot 4", "Meters", "Y up", "Compare against a one-meter box"],
] as const;

export default function DocsPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/docs")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Documentation</p>
          <h1 className="pickle-article-title" data-wide="true">
            Get started with Hydrilla
          </h1>
          <div className="pickle-lead">
            <p>This guide takes a new Hydrilla AI account to its first AI 3D export, step by step, in the browser.</p>
          </div>
          <div className="pickle-actions">
            <Link href="/app/studio" className="pickle-pill-solid">
              Start generating
            </Link>
            <Link href="/pricing" className="pickle-pill-ghost">
              See pricing
            </Link>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              It is <strong>written for the first hour with Hydrilla</strong>. Follow the steps in order and you will finish with a model in your own tool, plus the settings that keep every later import consistent. Each product page goes deeper; this page stays practical.
            </p>
          </div>

          <nav aria-label="On this page" className="pickle-actions">
            <a href="#first-export" className="pickle-pill-ghost">Your first export</a>
            <a href="#preview" className="pickle-pill-ghost">Preview and export</a>
            <a href="#credits" className="pickle-pill-ghost">Workspaces and credits</a>
            <a href="#scale" className="pickle-pill-ghost">Get the scale right on import</a>
            <a href="#water" className="pickle-pill-ghost">Water Agent</a>
          </nav>
          <section id="first-export" className="pickle-head-block scroll-mt-28">
            <h2 className="pickle-h2">Your first export</h2>
            <div className="pickle-text">
              <p>Six steps take you from sign-up to a file in your project. None of them need a plugin, so you can start in any browser.</p>
              <ol className="pickle-steps">
                <li>Sign up, then open Studio.</li>
                <li>Create a workspace so a project&apos;s generations stay together.</li>
                <li>
                  Generate: write a prompt in <Link href="/text-to-3d">text to 3D</Link>, or drop a photo into{" "}
                  <Link href="/image-to-3d">image to 3D</Link>.
                </li>
                <li>Preview the model: orbit it and check parts and materials.</li>
                <li>Choose a format in the export menu and export.</li>
                <li>
                  Import the file into Blender, Unity, Unreal, or Godot, or send it with a <Link href="/integrations">plugin</Link>.
                </li>
              </ol>
            </div>
            {/* TODO(kit): visual – Studio screen for the current step, with the relevant button highlighted. One capture per step. */}
            <PicklePlaceholder alt="Studio screen for the current step, with the relevant button highlighted." />
          </section>
          <section id="preview" className="pickle-head-block scroll-mt-28">
            <h2 className="pickle-h2">Preview and export</h2>
            <div id="export" className="pickle-text scroll-mt-28">
              <p>
                The preview shows the model under light, so shape and material problems appear before you download. Orbit it from every side, select parts to check how the mesh is divided, and look at the materials in light and shadow. When it looks right, open the export menu; it lists every format, and{" "}
                <Link href="/features#exports">this table shows which suits which tool</Link>.
              </p>
            </div>
          </section>
          <section id="credits" className="pickle-head-block scroll-mt-28">
            <h2 className="pickle-h2">Workspaces and credits</h2>
            <div className="pickle-text">
              <p>
                A workspace keeps a project&apos;s generations and versions in one place, so it is easy to compare drafts and find the version you approved. Each generation spends plan credits, and your account shows what is left.{" "}
                <Link href="/pricing">Cost per model</Link>
              </p>
            </div>
          </section>
          <section id="scale" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Get the scale right on import</h2>
              <div className="pickle-text">
                <p>
                  Every tool assumes its own unit and up axis. A mesh in meters arrives a hundred times too small in a tool expecting centimeters, unless the importer converts it. Check the first asset you bring into a project against the table, then save the importer settings so the next import matches.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Tool</th>
                      <th>Unit</th>
                      <th>Up axis</th>
                      <th>What to watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCALE_ROWS.map((row) => (
                      <tr key={row[0]}>
                        <th>{row[0]}</th>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
          <section id="water" className="pickle-head-block scroll-mt-28">
            <h2 className="pickle-h2">Water Agent</h2>
            <div className="pickle-text">
              <p>
                Open Water Agent in the Hydrilla app, or through the Hydrilla plugin inside Blender, Unity, Unreal, or Godot. Describe your brief, review the plan, and revise piece by piece until the set is right.{" "}
                <Link href="/water">What Water Agent does</Link>
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Where to go next</h2>
            <div className="pickle-text">
              <p>
                Running jobs from code? See the <Link href="/api">REST API</Link>. Working inside an engine or DCC every day? Install a{" "}
                <Link href="/integrations">plugin</Link>. Account and licensing questions are answered in the <Link href="/faq">FAQ</Link>.
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
