"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Loader2, Play, Eye, EyeOff, KeyRound, Square } from "lucide-react";
import type { ApiParam } from "@/lib/docsData";
import { SITE, maskKey, API_KEY_PLACEHOLDER } from "@/lib/site";

interface TryItConsoleProps {
  method: "GET" | "POST" | "DELETE";
  path: string;
  bodyParams?: ApiParam[];
  queryParams?: ApiParam[];
  creditSpending: boolean;
}

type State = "idle" | "confirm" | "sending" | "success" | "error" | "network";

interface Result {
  status: number;
  statusText: string;
  timeMs: number;
  body: string;
}

function errorCopy(status: number): string {
  if (status === 401) return "Invalid or revoked API key";
  if (status === 402) return "Not enough credits";
  if (status === 429 || status === 503) return "We're at GPU capacity. Try again shortly.";
  return `Request failed with status ${status}`;
}

export function TryItConsole({ method, path, bodyParams = [], queryParams = [], creditSpending }: TryItConsoleProps) {
  const params = useMemo(() => [...bodyParams, ...queryParams], [bodyParams, queryParams]);
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [revealInCurl, setRevealInCurl] = useState(false);
  const [remember, setRemember] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const param of params) {
      initial[param.name] = param.default ?? "";
    }
    return initial;
  });
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("hyd-try-key");
      if (stored) {
        setApiKey(stored);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const effectivePath = path.replace(/:([A-Za-z0-9_]+)/g, (_m, name: string) =>
    encodeURIComponent(values[name] || `:${name}`),
  );

  const curl = useMemo(() => {
    const key = revealInCurl ? apiKey || API_KEY_PLACEHOLDER : maskKey(apiKey || API_KEY_PLACEHOLDER);
    const lines = [`curl -X ${method} ${SITE.apiBaseUrl}${effectivePath} \\`, `  -H "Authorization: Bearer ${key}"`];
    if (method !== "GET" && method !== "DELETE") {
      lines[lines.length - 1] += " \\";
      lines.push(`  -H "Content-Type: application/json"`);
      const payload: Record<string, unknown> = {};
      for (const param of bodyParams) {
        const raw = values[param.name];
        if (raw === "" || raw === undefined) continue;
        if (param.type === "number") payload[param.name] = Number(raw);
        else if (param.type === "object") {
          try {
            payload[param.name] = JSON.parse(raw);
          } catch {
            payload[param.name] = raw;
          }
        } else payload[param.name] = raw;
      }
      lines.push(`  -d '${JSON.stringify(payload, null, 2)}'`);
    }
    return lines.join("\n");
  }, [method, effectivePath, apiKey, revealInCurl, values, bodyParams]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const param of params) {
      if (param.required && !values[param.name]) next[param.name] = `${param.name} is required`;
    }
    if (!apiKey.trim()) next["__key"] = "Enter your API key";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function send() {
    if (!validate()) {
      setState("idle");
      return;
    }
    if (remember) sessionStorage.setItem("hyd-try-key", apiKey);
    else sessionStorage.removeItem("hyd-try-key");

    setState("sending");
    setResult(null);
    abortRef.current = new AbortController();
    const controller = abortRef.current;
    const started = Date.now();

    const payload: Record<string, unknown> = {};
    for (const param of bodyParams) {
      const raw = values[param.name];
      if (raw === "" || raw === undefined) continue;
      if (param.type === "number") payload[param.name] = Number(raw);
      else if (param.type === "object") {
        try {
          payload[param.name] = JSON.parse(raw);
        } catch {
          payload[param.name] = raw;
        }
      } else payload[param.name] = raw;
    }

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          method,
          path: effectivePath,
          headers: { Authorization: `Bearer ${apiKey}` },
          body: method === "GET" ? undefined : JSON.stringify(payload),
        }),
      });
      if (!res.ok) throw new Error("proxy");
      const data: Result = await res.json();
      setResult(data);
      setState(data.status >= 200 && data.status < 300 ? "success" : "error");
    } catch (err) {
      if (controller.signal.aborted) {
        setState("idle");
        return;
      }
      setResult({ status: 0, statusText: "Network error", timeMs: Date.now() - started, body: "" });
      setState("network");
    }
  }

  function onSendClick() {
    if (!validate()) return;
    if (creditSpending && state !== "confirm") {
      setState("confirm");
      return;
    }
    void send();
  }

  const busy = state === "sending";

  return (
    <section id="try-it" aria-labelledby="try-it-heading" className="overflow-hidden rounded-[20px] border border-line bg-subtle">
      <h2 id="try-it-heading" className="doc-h2 !mt-0 !text-h2 border-t-0 pt-0">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>Try it</span>
          <ChevronDown className="h-5 w-5 text-ink-3 transition-transform" style={{ transform: open ? "none" : "rotate(-90deg)" }} aria-hidden />
        </button>
      </h2>

      {open && (
        <div className="space-y-5 border-t border-line px-5 pb-6 pt-5">
          <div>
            <label htmlFor="try-key" className="block text-small font-medium text-ink">
              API key
            </label>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative flex-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <input
                  id="try-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={API_KEY_PLACEHOLDER}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors["__key"])}
                  className="h-11 w-full rounded-sm border border-line bg-surface pl-9 pr-10 text-small text-ink"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-2 text-ink-3 hover:text-ink"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </div>
            {errors["__key"] && <p className="mt-1 text-small text-danger">{errors["__key"]}</p>}
            <label className="mt-2 flex items-center gap-2 text-small text-ink-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => {
                  setRemember(e.target.checked);
                  if (!e.target.checked) sessionStorage.removeItem("hyd-try-key");
                }}
              />
              Remember for this session
            </label>
            <p className="mt-1 text-caption text-ink-3">
              Stored in this browser tab only, never saved to disk or sent anywhere except the API.
            </p>
          </div>

          {params.length > 0 && (
            <div className="space-y-4">
              {params.map((param) => (
                <div key={param.name}>
                  <label htmlFor={`try-${param.name}`} className="flex items-center gap-2 text-small font-medium text-ink">
                    <span className="param-name">{param.name}</span>
                    {param.required ? (
                      <span className="chip chip-required">required</span>
                    ) : (
                      <span className="chip-optional">optional</span>
                    )}
                  </label>
                  {param.type === "object" ? (
                    <textarea
                      id={`try-${param.name}`}
                      rows={3}
                      value={values[param.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [param.name]: e.target.value }))}
                      placeholder={param.default ?? "{ }"}
                      className="mt-1 w-full rounded-sm border border-line bg-surface p-2 font-mono text-code text-ink"
                    />
                  ) : param.type === "file" ? (
                    <input
                      id={`try-${param.name}`}
                      type="file"
                      className="mt-1 w-full rounded-sm border border-line bg-surface p-2 text-small text-ink-2"
                    />
                  ) : (
                    <input
                      id={`try-${param.name}`}
                      type={param.type === "number" ? "number" : "text"}
                      value={values[param.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [param.name]: e.target.value }))}
                      placeholder={param.default ?? param.description}
                      aria-invalid={Boolean(errors[param.name])}
                      className="mt-1 h-11 w-full rounded-sm border border-line bg-surface px-3 text-small text-ink"
                    />
                  )}
                  {errors[param.name] && <p className="mt-1 text-small text-danger">{errors[param.name]}</p>}
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-small font-medium text-ink">Request preview</span>
              <button
                type="button"
                className="btn btn-ghost !min-h-0 !px-2 !py-1 text-small"
                onClick={() => setRevealInCurl((v) => !v)}
              >
                {revealInCurl ? "Hide key" : "Reveal key"}
              </button>
            </div>
            <pre className="code-plain">{curl}</pre>
          </div>

          {state === "confirm" && (
            <div className="callout callout-warning" role="note">
              <div>
                <p className="callout-title">This call spends credits.</p>
                <p className="callout-body">
                  Sending this request starts a generation job and deducts credits from your account.
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-primary" onClick={() => void send()}>
                    Confirm and send
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setState("idle")}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!busy ? (
              <button type="button" className="btn btn-primary" onClick={onSendClick}>
                <Play className="h-4 w-4" aria-hidden />
                Send request
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  abortRef.current?.abort();
                  setState("idle");
                }}
              >
                <Square className="h-3.5 w-3.5" aria-hidden />
                Cancel
              </button>
            )}
            {busy && (
              <span className="flex items-center gap-2 text-small text-ink-2" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </span>
            )}
          </div>

          {result && (state === "success" || state === "error") && (
            <div className="rounded border border-line bg-surface p-3">
              <div className="flex items-center gap-3">
                <span
                  className="mono rounded-md px-2 py-0.5 text-small font-semibold"
                  style={{
                    background: state === "success" ? "color-mix(in srgb, var(--success) 16%, transparent)" : "color-mix(in srgb, var(--danger) 14%, transparent)",
                    color: state === "success" ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {result.status} {result.statusText}
                </span>
                <span className="text-small text-ink-3">{result.timeMs} ms</span>
              </div>
              {state === "error" && <p className="mt-2 text-small text-danger">{errorCopy(result.status)}</p>}
              <pre className="code-plain mt-2 max-h-72 overflow-auto">
                {pretty(result.body)}
              </pre>
            </div>
          )}

          {state === "network" && (
            <div className="callout callout-danger" role="alert">
              <div>
                <p className="callout-title">Network error</p>
                <p className="callout-body">We couldn’t reach the API. Check your connection and try again.</p>
                <button type="button" className="btn btn-secondary mt-2" onClick={() => void send()}>
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function pretty(body: string): string {
  if (!body) return "";
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}
