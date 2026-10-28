import { getKitJsonLd } from "@/lib/kit-schema";
import { WHY_HYDRILLA_MEDIA, WORKFLOW_DEMO } from "@/lib/cloudinary";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import {
  PickleCards,
  PickleCta,
  PickleFlow,
  PickleLinkCards,
  PickleMedia,
  PicklePlaceholder,
  PickleQA,
  PickleVideoPlayer,
  type PickleCardItem,
  type PickleLinkItem,
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

const AUDIENCE_CARDS = [
  {
    icon: "docs",
    title: "For artists",
    body: "Brief props and characters the way you brief a teammate. Review the plan, watch pass progress, and refine silhouette or materials without leaving the thread.",
  },
  {
    icon: "integrations",
    title: "For game developers",
    body: "Use game-oriented packs when the brief calls for named parts, collider hooks, or LOD-minded structure. Export GLB into your engine and keep iterating from chat.",
  },
  {
    icon: "security",
    title: "For studios",
    body: "Water uses your LLM key (BYOK) and spends no Hydrilla credits, so art leads can run volume prop work without burning the studio credit pool.",
  },
] satisfies PickleCardItem[];

const RESOURCE_LINKS = [
  {
    title: "Open Water in workspace",
    href: "/workspace",
    line: "Prompt, quality tier, preview, and export in the Hydrilla app.",
    icon: "bluefox",
  },
  {
    title: "Water Agent docs",
    href: "/docs#water",
    line: "Getting started notes and where Water fits next to BlueFox.",
    icon: "docs",
  },
  {
    title: "Text to 3D (Cloud)",
    href: "/text-to-3d",
    line: "One-shot mesh generation when you already know the single model.",
    icon: "image",
  },
  {
    title: "MCP server",
    href: "/integrations/mcp",
    line: "Drive Hydrilla from your own external agent—not the in-app Water Agent.",
    icon: "integrations",
  },
  {
    title: "Integrations",
    href: "/integrations",
    line: "Blender, Unity, Unreal, and Godot plugins for Hydrilla generation.",
    icon: "integrations",
  },
  {
    title: "Pricing",
    href: "/pricing",
    line: "Water Agent is included on every plan and uses zero Hydrilla credits.",
    icon: "enterprise",
  },
] satisfies PickleLinkItem[];

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
              Water Agent turns a creative brief into procedural Three.js you can preview, refine, and export—using your own LLM key, with no Hydrilla credit spend.
            </p>
          </div>
          <p className="pickle-chip">
            Live in Hydrilla workspace · Object Studio and Character packs · Animation and Game packs partial
          </p>
          <div className="pickle-actions">
            <Link href="/workspace" className="pickle-pill-solid">
              Open Water Agent
            </Link>
            <Link href="/docs#water" className="pickle-pill-ghost">
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-hero-group">
            <PickleVideoPlayer
              src={WHY_HYDRILLA_MEDIA.assets.video}
              poster={WHY_HYDRILLA_MEDIA.assets.poster}
              variant="hero"
            />
            <p className="pickle-caption">
              Hydrilla workspace footage used while a dedicated Water Agent session capture is produced. Autoplay is muted; use the player controls for sound.
            </p>
          </div>

          <div className="pickle-intro">
            <p>
              Brief it <strong>the way you would brief your own team</strong>: the look, the pieces, and how they should hold together. Water plans the sculpt, builds through gated passes, and keeps the conversation open so you can revise until the result matches your direction.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What Water Agent solves</h2>
            <div className="pickle-text">
              <p>
                One-shot mesh tools are strong when you already know a single model. Water is for directed, multi-pass code sculpting: props and characters that need a plan, quality tiers, and follow-up edits—without spending Hydrilla credits, because your provider key pays the LLM.
              </p>
              <p>
                Prefer a finished Cloud mesh from a prompt or picture? Use{" "}
                <Link href="/text-to-3d">text to 3D</Link> or{" "}
                <Link href="/image-to-3d">image to 3D</Link> with BlueFox. Prefer an external agent driving Hydrilla? Use the{" "}
                <Link href="/integrations/mcp">MCP server</Link>.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Direct the sculpt, pass by pass</h2>
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
                  Every generation follows the same pipeline. Studio quality unlocks the later passes; Fast stops after blockout when you need a quick silhouette.
                </p>
              </div>
            </div>
            <PickleFlow
              label="Water Agent workflow from brief through export"
              direction="column"
              steps={[
                {
                  title: "Brief",
                  detail: "Text prompt, optional reference image, model, and quality tier.",
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
            {/* TODO(kit): visual – Water pass-rail screenshot beside the flow */}
            <PicklePlaceholder alt="Water Agent progress rail showing blockout through material passes in the Hydrilla workspace." />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Who it is for</h2>
              <div className="pickle-text">
                <p>
                  Water Agent is built for people who brief assets in language and need a durable preview they can edit and ship into tools—not a one-prompt black box.
                </p>
              </div>
            </div>
            <PickleCards cards={AUDIENCE_CARDS} columns={3} />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Skill packs: live, partial, and coming</h2>
              <div className="pickle-text">
                <p>
                  The backend picks a skill pack from your prompt. Only live and partial packs run today; stubs stay off the path until they ship.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Pack</th>
                      <th>Status</th>
                      <th>What it steers</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Object Studio</th>
                      <td>Live</td>
                      <td>Hard-surface props and products</td>
                    </tr>
                    <tr>
                      <th>Character</th>
                      <td>Live</td>
                      <td>Stylized characters and creatures</td>
                    </tr>
                    <tr>
                      <th>Animation Ready</th>
                      <td>Partial</td>
                      <td>Sockets and idle motion hooks—not a full Auto-skin pipeline</td>
                    </tr>
                    <tr>
                      <th>Game Ready</th>
                      <td>Partial</td>
                      <td>Named parts, collider/LOD hooks prepared in code</td>
                    </tr>
                    <tr>
                      <th>Environment / World</th>
                      <td>Coming</td>
                      <td>Not selectable yet</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Walkthrough</h2>
              <div className="pickle-text">
                <p>
                  Until a Water-only session reel ships, this Hydrilla workflow demo shows the broader generate → review loop. Prefer a silent autoplay start; unmute from the controls if you want audio.
                </p>
              </div>
            </div>
            <PickleMedia
              src={WORKFLOW_DEMO.poster}
              videoSrc={WORKFLOW_DEMO.mp4}
              alt="Hydrilla workflow demo: generate a 3D asset, review it in the viewer, and continue iterating."
              caption={
                <>
                  Hydrilla product workflow demo (not Water-exclusive footage).{" "}
                  <a href={WORKFLOW_DEMO.mp4}>Open the MP4</a>
                  {" · "}
                  <a href={WORKFLOW_DEMO.webm}>WebM fallback</a>. Needed original clips: brief→plan, Studio passes, director refine, export.
                </>
              }
              ratio="16 / 9"
              hero
            />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Water Agent at a glance</h2>
              <div className="pickle-text">
                <p>
                  Specs match the live workspace harness. Water is not Hydrilla Cloud mesh generation; it outputs a gated Three.js factory your browser runs.
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
                      <td>TypeScript Three.js <code>createModel()</code> factory + sandbox preview</td>
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

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Resources</h2>
              <div className="pickle-text">
                <p>
                  Jump into the product, docs, and related Hydrilla surfaces. Third-party research pages are not required to use Water Agent.
                </p>
              </div>
            </div>
            <PickleLinkCards items={RESOURCE_LINKS} columns={2} />
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
                {
                  q: "Which skill packs are fully live?",
                  a: "Object Studio and Character are live. Animation Ready and Game Ready are partial. Environment and World are not selectable yet.",
                },
              ]}
            />
          </section>

          <PickleCta
            title="Bring your next brief"
            line="Open Water Agent in workspace with the brief for your next prop or character."
            primary={{ label: "Open Water Agent", href: "/workspace" }}
            secondary={{ label: "Read the docs", href: "/docs#water" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
