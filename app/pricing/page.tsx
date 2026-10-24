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

const PRICING_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/features#software",
      name: "Hydrilla",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "100 credits a month",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "0",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: "https://hydrilla.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Starter",
          price: "5",
          priceCurrency: "USD",
          description: "900 credits a month",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "5",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: "https://hydrilla.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "12",
          priceCurrency: "USD",
          description: "3,000 credits a month, REST API access",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "12",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: "https://hydrilla.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Hourly",
          price: "3",
          priceCurrency: "USD",
          description: "900 credits a month, in one chosen hour a day",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "3",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: "https://hydrilla.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Hourly Pro",
          price: "8",
          priceCurrency: "USD",
          description: "3,000 credits a month in a chosen daily window, 33% off Pro",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "8",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          url: "https://hydrilla.ai/pricing",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/pricing#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does a model cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality.",
          },
        },
        {
          "@type": "Question",
          name: "Do unused credits carry over?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Allowances reset each billing month.",
          },
        },
        {
          "@type": "Question",
          name: "How does the 14-day trial work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card.",
          },
        },
        {
          "@type": "Question",
          name: "How do Hourly plans save?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hourly Pro gives Pro's 3,000 credits for 33% less, $8 instead of $12, in a chosen daily window. Hourly gives Starter's 900 credits for $3 instead of $5, in one chosen hour a day.",
          },
        },
        {
          "@type": "Question",
          name: "Which plan includes the API?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pro includes REST API access.",
          },
        },
      ],
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={PRICING_JSON_LD} />
      <PricingPageClient />
    </>
  );
}
