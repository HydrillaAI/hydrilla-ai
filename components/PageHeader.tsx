import React from "react";
import { Breadcrumbs, breadcrumbJsonLd, techArticleJsonLd } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageActions } from "@/components/PageActions";
import { TocDropdown } from "@/components/TableOfContents";

export function PageHeader({
  pathname,
  heading,
  summary,
}: {
  pathname: string;
  heading: string;
  summary: string;
}) {
  const breadcrumbs = breadcrumbJsonLd(pathname);
  const techArticle = techArticleJsonLd(pathname);
  return (
    <header>
      <Breadcrumbs pathname={pathname} />
      {breadcrumbs && <JsonLd data={breadcrumbs} />}
      {techArticle && <JsonLd data={techArticle} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="doc-title text-ink">{heading}</h1>
        <div className="shrink-0">
          <PageActions />
        </div>
      </div>
      <p className="mt-3 max-w-[40rem] text-body text-ink-2">{summary}</p>
      <TocDropdown />
    </header>
  );
}
