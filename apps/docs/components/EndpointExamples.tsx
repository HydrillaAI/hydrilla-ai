"use client";

import React, { useState } from "react";
import { CodeBlockShell } from "@/components/CodeBlockShell";
import { useLanguage, type LanguageId } from "@/lib/useLanguage";

export interface LanguagePanel {
  id: LanguageId;
  label: string;
  filename: string;
  lang: string;
  html: string;
  lineCount: number;
}

export interface ResponsePanel {
  id: string;
  label: string;
  dot: string;
  filename: string;
  html: string;
  lineCount: number;
  json: string;
}

function typeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function FieldTree({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-ink-3">array</span>;
    return <FieldTree value={value[0]} />;
  }
  if (value && typeof value === "object") {
    return (
      <ul className="space-y-1">
        {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
          <li key={key}>
            {val && typeof val === "object" ? (
              <details>
                <summary className="cursor-pointer">
                  <span className="param-name">{key}</span>{" "}
                  <span className="param-type">{typeName(val)}</span>
                </summary>
                <div className="mt-1 border-l border-line pl-3">
                  <FieldTree value={val} />
                </div>
              </details>
            ) : (
              <span>
                <span className="param-name">{key}</span>{" "}
                <span className="param-type">{typeName(val)}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  }
  return <span className="param-type">{typeName(value)}</span>;
}

function onTabKeyDown(e: React.KeyboardEvent, ids: string[], current: string, select: (id: string) => void) {
  const index = ids.indexOf(current);
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    select(ids[(index + 1) % ids.length]);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    select(ids[(index - 1 + ids.length) % ids.length]);
  } else if (e.key === "Home") {
    e.preventDefault();
    select(ids[0]);
  } else if (e.key === "End") {
    e.preventDefault();
    select(ids[ids.length - 1]);
  }
}

export function EndpointExamples({
  languages,
  responses,
}: {
  languages: LanguagePanel[];
  responses: ResponsePanel[];
}) {
  const [lang, setLang] = useLanguage();
  const [response, setResponse] = useState<string>(responses[0]?.id ?? "200");

  const langIds = languages.map((l) => l.id);
  const responseIds = responses.map((r) => r.id);
  const activeResponse = responses.find((r) => r.id === response) ?? responses[0];

  return (
    <div className="space-y-8">
      <noscript>
        <style>{`.lang-panel[data-active="false"]{display:block!important}`}</style>
      </noscript>

      <div>
        <div
          role="tablist"
          aria-label="Request language"
          className="tablist"
          onKeyDown={(e) => onTabKeyDown(e, langIds, lang, (id) => setLang(id as LanguageId))}
        >
          {languages.map((panel) => (
            <button
              key={panel.id}
              role="tab"
              type="button"
              id={`tab-lang-${panel.id}`}
              aria-selected={lang === panel.id}
              aria-controls={`panel-lang-${panel.id}`}
              tabIndex={lang === panel.id ? 0 : -1}
              className="tab"
              onClick={() => setLang(panel.id)}
            >
              {panel.label}
            </button>
          ))}
        </div>
        {languages.map((panel) => (
          <div
            key={panel.id}
            id={`panel-lang-${panel.id}`}
            role="tabpanel"
            aria-labelledby={`tab-lang-${panel.id}`}
            className="lang-panel"
            data-active={lang === panel.id}
            hidden={lang !== panel.id}
          >
            <CodeBlockShell
              html={panel.html}
              lang={panel.lang}
              label={panel.filename}
              lineCount={panel.lineCount}
            />
          </div>
        ))}
      </div>

      <div>
        <div
          role="tablist"
          aria-label="Response status"
          className="tablist"
          onKeyDown={(e) => onTabKeyDown(e, responseIds, response, setResponse)}
        >
          {responses.map((panel) => (
            <button
              key={panel.id}
              role="tab"
              type="button"
              id={`tab-res-${panel.id}`}
              aria-selected={response === panel.id}
              aria-controls={`panel-res-${panel.id}`}
              tabIndex={response === panel.id ? 0 : -1}
              className="tab"
              onClick={() => setResponse(panel.id)}
            >
              <span className="tab-dot" style={{ background: panel.dot }} aria-hidden />
              {panel.label}
            </button>
          ))}
        </div>
        {responses.map((panel) => (
          <div
            key={panel.id}
            id={`panel-res-${panel.id}`}
            role="tabpanel"
            aria-labelledby={`tab-res-${panel.id}`}
            hidden={response !== panel.id}
          >
            <CodeBlockShell
              html={panel.html}
              lang="json"
              label={panel.filename}
              lineCount={panel.lineCount}
            />
            {activeResponse?.id === panel.id && (
              <details className="mt-3 rounded border border-line bg-subtle p-3">
                <summary className="cursor-pointer text-small font-medium text-ink">
                  Response fields
                </summary>
                <div className="mt-2 text-small">
                  {(() => {
                    try {
                      return <FieldTree value={JSON.parse(panel.json)} />;
                    } catch {
                      return <p className="text-ink-3">Field details unavailable for this response.</p>;
                    }
                  })()}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
