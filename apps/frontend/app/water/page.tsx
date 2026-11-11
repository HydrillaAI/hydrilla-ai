import Footer from "@/components/layout/Footer";
import { WaterShowcase } from "@/components/water/WaterShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { getKitJsonLd } from "@/lib/kit-schema";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Water Agent: Direct a 3D Build | Hydrilla AI",
  description:
    "Water Agent turns a brief into a 3D preview you can refine. It plans the pieces, builds in passes, and stays in the conversation while you change the result. Your model key. No Hydrilla credits.",
  ogTitle: "Water Agent: direct a 3D build",
  path: "/water",
  absoluteTitle: true,
});

export default function WaterPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/water")} />
      <WaterShowcase />
      <Footer />
    </>
  );
}
