import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PAGE_META, flatNav } from "@/lib/docsData";
import { SITE } from "@/lib/site";

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const meta = PAGE_META[pathname];
  const nav = flatNav().find((item) => item.href === pathname);
  if (!meta) return null;

  const crumbs: { label: string; href?: string }[] = [{ label: "Docs", href: "/quickstart" }];
  if (nav) crumbs.push({ label: nav.section });
  crumbs.push({ label: meta.title });

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] leading-5 text-ink-3">
        {crumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-ink">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink-2">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(pathname: string) {
  const meta = PAGE_META[pathname];
  const nav = flatNav().find((item) => item.href === pathname);
  if (!meta) return null;
  const items = [
    { name: "Docs", url: `${SITE.docsUrl}/quickstart` },
    ...(nav ? [{ name: nav.section, url: `${SITE.docsUrl}${pathname}` }] : []),
    { name: meta.title, url: `${SITE.docsUrl}${pathname}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function techArticleJsonLd(pathname: string) {
  const meta = PAGE_META[pathname];
  if (!meta) return null;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: meta.heading,
    description: meta.summary,
    url: `${SITE.docsUrl}${pathname}`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Hydrilla API Docs",
      url: SITE.docsUrl,
    },
  };
}
