import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata, getWebPageJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI 3D Workspace for Studios and Artists | Hydrilla AI",
  description:
    "Generate 3D models from text or images with BlueFox, check parts and PBR maps in the browser, and export GLB, FBX, OBJ, or USDZ to your tools.",
  ogTitle: "Generate, check, and export 3D with BlueFox",
  path: "/features",
  absoluteTitle: true,
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
      <JsonLd
        data={getWebPageJsonLd({
          name: "AI 3D Workspace for Studios and Artists",
          description: metadata.description as string,
          path: "/features",
        })}
      />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Generate, check, and export 3D with BlueFox
          </h1>
          <p className="pickle-article-subtitle">
            Generate from text or an image with BlueFox, Hydrilla&apos;s 3D model, check the result in the browser, and export it to your engine or DCC.
          </p>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – looping Studio capture (prompt or image in, segmented model orbiting, export menu open) */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="Hydrilla Studio screen showing a prompt field, a segmented 3D model turning in the preview, and the export menu open."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Start from a prompt, an image, or a conversation</h2>
              <div className="pickle-text">
                <p>
                  Describe the asset with <Link href="/text-to-3d">text to 3D →</Link>, or upload a picture with{" "}
                  <Link href="/image-to-3d">image to 3D →</Link>. BlueFox builds either one.
                </p>
              </div>
              <h3 className="pickle-h3">Water Agent</h3>
              <div className="pickle-text">
                <p>
                  Give Water Agent the brief for a whole set, and work through it piece by piece in one conversation, as you would with your art team.{" "}
                  <Link href="/water">How Water Agent works →</Link>
                </p>
              </div>
            </div>

            {/* TODO(kit): visual – three-up (prompt, reference image, Water Agent chat) */}
            <figure className="pickle-figure">
              <div
                role="img"
                aria-label="Three input panels in Hydrilla Studio: a typed prompt, an uploaded reference image, and a Water Agent chat thread."
                className="pickle-card-surface"
              />
            </figure>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Check every model before you export</h2>
              <div className="pickle-text">
                <p>
                  Orbit it, select parts, and check materials under light. Each result is a segmented mesh with UVs and PBR maps,{" "}
                  <Link href="/bluefox">explained here →</Link>.
                </p>
              </div>
            </div>

            {/* TODO(kit): visual – preview capture with parts highlighted */}
            <figure className="pickle-figure">
              <div
                role="img"
                aria-label="Browser preview of a generated model with one part selected and its material settings shown beside it."
                className="pickle-card-surface"
              />
            </figure>
          </section>

          <section id="exports" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Export to the format your tool opens</h2>
              <div className="pickle-text">
                <p>Hydrilla exports GLB, FBX, OBJ, and USDZ, on every plan, Free included.</p>
              </div>
            </div>

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
                  Engine and DCC plugins take models over the local Bridge, agents use MCP, and code calls the{" "}
                  <Link href="/api">REST API →</Link>. <Link href="/integrations">All integrations →</Link>
                </p>
              </div>
            </div>

            <div
              role="group"
              aria-label="Logos for Blender, Unity, Unreal Engine, Godot, and MCP, with an API label."
              className="pickle-card-surface flex flex-wrap items-center justify-center gap-4"
            >
              {TOOL_LINKS.map((tool, index) => (
                <span key={tool.href} className="inline-flex items-center gap-4 text-[17px] font-medium">
                  {index > 0 ? <span aria-hidden className="text-black/25">|</span> : null}
                  <Link href={tool.href} className="text-black underline-offset-4 hover:underline">
                    {tool.label}
                  </Link>
                </span>
              ))}
            </div>
          </section>

          {/* VERIFY: Keep the /features close line "New models will be available through Water Agent as they arrive."? (VERIFY-LIST #8) */}
          <div className="pickle-closing">
            <p className="pickle-text">New models will be available through Water Agent as they arrive.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/app/studio" className="pickle-pill-solid">
                Start generating
              </Link>
              <Link
                href="/pricing"
                className="pickle-glass-pill"
                style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
