import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleHeroVideo, PickleMedia, PickleMediaGrid } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { cloudinaryImage } from "@/lib/cloudinary";

export const metadata = createPageMetadata({
  title: "AI 3D Workspace for Studios and Artists | Hydrilla AI",
  description:
    "Generate 3D models from text or images with BlueFox, check parts and PBR maps in the browser, and export GLB, FBX, OBJ, or USDZ to your tools.",
  ogTitle: "Generate, check, and export 3D with BlueFox",
  path: "/features",
  absoluteTitle: true,
  keywords: [
    "AI 3D workspace",
    "best 3D AI generator",
    "best 3D AI generator in India",
    "best 3D AI generator US",
    "best 3D AI generator Japan",
    "best 3D AI generator China",
    "best 3D AI generator France",
    "segmented 3D mesh generator",
    "PBR 3D model generator",
    "GLB FBX OBJ USDZ 3D export",
  ],
});

const EXPORT_ROWS = [
  ["GLB", "Web viewers and real-time engines"],
  ["FBX", "DCC tools and engines that expect FBX"],
  ["OBJ", "Plain geometry between modeling tools"],
  ["USDZ", "AR viewers on iPhone and iPad"],
] as const;

const TOOL_LINKS = [
  { label: "Blender", href: "/integrations/blender" },
  { label: "Unity", href: "/integrations/unity" },
  { label: "Unreal", href: "/integrations/unreal" },
  { label: "Godot", href: "/integrations/godot" },
  { label: "MCP", href: "/integrations/mcp" },
  { label: "API", href: "/api" },
] as const;

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/features")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Generate, check, and export 3D with BlueFox
          </h1>
          <div className="pickle-lead">
            <p>
              Generate from text or an image with BlueFox, Hydrilla&apos;s 3D model, check the result in the browser, and export it to your engine or DCC.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              Hydrilla keeps generation, review, and handoff in <strong>one browser workspace</strong>, so an artist can move from an idea to a file the pipeline accepts without changing tools. Each step below links to the page that covers it in depth.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Start from a prompt, an image, or a conversation</h2>
              <div className="pickle-text">
                <p>
                  Pick the input that matches what you already have. A written description works while the idea is still in your head, and a picture works once the look is decided.{" "}
                  <Link href="/text-to-3d">Text to 3D</Link> and <Link href="/image-to-3d">image to 3D</Link> both run on BlueFox, so results arrive in the same structure whichever way you start.
                </p>
              </div>
              <h3 className="pickle-h3">Water Agent</h3>
              <div className="pickle-text">
                <p>
                  When the job is a whole set rather than one model, give Water Agent the brief and work through it piece by piece in one conversation, as you would with your art team.{" "}
                  <Link href="/water">How Water Agent works</Link>
                </p>
              </div>
            </div>

            <PickleMediaGrid
              ratio="4 / 3"
              items={[
                {
                  src: cloudinaryImage("hydrilla-landing/workflow/describe"),
                  alt: "The 3D character generator panel in Hydrilla Studio with a typed prompt.",
                  label: <><strong>Prompt</strong>Text to 3D</>,
                  fit: "contain",
                  tone: "white",
                },
                {
                  src: cloudinaryImage("hydrilla-landing/features/3df1"),
                  alt: "A prompt and a reference photo of a fantasy helmet next to the generated 3D helmet.",
                  label: <><strong>Image</strong>Image to 3D</>,
                },
              ]}
            />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Check every model before you export</h2>
              <div className="pickle-text">
                <p>
                  Every result opens in an in-browser preview, so you can judge it before it reaches your project. Orbit the model, select individual parts, and look at materials under light to catch shape or texture problems while they are still cheap to fix. Each result is a segmented mesh with UVs and PBR maps,{" "}
                  <Link href="/bluefox">explained here</Link>.
                </p>
              </div>
            </div>

            {/* TODO(kit): visual – replace with the preview capture with parts highlighted */}
            <PickleMedia
              ratio="4 / 3"
              src={cloudinaryImage("hydrilla-landing/features/3df3")}
              alt="A generated helmet split into labeled parts, with the part list shown beside it."
            />
          </section>

          <section id="exports" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Export to the format your tool opens</h2>
              <div className="pickle-text">
                <p>
                  Hydrilla exports GLB, FBX, OBJ, and USDZ, on every plan, Free included. Choose the format by where the asset goes next; the table is a quick guide, and the{" "}
                  <Link href="/docs#scale">units table</Link> helps you check scale on import.
                </p>
              </div>
            </div>

            <PickleMedia
              ratio="3 / 2"
              src={cloudinaryImage("hydrilla-landing/features/3d7")}
              alt="A generated model surrounded by GLB, FBX, OBJ, and USDZ export file icons."
            />

            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Format</th>
                      <th>Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPORT_ROWS.map(([format, use]) => (
                      <tr key={format}>
                        <th>{format}</th>
                        <td>{use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Send it straight into your tools</h2>
              <div className="pickle-text">
                <p>
                  Plugins for Blender, Unity, Unreal, and Godot take models over the local Bridge, so a result can move from the preview into your open scene without a manual download. AI agents connect through MCP, and your own code calls the{" "}
                  <Link href="/api">REST API</Link>. <Link href="/integrations">All integrations</Link>
                </p>
              </div>
            </div>

            <nav aria-label="Integrations" className="pickle-actions">
              {TOOL_LINKS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="pickle-pill-ghost">
                  {tool.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* VERIFY: Keep the /features close line "New models will be available through Water Agent as they arrive."? (VERIFY-LIST #8) */}
          <PickleCta
            line="New models will be available through Water Agent as they arrive."
            primary={{ label: "Start generating", href: "/app/studio" }}
            secondary={{ label: "See pricing", href: "/pricing" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
