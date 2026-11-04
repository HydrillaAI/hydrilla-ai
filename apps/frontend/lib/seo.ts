import type { Metadata } from "next";

import { HERO_POSTER_URL } from "./cloudinary";
import { FAQ_ITEMS } from "./faq";
import {
  PRICING,
  PRICING_META_DESCRIPTION,
  PRICING_PAGE,
  SLOT_PRICING,
} from "./pricing";
import { TEAM_MEMBERS } from "./team";
import {
  ABOUT_META,
  BLUEFOX_LEDE,
  BLUEFOX_META,
  BRAND_SENTENCE,
  CONTACT_EMAIL,
  DEFAULT_DESCRIPTION,
  ENTITY_IDS,
  FEATURES_META,
  FOUNDER_ROLES,
  HOME_TITLE,
  MODEL_FAMILY,
  MODEL_NAME,
  MODEL_PAGE_TITLE,
  PRODUCT_NAME,
  RESEARCH_LAB,
  RESEARCH_LEDE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
} from "./brand";

export {
  ABOUT_META,
  BLUEFOX_LEDE,
  BLUEFOX_META,
  BRAND_SENTENCE,
  CONTACT_EMAIL,
  DEFAULT_DESCRIPTION,
  FEATURES_META,
  HOME_TITLE,
  MODEL_FAMILY,
  MODEL_NAME,
  MODEL_PAGE_TITLE,
  PRODUCT_NAME,
  RESEARCH_LAB,
  RESEARCH_LEDE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
};

export const DEFAULT_OG_IMAGE = HERO_POSTER_URL;

/** Public marketing pages included in the sitemap. */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/features", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bluefox", changeFrequency: "monthly", priority: 0.9 },
  { path: "/water", changeFrequency: "monthly", priority: 0.9 },
  { path: "/text-to-3d", changeFrequency: "monthly", priority: 0.9 },
  { path: "/image-to-3d", changeFrequency: "monthly", priority: 0.9 },
  { path: "/integrations", changeFrequency: "weekly", priority: 0.7 },
  { path: "/integrations/blender", changeFrequency: "monthly", priority: 0.6 },
  { path: "/integrations/unity", changeFrequency: "monthly", priority: 0.6 },
  { path: "/integrations/unreal", changeFrequency: "monthly", priority: 0.6 },
  { path: "/integrations/godot", changeFrequency: "monthly", priority: 0.5 },
  { path: "/integrations/mcp", changeFrequency: "monthly", priority: 0.5 },
  { path: "/api", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/solutions", changeFrequency: "monthly", priority: 0.7 },
  { path: "/solutions/games", changeFrequency: "monthly", priority: 0.7 },
  { path: "/solutions/film", changeFrequency: "monthly", priority: 0.6 },
  { path: "/solutions/architecture", changeFrequency: "monthly", priority: 0.6 },
  { path: "/solutions/xr", changeFrequency: "monthly", priority: 0.6 },
  { path: "/solutions/product", changeFrequency: "monthly", priority: 0.6 },
  { path: "/enterprise", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.5 },
  { path: "/blog/reference-images", changeFrequency: "monthly", priority: 0.5 },
  { path: "/blog/import-ai-meshes", changeFrequency: "monthly", priority: 0.5 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.5 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover", changeFrequency: "weekly", priority: 0.7 },
  { path: "/community-guidelines", changeFrequency: "yearly", priority: 0.3 },
  { path: "/compare/meshy", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/tripo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/hyper3d", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/trellis", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/sloyd", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/how-to-choose", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/research", changeFrequency: "monthly", priority: 0.7 },
  { path: "/team", changeFrequency: "monthly", priority: 0.5 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/security", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

type PageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  /** Use for the homepage and sitelink titles to avoid the title template suffix. */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  /** Pages with no markdown mirror (user-generated content) skip the text/markdown alternate. */
  noMarkdown?: boolean;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
};

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function markdownUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/index.md`;
  return `${absoluteUrl(path)}.md`;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  absoluteTitle = false,
  noIndex = false,
  noMarkdown = false,
  keywords,
  ogImage,
  ogTitle,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const socialTitle = ogTitle || fullTitle;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: fullTitle } : title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: noIndex || noMarkdown
      ? { canonical: url }
      : {
          canonical: url,
          types: { "text/markdown": markdownUrl(path) },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: socialTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getWebPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  crumbs?: Array<{ name: string; path: string }>;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.name,
        description: opts.description,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.hydrilla },
      },
      breadcrumbJsonLd(
        opts.crumbs ?? [
          { name: "Home", path: "/" },
          { name: opts.name, path: opts.path },
        ]
      ),
    ],
  };
}

function founderNodes() {
  return TEAM_MEMBERS.filter((member) => FOUNDER_ROLES.has(member.role)).map(
    (member) => ({
      "@type": "Person" as const,
      name: member.name,
      jobTitle: member.role,
      url: member.connect,
      image: absoluteUrl(member.image),
      worksFor: { "@id": ENTITY_IDS.hydrilla },
    })
  );
}

const SERVED_REGIONS = [
  { "@type": "Country" as const, name: "India", identifier: "IN" },
  { "@type": "Country" as const, name: "United States", identifier: "US" },
  { "@type": "Country" as const, name: "Japan", identifier: "JP" },
  { "@type": "Country" as const, name: "China", identifier: "CN" },
  { "@type": "Country" as const, name: "France", identifier: "FR" },
  { "@type": "Place" as const, name: "Worldwide" },
];

export function getHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ENTITY_IDS.hydrilla,
        name: "Hydrilla AI",
        alternateName: ["Hydrilla", "Hydrilla AI", "Hydrilla.ai"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/hyd01-mark.png"),
          width: 512,
          height: 512,
        },
        description: DEFAULT_DESCRIPTION,
        disambiguatingDescription:
          "AI 3D software company that builds the Hydrilla workspace, Water Agent, and BlueFox, Hydrilla's 3D model",
        email: CONTACT_EMAIL,
        sameAs: [...SOCIAL_PROFILES],
        subOrganization: { "@id": ENTITY_IDS.hawan },
        founder: founderNodes(),
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
        foundingLocation: {
          "@type": "Place",
          name: "India",
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
          },
        },
        areaServed: SERVED_REGIONS,
        knowsAbout: [
          "AI 3D Model Generation",
          "Text to 3D",
          "Image to 3D",
          "Segmented 3D Meshes with UVs and PBR Maps",
          "AI 3D Agent",
          "Blender 3D Add-on",
          "Unity 3D Plugin",
          "Unreal Engine 3D Plugin",
          "Godot 4 3D Plugin",
          "Model Context Protocol (MCP) for 3D",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          url: absoluteUrl("/contact"),
          areaServed: SERVED_REGIONS,
          availableLanguage: ["English"],
        },
      },
      {
        "@type": "ResearchOrganization",
        "@id": ENTITY_IDS.hawan,
        name: RESEARCH_LAB,
        url: absoluteUrl("/research"),
        description:
          "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built.",
        parentOrganization: { "@id": ENTITY_IDS.hydrilla },
      },
      {
        "@type": "WebSite",
        "@id": ENTITY_IDS.website,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ["Hydrilla AI", "Hydrilla.ai"],
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": ENTITY_IDS.hydrilla },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": ENTITY_IDS.product,
        name: PRODUCT_NAME,
        alternateName: ["Hydrilla AI", "Hydrilla Studio"],
        applicationCategory: "DesignApplication",
        applicationSubCategory: "AI 3D Model Generator and Studio Workspace",
        operatingSystem: "Web, Windows, macOS, Linux (via Blender, Unity, Unreal Engine, Godot 4 plugins)",
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": ENTITY_IDS.hydrilla },
        isRelatedTo: { "@id": ENTITY_IDS.bluefox },
        hasPart: [
          { "@id": ENTITY_IDS.bluefox },
          { "@id": `${SITE_URL}/water#software` },
        ],
        featureList: [
          "Text to 3D with BlueFox",
          "Image to 3D with BlueFox",
          "Segmented meshes with UVs and PBR maps",
          "In-browser 3D preview and part inspection",
          "Export to GLB, FBX, OBJ, and USDZ on all plans",
          "Plugins and local Bridge for Blender, Unity, Unreal Engine, and Godot 4",
          "MCP server for AI coding agents",
          "REST API for studio pipelines",
          "Water Agent AI 3D agent included on every plan",
        ],
        softwareHelp: {
          "@type": "CreativeWork",
          url: absoluteUrl("/docs"),
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "12",
          offerCount: 5,
          url: absoluteUrl("/pricing"),
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": ENTITY_IDS.bluefox,
        name: "BlueFox",
        alternateName: [MODEL_NAME, MODEL_FAMILY],
        softwareVersion: "1",
        applicationCategory: "DesignApplication",
        applicationSubCategory: "Generative 3D AI Model",
        operatingSystem: "Web",
        url: absoluteUrl("/bluefox"),
        description: BLUEFOX_LEDE,
        creator: { "@id": ENTITY_IDS.hydrilla },
        provider: { "@id": ENTITY_IDS.hydrilla },
        isPartOf: { "@id": ENTITY_IDS.product },
        sameAs: ["https://huggingface.co/Hydrilla/BlueFox3D"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          url: absoluteUrl("/pricing"),
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/water#software`,
        name: "Water Agent",
        alternateName: "Hydrilla Water Agent",
        applicationCategory: "DesignApplication",
        applicationSubCategory: "AI 3D Agent",
        operatingSystem: "Web, Blender, Unity, Unreal Engine, Godot 4",
        url: absoluteUrl("/water"),
        description:
          "Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.",
        provider: { "@id": ENTITY_IDS.hydrilla },
        isPartOf: { "@id": ENTITY_IDS.product },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Included on every Hydrilla plan, no credits",
          url: absoluteUrl("/pricing"),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: HOME_TITLE,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.hydrilla },
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-US",
      },
    ],
  };
}

export function getUseCaseJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": ENTITY_IDS.product,
        name: PRODUCT_NAME,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          url: absoluteUrl("/pricing"),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${opts.name} | ${SITE_NAME}`,
        description: opts.description,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.product },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Use cases", path: "/usecase" },
        { name: opts.name, path: opts.path },
      ]),
    ],
  };
}

export function getFaqJsonLd() {
  const url = absoluteUrl("/faq");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        name: `FAQ | ${SITE_NAME}`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ]),
    ],
  };
}

export function getPricingJsonLd() {
  const url = absoluteUrl("/pricing");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": ENTITY_IDS.product,
        name: PRODUCT_NAME,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": ENTITY_IDS.hydrilla },
        offers: [
          {
            "@type": "Offer",
            name: PRICING.free.label,
            price: String(PRICING.free.monthly),
            priceCurrency: "USD",
            description: `${PRICING.free.creditsLabel}; ${PRICING.free.accessLabel}; ${PRICING.free.exports} export`,
            url,
          },
          {
            "@type": "Offer",
            name: PRICING.starter.label,
            price: String(PRICING.starter.monthly),
            priceCurrency: "USD",
            description: `${PRICING.starter.creditsLabel}; ${PRICING.starter.accessLabel}; ${PRICING.starter.exports}`,
            url,
          },
          {
            "@type": "Offer",
            name: PRICING.pro.label,
            price: String(PRICING.pro.monthly),
            priceCurrency: "USD",
            description: `${PRICING.pro.creditsLabel}; ${PRICING.pro.accessLabel}; ${PRICING.pro.exports}; REST API access`,
            url,
          },
          {
            "@type": "Offer",
            name: SLOT_PRICING.slot.label,
            price: String(SLOT_PRICING.slot.monthly),
            priceCurrency: "USD",
            description: `${SLOT_PRICING.slot.summary} ${SLOT_PRICING.slot.exports}.`,
            url,
          },
          {
            "@type": "Offer",
            name: SLOT_PRICING.slot_pro.label,
            price: String(SLOT_PRICING.slot_pro.monthly),
            priceCurrency: "USD",
            description: `${SLOT_PRICING.slot_pro.summary} ${SLOT_PRICING.slot_pro.exports}.`,
            url,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: PRICING_PAGE.title,
        description: PRICING_META_DESCRIPTION,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.product },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Pricing", path: "/pricing" },
      ]),
    ],
  };
}

export function getAboutJsonLd() {
  const url = absoluteUrl("/about");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: `About Hydrilla, Hawan Research Labs, and BlueFox | ${SITE_NAME}`,
        description: ABOUT_META,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.hydrilla },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  };
}

export function getResearchJsonLd() {
  const url = absoluteUrl("/research");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ResearchOrganization",
        "@id": ENTITY_IDS.hawan,
        name: RESEARCH_LAB,
        url,
        description: RESEARCH_LEDE,
        parentOrganization: { "@id": ENTITY_IDS.hydrilla },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${RESEARCH_LAB} | BlueFox research`,
        description: RESEARCH_LEDE,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.hawan },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Research", path: "/research" },
      ]),
    ],
  };
}

export function getDocsJsonLd() {
  const url = absoluteUrl("/docs");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        url,
        headline: `Docs | Get started with Hydrilla`,
        name: `Docs | Get started with Hydrilla`,
        description:
          "Get started with Hydrilla: text-to-3D, image-to-3D, preview, exports, workspaces, and credits.",
        author: { "@id": ENTITY_IDS.hydrilla },
        publisher: { "@id": ENTITY_IDS.hydrilla },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Docs", path: "/docs" },
      ]),
    ],
  };
}

export function getBlueFoxJsonLd() {
  const url = absoluteUrl("/bluefox");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://hydrilla.ai/bluefox#model",
        name: "BlueFox",
        alternateName: "BlueFox 1",
        softwareVersion: "1",
        description: "BlueFox, Hydrilla's 3D model, is built by Hydrilla AI. Its current version is BlueFox 1.",
        disambiguatingDescription: "Hydrilla's 3D model, generally available in Hydrilla",
        applicationCategory: "DesignApplication",
        url,
        creator: { "@id": ENTITY_IDS.hydrilla },
        isPartOf: { "@id": "https://hydrilla.ai/features#software" },
        sameAs: ["https://huggingface.co/Hydrilla/BlueFox3D"],
      },
      breadcrumbJsonLd([
        { name: "Product", path: "/features" },
        { name: "BlueFox", path: "/bluefox" },
      ]),
    ],
  };
}

export function getTeamJsonLd() {
  const url = absoluteUrl("/team");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `Team | ${SITE_NAME}`,
        isPartOf: { "@id": ENTITY_IDS.website },
        about: { "@id": ENTITY_IDS.hydrilla },
      },
      ...TEAM_MEMBERS.map((member) => ({
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        image: absoluteUrl(member.image),
        url: `${url}#${member.id}`,
        worksFor: { "@id": ENTITY_IDS.hydrilla },
        sameAs: member.connect ? [member.connect] : undefined,
      })),
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Team", path: "/team" },
      ]),
    ],
  };
}

export function getArticleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: opts.headline,
        description: opts.description,
        url,
        datePublished: opts.datePublished,
        dateModified: opts.dateModified || opts.datePublished,
        author: { "@id": ENTITY_IDS.hydrilla },
        publisher: {
          "@type": "Organization",
          "@id": ENTITY_IDS.hydrilla,
          name: SITE_NAME,
        },
        mainEntityOfPage: url,
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: opts.path.startsWith("/compare") ? "Compare" : "Blog", path: opts.path.startsWith("/compare") ? "/compare" : "/blog" },
        { name: opts.headline, path: opts.path },
      ]),
    ],
  };
}
