import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PickleResearchPage } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla Blog: Guides for AI 3D Workflows | Hydrilla AI",
  description:
    "Practical guides from the Hydrilla team on reference images, engine import, and getting AI-generated 3D models into a working pipeline.",
  ogTitle: "Hydrilla Blog",
  path: "/blog",
  absoluteTitle: true,
});

const POSTS = [
  {
    title: "How do you import an AI-generated mesh into a game engine?",
    href: "/blog/import-ai-meshes",
    imageSrc: "/features/3d7.png",
    line: "Units, up axis, and material checks for Unity, Unreal, and Godot, with a short checklist.",
    date: "24 Oct 2026",
  },
  {
    title: "What makes a good reference image for image to 3D?",
    href: "/blog/reference-images",
    imageSrc: "/new-features/3df1.png",
    line: "Framing, light, and hidden sides, plus what to check before you upload a photo.",
    date: "24 Oct 2026",
  },
] as const;

export default function BlogPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/blog")} />
      <PickleResearchPage
        title="Blog"
        description={[
          "Practical guides from the Hydrilla team on working with AI 3D output. Each guide answers one question, from choosing a reference image to bringing an exported mesh into your game engine at the right scale.",
          "We write for the artist at the desk, not the press release. Every guide is short enough to read before you start a task and specific enough to change how you do it.",
        ]}
        items={POSTS.map((post) => ({
          title: post.title,
          subtitle: post.line,
          href: post.href,
          date: post.date,
          author: "Hydrilla Team",
          imageSrc: post.imageSrc,
        }))}
      />
    </>
  );
}
