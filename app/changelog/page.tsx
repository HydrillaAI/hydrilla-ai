import React from "react";
import type { Metadata } from "next";
import { CHANGELOG, TAG_STYLE } from "@/lib/changelog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release notes for the Hydrilla API.",
  alternates: {
    canonical: `${SITE.docsUrl}/changelog`,
    types: { "application/rss+xml": `${SITE.docsUrl}/changelog/rss.xml` },
  },
};

export default function ChangelogPage() {
  return (
    <div className="prose">
      <header>
        <h1 className="doc-title text-ink">Changelog</h1>
        <p className="mt-3 text-body text-ink-2">
          Release notes for the Hydrilla API.{" "}
          <a href="/changelog/rss.xml">RSS feed</a>.
        </p>
      </header>

      {CHANGELOG.length === 0 ? (
        <p className="mt-8 text-body text-ink-2">No changes yet. v1.0 is the first release.</p>
      ) : (
        <ol className="mt-8 space-y-10">
          {CHANGELOG.map((entry) => (
            <li key={entry.version}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="!mt-0 !border-t-0 !p-0 text-h3 font-semibold text-ink">{entry.version}</h2>
                <time dateTime={entry.date} className="text-small text-ink-3">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="chip"
                    style={{ background: TAG_STYLE[tag].bg, color: TAG_STYLE[tag].fg }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ul className="mt-3">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
