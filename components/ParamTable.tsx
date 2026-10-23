import React from "react";
import type { ApiParam } from "@/lib/docsData";

function ParamRows({ params, depth = 0 }: { params: ApiParam[]; depth?: number }) {
  return (
    <>
      {params.map((param) => (
        <ParamRow key={param.name} param={param} depth={depth} />
      ))}
    </>
  );
}

function ParamRow({ param, depth }: { param: ApiParam; depth: number }) {
  const hasChildren = param.children && param.children.length > 0;
  return (
    <>
      <tr>
        <td>
          <span id={`param-${param.name}`} className="param-name" style={{ paddingLeft: depth * 16 }}>
            {param.name}
          </span>
          <a
            href={`#param-${param.name}`}
            className="anchor-link ml-1.5 text-ink-3"
            aria-label={`Link to ${param.name}`}
          >
            #
          </a>
        </td>
        <td>
          <span className="param-type">{param.type}</span>
        </td>
        <td>
          {param.required ? (
            <span className="chip chip-required">required</span>
          ) : (
            <span className="chip-optional">optional</span>
          )}
        </td>
        <td>
          {param.default ? <span className="param-default">{param.default}</span> : <span className="text-ink-3">—</span>}
        </td>
        <td>
          <span>{param.description}</span>
          {hasChildren && (
            <details className="mt-2">
              <summary className="cursor-pointer text-small font-medium text-accent">
                Show {param.name} properties
              </summary>
              <ul className="mt-2 space-y-1.5 border-l border-line pl-3">
                {param.children!.map((child) => (
                  <li key={child.name} className="text-small text-ink-2">
                    <span className="param-name">{child.name}</span>{" "}
                    <span className="param-type">{child.type}</span>{" "}
                    {child.required ? (
                      <span className="chip-required">required</span>
                    ) : (
                      <span className="chip-optional">optional</span>
                    )}
                    {child.default && <span className="param-default"> · default {child.default}</span>}
                    <span className="block text-ink-3">{child.description}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </td>
      </tr>
      {hasChildren && depth < 1 && <ParamRows params={param.children!} depth={depth + 1} />}
    </>
  );
}

function ParamCards({ params }: { params: ApiParam[] }) {
  return (
    <div className="mt-3">
      {params.map((param) => (
        <div key={param.name} className="param-card">
          <div className="flex items-center justify-between gap-2">
            <span id={`param-card-${param.name}`} className="param-name">
              {param.name}
            </span>
            {param.required ? (
              <span className="chip chip-required">required</span>
            ) : (
              <span className="chip-optional">optional</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-small text-ink-3">
            <span className="param-type">{param.type}</span>
            {param.default && <span className="param-default">default: {param.default}</span>}
          </div>
          <p className="mt-1 text-small text-ink-2">{param.description}</p>
          {param.children && param.children.length > 0 && (
            <ul className="mt-2 space-y-1.5 border-l border-line pl-3">
              {param.children.map((child) => (
                <li key={child.name} className="text-small text-ink-2">
                  <span className="param-name">{child.name}</span>{" "}
                  <span className="param-type">{child.type}</span> — {child.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function ParamTable({
  id,
  title,
  params,
  contentType,
}: {
  id: string;
  title: string;
  params: ApiParam[];
  contentType?: string;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="doc-h2">
        {title}
        {contentType && <span className="ml-2 text-small font-normal text-ink-3">{contentType}</span>}
      </h2>
      <div className="mt-3 overflow-hidden rounded border border-line">
        <table className="params-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Required</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <ParamRows params={params} />
          </tbody>
        </table>
        <div className="px-4 pb-2 md:hidden">
          <ParamCards params={params} />
        </div>
      </div>
    </section>
  );
}
