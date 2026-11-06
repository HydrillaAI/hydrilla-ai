import dynamic from "next/dynamic";
import Hero from "../components/sections/Hero";
import HomeBelowFold from "../components/sections/HomeBelowFold";
import { JsonLd } from "@/components/seo/JsonLd";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { HOME_TITLE, createPageMetadata, getHomepageJsonLd } from "@/lib/seo";
const Footer = dynamic(() => import("../components/layout/Footer"), {
  loading: () => <div className="min-h-[280px] w-full bg-white" aria-hidden />,
});

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  path: "/",
  absoluteTitle: true,
  keywords: [
    "Hydrilla AI",
    "best 3D AI generator",
    "best 3D AI generator in India",
    "best 3D AI generator in the US",
    "best 3D AI generator in Japan",
    "best 3D AI generator in China",
    "best 3D AI generator in France",
    "best AI 3D plugin",
    "BlueFox 3D model",
    "Water Agent AI 3D",
    "text to 3D",
    "image to 3D",
    "Blender AI 3D add-on",
    "Unity AI 3D plugin",
    "Unreal Engine AI 3D plugin",
    "Godot 4 AI 3D plugin",
  ],
});

/** CDN can serve a fresh prerender for an hour — cuts cold TTFB on `/`. */
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <JsonLd data={getHomepageJsonLd()} />
      <SmoothScroll />
      <Hero />
      {/* Text sections SSR for crawlers; Showcase / AppShowcase stay client-only. */}
      <HomeBelowFold />
      <Footer />
    </>
  );
}
