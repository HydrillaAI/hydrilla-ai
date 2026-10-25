import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { API_SPECS, flatNav, PAGE_META } from "@/lib/docsData";
import { highlight, type CodeLang } from "@/lib/shiki";
import { SITE } from "@/lib/site";
import { Breadcrumbs, breadcrumbJsonLd, techArticleJsonLd } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MethodBadge } from "@/components/MethodBadge";
import { CopyPath } from "@/components/CopyPath";
import { ParamTable } from "@/components/ParamTable";
import { EndpointExamples, type LanguagePanel, type ResponsePanel } from "@/components/EndpointExamples";
import { TryItConsole } from "@/components/TryItConsole";
import { PageActions } from "@/components/PageActions";
import { TocDropdown } from "@/components/TableOfContents";
import { Callout } from "@/components/Callout";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Lock, Globe } from "lucide-react";

export function generateStaticParams() {
  return Object.keys(API_SPECS).map((endpoint) => ({ endpoint }));
}

interface PageProps {
  params: Promise<{ endpoint: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { endpoint } = await params;
  const spec = API_SPECS[endpoint];
  if (!spec) return {};
  const path = `/api/${endpoint}`;
  const nav = flatNav().find((item) => item.href === path);
  const title = nav?.title ?? spec.title;
  return {
    title,
    description: spec.summary,
    alternates: { canonical: `${SITE.docsUrl}${path}` },
    openGraph: {
      title: `${title} · Hydrilla API Docs`,
      description: spec.summary,
      url: `${SITE.docsUrl}${path}`,
      images: [{ url: `/og?title=${encodeURIComponent(title)}&method=${spec.method}` }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/og?title=${encodeURIComponent(title)}&method=${spec.method}`],
    },
  };
}

export default async function ApiEndpointPage({ params }: PageProps) {
  const { endpoint } = await params;
  const spec = API_SPECS[endpoint];
  if (!spec) notFound();

  const path = `/api/${endpoint}`;
  const nav = flatNav().find((item) => item.href === path);
  const meta = PAGE_META[path];

  const [curlHtml, pythonHtml, tsHtml, res200, res401, res402, resFailed] = await Promise.all([
    highlight(spec.curlExample, { lang: "bash" }),
    highlight(spec.pythonExample, { lang: "python" }),
    highlight(spec.tsExample, { lang: "typescript" }),
    highlight(spec.response200, { lang: "json" }),
    highlight(spec.response401, { lang: "json" }),
    spec.response402 ? highlight(spec.response402, { lang: "json" }) : Promise.resolve(""),
    spec.responseFailed ? highlight(spec.responseFailed, { lang: "json" }) : Promise.resolve(""),
  ]);

  const languages: LanguagePanel[] = [
    { id: "curl", label: "cURL", filename: "request.sh", lang: "bash", html: curlHtml, lineCount: spec.curlExample.split("\n").length },
    { id: "python", label: "Python", filename: "request.py", lang: "python", html: pythonHtml, lineCount: spec.pythonExample.split("\n").length },
    { id: "typescript", label: "TypeScript", filename: "request.ts", lang: "typescript", html: tsHtml, lineCount: spec.tsExample.split("\n").length },
  ];

  const responses: ResponsePanel[] = [
    { id: "200", label: "200 OK", dot: "var(--success)", filename: "200_SUCCESS.json", html: res200, lineCount: spec.response200.split("\n").length, json: spec.response200 },
    { id: "401", label: "401 Unauthorized", dot: "var(--danger)", filename: "401_UNAUTHORIZED.json", html: res401, lineCount: spec.response401.split("\n").length, json: spec.response401 },
  ];
  if (spec.response402) {
    responses.push({ id: "402", label: "402 Payment Required", dot: "var(--warning)", filename: "402_INSUFFICIENT_CREDITS.json", html: res402, lineCount: spec.response402.split("\n").length, json: spec.response402 });
  }
  if (spec.responseFailed) {
    responses.push({ id: "failed", label: "Job failed", dot: "var(--warning)", filename: "FAILED.json", html: resFailed, lineCount: spec.responseFailed.split("\n").length, json: spec.responseFailed });
  }

  const headingId = endpoint === "tasks" ? "path-query-parameters" : "request-body";
  const headingLabel = endpoint === "tasks" ? "Path & query parameters" : "Request body";

  return (
    <div>
      <Breadcrumbs pathname={path} />
      {breadcrumbJsonLd(path) && <JsonLd data={breadcrumbJsonLd(path)!} />}
      {techArticleJsonLd(path) && <JsonLd data={techArticleJsonLd(path)!} />}

      <header className="mt-2">
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={spec.method} />
          <CopyPath value={spec.path} />
          <span className="chip chip-credit">{spec.creditChip}</span>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="doc-title text-ink">{spec.title}</h1>
          <div className="shrink-0">
            <PageActions />
          </div>
        </div>
        <p className="mt-2 max-w-prose text-body text-ink-2">{spec.description}</p>

        <div className="mt-4 flex flex-col gap-2 rounded border border-line bg-subtle p-4 sm:flex-row sm:gap-8">
          <div id="authentication" className="kv scroll-mt-24">
            <Lock className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
            <span className="kv-key">Authentication</span>
            <span className="kv-val">{spec.authHeader}</span>
          </div>
          <div id="base-url" className="kv scroll-mt-24">
            <Globe className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
            <span className="kv-key">Base URL</span>
            <span className="kv-val">{SITE.apiBaseUrl}</span>
          </div>
        </div>

        <TocDropdown />
      </header>

      <div className="endpoint-grid mt-8">
        <div className="min-w-0">
          <section id="overview" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="doc-h2">
              Overview
            </h2>
            <p className="mt-2 max-w-prose text-body text-ink-2">{spec.description}</p>
          </section>

          <div className="mt-8">
            {spec.bodyParams && spec.bodyParams.length > 0 && (
              <ParamTable id={headingId} title={headingLabel} params={spec.bodyParams} contentType={spec.contentType} />
            )}
            {spec.queryParams && spec.queryParams.length > 0 && (
              <ParamTable id={headingId} title={headingLabel} params={spec.queryParams} />
            )}
          </div>

          <section id="response" aria-labelledby="response-heading" className="mt-8">
            <h2 id="response-heading" className="doc-h2">
              Response
            </h2>
            <p className="mt-2 max-w-prose text-body text-ink-2">
              Successful requests return the job object. Errors use the status codes below.
            </p>
            <Callout variant="note" title="Authentication errors">
              <p>
                <strong>401</strong> — Invalid or revoked API key. <strong>402</strong> — Not enough credits.
              </p>
            </Callout>
          </section>

          <div className="mt-8">
            <TryItConsole
              method={spec.method}
              path={spec.path}
              bodyParams={spec.bodyParams}
              queryParams={spec.queryParams}
              creditSpending={spec.method === "POST"}
            />
          </div>
        </div>

        <div className="two-pane-sticky min-w-0">
          <EndpointExamples languages={languages} responses={responses} />
        </div>
      </div>

      <FeedbackWidget />
    </div>
  );
}
