import { API_SPECS, GUIDE_PAGE_META, ENDPOINT_PAGE_META, flatNav } from "@/lib/docsData";

export interface SearchEntry {
  id: string;
  title: string;
  href: string;
  group: "Guides" | "API reference";
  breadcrumb: string;
  method?: string;
  path?: string;
  keywords: string;
}

const navByHref = new Map(flatNav().map((item) => [item.href, item]));

function breadcrumbFor(href: string): string {
  const item = navByHref.get(href);
  return item ? item.section : "Documentation";
}

export const SEARCH_INDEX: SearchEntry[] = [];

for (const meta of Object.values(GUIDE_PAGE_META)) {
  const group: SearchEntry["group"] = "Guides";
  const breadcrumb = breadcrumbFor(meta.slug);
  SEARCH_INDEX.push({
    id: meta.slug,
    title: meta.heading,
    href: meta.slug,
    group,
    breadcrumb,
    keywords: `${meta.title} ${meta.heading}`.toLowerCase(),
  });
  for (const heading of meta.headings) {
    SEARCH_INDEX.push({
      id: `${meta.slug}#${heading.id}`,
      title: heading.text,
      href: `${meta.slug}#${heading.id}`,
      group,
      breadcrumb: meta.title,
      keywords: heading.text.toLowerCase(),
    });
  }
}

for (const meta of Object.values(ENDPOINT_PAGE_META)) {
  const group: SearchEntry["group"] = "API reference";
  const spec = API_SPECS[meta.slug.replace("/api/", "")];
  const breadcrumb = breadcrumbFor(meta.slug);
  const statusCodes = ["200", "401", ...(spec?.response402 ? ["402"] : []), ...(spec?.responseFailed ? ["failed"] : [])].join(" ");
  SEARCH_INDEX.push({
    id: meta.slug,
    title: meta.heading,
    href: meta.slug,
    group,
    breadcrumb,
    method: meta.method,
    path: meta.path,
    keywords: `${meta.title} ${meta.method ?? ""} ${meta.path ?? ""} ${statusCodes} ${meta.summary}`.toLowerCase(),
  });
  for (const heading of meta.headings) {
    SEARCH_INDEX.push({
      id: `${meta.slug}#${heading.id}`,
      title: heading.text,
      href: `${meta.slug}#${heading.id}`,
      group,
      breadcrumb: meta.title,
      method: meta.method,
      path: meta.path,
      keywords: heading.text.toLowerCase(),
    });
  }
  const params = [...(spec?.bodyParams ?? []), ...(spec?.queryParams ?? []), ...(spec?.headers ?? [])];
  for (const param of params) {
    SEARCH_INDEX.push({
      id: `${meta.slug}#param-${param.name}`,
      title: param.name,
      href: `${meta.slug}#param-${param.name}`,
      group,
      breadcrumb: `${meta.title} · ${param.type}`,
      method: meta.method,
      path: meta.path,
      keywords: `${param.name} ${param.type} ${param.description}`.toLowerCase(),
    });
  }
}
