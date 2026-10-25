import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PricingPageClient } from "@/components/sections/PricingPageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pricing: Free, Starter, Pro, and Hourly Plans | Hydrilla AI",
  description:
    "Hydrilla AI 3D pricing: Free $0, Starter $5, Pro $12, Hourly $3, and Hourly Pro $8 a month. A model costs 30 or 45 credits.",
  ogTitle: "Hydrilla pricing",
  path: "/pricing",
  absoluteTitle: true,
});


export default function PricingPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/pricing")} />
      <PricingPageClient />
    </>
  );
}
