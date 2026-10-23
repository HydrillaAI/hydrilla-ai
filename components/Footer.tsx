import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Github } from "lucide-react";
import { getPrevNext } from "@/lib/docsData";
import { SITE } from "@/lib/site";
import { StatusIndicator } from "@/components/StatusIndicator";

const LAST_UPDATED = "September 30, 2026";

export function Footer({ pathname }: { pathname: string }) {
  const { prev, next } = getPrevNext(pathname);
  const slug = pathname.replace(/^\//, "");

  return (
    <footer className="doc-footer">
      {(prev || next) && (
        <nav aria-label="Documentation pages" className="doc-pager">
          {prev ? (
            <Link href={prev.href} className="card">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Previous
              </span>
              <span className="card-title !mt-1 block">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="card sm:text-right">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-3 sm:justify-end">
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="card-title !mt-1 block">{next.title}</span>
            </Link>
          )}
        </nav>
      )}

      <div className="doc-footer-meta flex flex-col gap-3 text-[13px] leading-5 text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>Last updated {LAST_UPDATED}</span>
          <Link href="/changelog" className="text-ink-2 hover:text-ink">
            Changelog
          </Link>
          <a href="/llms.txt" className="text-ink-2 hover:text-ink">
            llms.txt
          </a>
          <a href="/llms-full.txt" className="text-ink-2 hover:text-ink">
            llms-full.txt
          </a>
          {SITE.githubUrl && (
            <a
              href={`${SITE.githubUrl}/edit/main/${slug ? `${slug}.mdx` : "index.mdx"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              Edit this page
            </a>
          )}
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator withLabel />
          <span>Hydrilla API Docs</span>
        </div>
      </div>
    </footer>
  );
}
