import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import {
  PickleCards,
  PickleFlow,
  PickleMediaGrid,
  PickleQA,
  type PickleCardItem,
} from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Water Agent: BYOK AI 3D Agent for Artists & Studios | Hydrilla AI",
  description:
    "Hydrilla Water Agent turns a brief into procedural Three.js 3D with multi-pass planning, preview, refine, and export. Bring your own LLM key. Zero Hydrilla credits.",
  ogTitle: "Water Agent: the BYOK AI 3D agent for artists and studios",
  path: "/water",
  absoluteTitle: true,
});

const CAPABILITY_CARDS = [
  {
    icon: "docs",
    title: "Turn a brief into a plan",
    body: "Describe the asset in plain language, optionally attach a reference image. Water Agent plans the sculpt first so you can steer before code is generated.",
  },
  {
    icon: "image",
    title: "Multi-pass build quality",
    body: "Choose Fast, Standard, or Studio. Higher tiers unlock more build passes—from blockout through materials, and on Studio through surface, lighting, interaction, and optimization.",
  },
  {
    icon: "bluefox",
    title: "Refine in conversation",
    body: "Ask for a taller lantern or a darker crate. The director can apply scene edits or start a rebuild from the parent job so feedback stays local.",
  },
  {
    icon: "integrations",
    title: "Preview and export",
    body: "Run the generated TypeScript factory in the browser sandbox, then export GLB, GLTF, OBJ, STL, PNG, or the .ts source for your pipeline.",
  },
] satisfies PickleCardItem[];

export default function WaterPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/water")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Water Agent, the BYOK AI 3D agent for artists and studios
          </h1>
          <div className="pickle-lead">
            <p>
              Water Agent turns a creative brief into procedural Three.js you can preview, refine, and export—using your own LLM key, with no Hydrilla credit spend. It runs in the Hydrilla workspace for artists, game developers, and studios that need directed multi-pass sculpting instead of a one-shot mesh.
            </p>
          </div>
          <div className="pickle-actions">
            <Link href="/workspace" className="pickle-pill-solid">
              Open Water Agent
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleMediaGrid
            ratio="4 / 5"
            items={[
              {
                src: "/workflow/water-brief-before.png",
                alt: "Water Agent brief card describing fantasy armory props—an iron lantern, supply crate, and dagger stand—with a three-piece plan preview.",
                label: (
                  <>
                    <strong>Before</strong>Your brief
                  </>
                ),
                tone: "white",
              },
              {
                src: "/workflow/water-result-after.png",
                alt: "Illustrative procedural Three.js preview of the planned props: a warm-glass lantern, bolted crate, and dagger stand.",
                label: (
                  <>
                    <strong>After</strong>Procedural 3D preview
                  </>
                ),
                tone: "white",
              },
            ]}
          />
          <p className="pickle-caption">
            Water-specific illustrative pair: brief and plan on the left, procedural preview on the right. Swap for a live session capture when you have one.
          </p>

          <div className="pickle-intro">
            <p>
              Brief it <strong>the way you would brief your own team</strong>: the look, the pieces, and how they should hold together. Water plans the sculpt, builds through gated passes, and keeps the conversation open so you can revise until the result matches your direction.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What Water Agent is</h2>
            <div className="pickle-text">
              <p>
                Water is Hydrilla&apos;s bring-your-own-key (BYOK) code-sculpt agent. A generation does not return a Cloud GPU mesh. It returns a TypeScript factory—<code>export function createModel(): THREE.Group</code>—that the browser sandbox runs so you can inspect, refine, and export.
              </p>
              <p>
                Hydrilla charges <strong>zero credits</strong> for Water jobs. Your LLM provider key pays for planner, generator, and evaluator calls. That keeps credit pools free for BlueFox Cloud work while art leads still get volume prop and character iteration.
              </p>
              <p>
                Prefer a finished Cloud mesh from a prompt or picture? Use{" "}
                <Link href="/text-to-3d">text to 3D</Link> or{" "}
                <Link href="/image-to-3d">image to 3D</Link>. Prefer an external agent driving Hydrilla? Use the{" "}
                <Link href="/integrations/mcp">MCP server</Link>. Water is the in-app agent for directed procedural sculpting.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What you can direct</h2>
              <div className="pickle-text">
                <p>
                  Water Agent follows a studio rhythm: agree the plan, build through unlocked passes, preview the factory, then refine. You set intent; the harness carries out the production steps in one workspace thread.
                </p>
              </div>
            </div>
            <PickleCards cards={CAPABILITY_CARDS} />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">From brief to export</h2>
              <div className="pickle-text">
                <p>
                  Every generation follows the same pipeline. Quality tier controls how many passes run and how strict planning and evaluation are.
                </p>
              </div>
            </div>
            <PickleFlow
              label="Water Agent workflow from brief through export"
              direction="column"
              steps={[
                {
                  title: "Brief",
                  detail: "Text prompt, optional reference image, BYOK model, and quality tier.",
                },
                {
                  title: "Plan",
                  detail: "Planner writes a sculpt spec before code generation begins.",
                  emphasis: true,
                },
                {
                  title: "Multi-pass build",
                  detail: "Blockout → structural → form → material; Studio continues through surface, lighting, interaction, optimization.",
                },
                {
                  title: "Preview",
                  detail: "The TypeScript createModel() factory runs in the browser sandbox.",
                },
                {
                  title: "Refine",
                  detail: "Director chat for scene ops or a rebuild child job.",
                },
                {
                  title: "Export",
                  detail: "GLB, GLTF, OBJ, STL, PNG, or .ts source.",
                  emphasis: true,
                },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Quality tiers</h2>
            <div className="pickle-text">
              <p>
                <strong>Fast</strong> unlocks blockout only—useful for silhouette checks.{" "}
                <strong>Standard</strong> runs through material (blockout, structural, form, material) with evaluator LLM checks.{" "}
                <strong>Studio</strong> unlocks all eight passes, including surface, lighting, interaction, and optimization, for hero-level fidelity when the brief needs it.
              </p>
              <p>
                If a run hits its time budget, Water returns the best factory so far and marks the job partial, so you still get a preview instead of a hard failure.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Who it is for</h2>
            <div className="pickle-text">
              <p>
                <strong>Artists</strong> brief props and characters in language, review the plan, and refine silhouette or materials in the same thread.{" "}
                <strong>Game developers</strong> brief named parts and engine-ready structure, then export GLB into the project.{" "}
                <strong>Studios</strong> keep Water on BYOK so volume iteration does not burn the shared Hydrilla credit pool.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Water Agent at a glance</h2>
              <div className="pickle-text">
                <p>
                  Specs match the live workspace harness. Water is not Hydrilla Cloud mesh generation.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Spec</th>
                      <th>Water Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Surface</th>
                      <td>
                        <Link href="/workspace">Hydrilla workspace</Link>
                      </td>
                    </tr>
                    <tr>
                      <th>Inputs</th>
                      <td>Text brief, optional reference image, BYOK model, quality tier</td>
                    </tr>
                    <tr>
                      <th>Output</th>
                      <td>
                        TypeScript Three.js <code>createModel()</code> factory + sandbox preview
                      </td>
                    </tr>
                    <tr>
                      <th>Exports</th>
                      <td>GLB, GLTF, OBJ, STL, PNG, .ts</td>
                    </tr>
                    <tr>
                      <th>Billing</th>
                      <td>0 Hydrilla credits · your LLM provider key</td>
                    </tr>
                    <tr>
                      <th>Quality tiers</th>
                      <td>Fast · Standard · Studio</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Related pages</h2>
            <div className="pickle-text">
              <p>
                Getting started notes live in the{" "}
                <Link href="/docs#water">docs Water section</Link>. For Cloud mesh generation see{" "}
                <Link href="/text-to-3d">text to 3D</Link> and{" "}
                <Link href="/image-to-3d">image to 3D</Link>. External agents use the{" "}
                <Link href="/integrations/mcp">MCP server</Link>. Plans and credit rules are on{" "}
                <Link href="/pricing">pricing</Link>.
              </p>
              <p>
                Demo clips still needed for a Water-only reel: brief→plan, Studio pass progress, director refine, and export. No recycled BlueFox or homepage videos are used on this page.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Questions about Water Agent</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "What does Water Agent cost?",
                  a: "Water Agent costs no Hydrilla credits and is included on every plan. You bring your own LLM API key; that provider bills usage.",
                },
                {
                  q: "Who is it for?",
                  a: "3D artists, art leads, game developers, and studio teams who want directed, multi-pass procedural assets they can preview and refine in conversation.",
                },
                {
                  q: "Can a brief be a single asset?",
                  a: "Yes. A brief can be one prop or a character. The planner scopes only what you ask for.",
                },
                {
                  q: "When should I use text to 3D instead?",
                  a: (
                    <>
                      When you want a Cloud mesh from a single prompt.{" "}
                      <Link href="/text-to-3d">Text to 3D</Link> and{" "}
                      <Link href="/image-to-3d">image to 3D</Link> use BlueFox. Water is the BYOK code-sculpt agent.
                    </>
                  ),
                },
                {
                  q: "How is Water Agent different from the MCP server?",
                  a: (
                    <>
                      Water Agent is the in-app agent inside Hydrilla workspace. The MCP server lets your own AI agent drive Hydrilla from outside.{" "}
                      <Link href="/integrations/mcp">MCP server</Link>
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
