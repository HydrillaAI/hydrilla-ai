import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCards, PickleCta, PickleHeroVideo, PickleQA } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Water Agent: The AI 3D Agent for Studios | Hydrilla AI",
  description:
    "Hydrilla Water Agent is the AI 3D agent that works with artists and studios, from brief to finished 3D assets, inside the tools they already use.",
  ogTitle: "Water Agent: the AI 3D agent for artists and studios",
  path: "/water",
  absoluteTitle: true,
});


export default function WaterPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/water")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Water Agent, the AI 3D agent for artists and studios
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.
            </p>
          </div>
          <div className="pickle-actions">
            <Link href="/app/water" className="pickle-pill-solid">
              Open Water Agent
            </Link>
            <Link href="/docs#water" className="pickle-pill-ghost">
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              Brief it <strong>the way you would brief your own team</strong>: the look, the pieces, and the scene they belong to. It plans the set, shows you the plan, and works through each piece with you until the result matches your direction.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Direct the set, piece by piece</h2>
              <div className="pickle-text">
                <p>
                  Water Agent follows the way creative leads already work. You set the intent and make the calls, and it carries out the production steps in one conversation.
                </p>
              </div>
            </div>
            {/* VERIFY: Safe wording "plans the set with you before it builds" (VERIFY-LIST #6) */}
            <PickleCards
              cards={[
                {
                  icon: "docs",
                  title: "Turn a brief into a plan",
                  body: "Describe what the scene needs in plain language. Water Agent breaks the brief into pieces and shows you the plan first, so you can change course before work begins.",
                },
                {
                  icon: "image",
                  title: "Direct the look",
                  body: "Set the style, mood, and level of detail in your brief, then keep refining it in the same conversation, with the plan, your notes, and every revision in one thread.",
                },
                {
                  icon: "bluefox",
                  title: "Revise piece by piece",
                  body: "Ask for a taller lantern or a darker crate, and only that piece changes. The rest of the set stays as it is, so feedback rounds stay small.",
                },
                {
                  icon: "integrations",
                  title: "Work inside your tools",
                  body: "Brief and revise from the DCC or engine you already use, through the Hydrilla plugin. Each piece lands in the project you have open.",
                },
              ]}
            />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">From brief to finished set</h2>
            <div className="pickle-text">
              <p>Every session follows the rhythm of a good art review: agree the plan, build, review, refine.</p>
              {/* VERIFY: Safe step 2 "Review the plan and adjust it" (VERIFY-LIST #6) */}
              <ol className="pickle-steps">
                <li>
                  Write the brief like a creative director: the pieces, the style, and where the assets will be used.
                </li>
                <li>
                  Review the plan and adjust it until it matches your intent.
                </li>
                <li>
                  Water Agent builds the set to the direction you gave it.
                </li>
                <li>
                  Check each piece, ask for changes in the conversation, and take the finished set into your project.
                </li>
              </ol>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Made for scenes, not single prompts</h2>
            <div className="pickle-text">
              <p>
                A single prompt suits a single model. A market street, an armory, or a furnished room needs many pieces that answer the same brief. Water Agent is designed for that scale, so an art lead describes the scene once and spends the session directing instead of retyping.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Where Water Agent works</h2>
            <div className="pickle-text">
              <p>
                Water Agent works in the Hydrilla app, and inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin. The plugin generates models directly in your tool, and Water Agent works there through the same plugin.{" "}
                <Link href="/integrations">Set up the plugin</Link>
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
                  a: "Water Agent costs no credits and is included on every plan.",
                },
                {
                  q: "Who is it for?",
                  a: "3D artists, art leads, and studio teams who brief whole sets of assets and need them to hold together.",
                },
                {
                  q: "Can a brief be a single asset?",
                  a: "Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for.",
                },
                {
                  q: "When should I use text to 3D instead?",
                  a: (
                    <>
                      When you already know the one model you want.{" "}
                      <Link href="/text-to-3d">Text to 3D</Link> starts from a prompt, and{" "}
                      <Link href="/image-to-3d">image to 3D</Link> starts from a reference.
                    </>
                  ),
                },
                {
                  q: "How is Water Agent different from the MCP server?",
                  a: (
                    <>
                      Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside.{" "}
                      <Link href="/integrations/mcp">MCP server</Link>
                    </>
                  ),
                },
              ]}
            />
          </section>

          <PickleCta
            title="Bring your next brief"
            line="Open Water Agent with the brief for your next set."
            primary={{ label: "Open Water Agent", href: "/app/water" }}
            secondary={{ label: "Read the docs", href: "/docs#water" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
