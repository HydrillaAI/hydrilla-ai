"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  Loader2,
  Terminal,
  ShieldCheck,
  Boxes,
  BarChart2,
  Zap,
  X,
} from "lucide-react";
import {
  fetchDeveloperApiKeys,
  fetchDeveloperKeyDetails,
  createDeveloperApiKey,
  revokeDeveloperApiKey,
  type DeveloperApiKeyMeta,
  type DeveloperApiKeyDetails,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/app/CodeBlock";
import { Input } from "@/components/ui/input";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback below.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function ApiKeysPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [keys, setKeys] = useState<DeveloperApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New key creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingSubmitting, setCreatingSubmitting] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const newlyCreatedKeyRef = useRef<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrefix, setCopiedPrefix] = useState(false);

  // Single key deep dive modal state
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [keyDetails, setKeyDetails] = useState<DeveloperApiKeyDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Snippet language tab
  const [snippetLang, setSnippetLang] = useState<"curl" | "python" | "typescript">("curl");

  const loadKeys = async () => {
    if (!isSignedIn) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokenGetter = async () => {
        return (await getToken()) ?? null;
      };
      const data = await fetchDeveloperApiKeys(tokenGetter);
      setKeys(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const loadKeyDetails = async (keyId: string) => {
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const tokenGetter = async () => {
        return (await getToken()) ?? null;
      };
      const data = await fetchDeveloperKeyDetails(keyId, tokenGetter);
      setKeyDetails(data);
    } catch (err: unknown) {
      setDetailsError(err instanceof Error ? err.message : "Failed to load key details");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }
    void loadKeys();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!selectedKeyId) {
      setKeyDetails(null);
      setDetailsError(null);
      return;
    }
    void loadKeyDetails(selectedKeyId);
  }, [selectedKeyId]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      return;
    }
    setCreatingSubmitting(true);
    setError(null);
    try {
      const tokenGetter = async () => {
        return (await getToken()) ?? null;
      };
      const res = await createDeveloperApiKey(newKeyName.trim(), tokenGetter);
      const fullKey = res.apiKey.trim();
      newlyCreatedKeyRef.current = fullKey;
      setNewlyCreatedKey(fullKey);
      setNewKeyName("");
      setIsCreating(false);
      const copied = await writeClipboard(fullKey);
      setCopiedKey(copied);
      if (copied) {
        window.setTimeout(() => {
          setCopiedKey(false);
        }, 2500);
      }
      void loadKeys();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreatingSubmitting(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }
    try {
      const tokenGetter = async () => {
        return (await getToken()) ?? null;
      };
      await revokeDeveloperApiKey(keyId, tokenGetter);
      void loadKeys();
      if (selectedKeyId === keyId) {
        void loadKeyDetails(keyId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  };

  const copySecretKey = async () => {
    const fullKey = newlyCreatedKeyRef.current || newlyCreatedKey;
    if (!fullKey || fullKey.includes("...")) {
      setError("Full API key is not available to copy. Create a new key.");
      return;
    }
    const copied = await writeClipboard(fullKey);
    if (!copied) {
      setError("Could not copy the API key. Select it and copy manually.");
      return;
    }
    setCopiedKey(true);
    window.setTimeout(() => {
      setCopiedKey(false);
    }, 2500);
  };

  const copyKeyPrefix = async (prefix: string) => {
    const label = prefix.trim();
    if (!label) {
      return;
    }
    const copied = await writeClipboard(label);
    if (!copied) {
      setError("Could not copy the key label. Select it and copy manually.");
      return;
    }
    setCopiedPrefix(true);
    window.setTimeout(() => {
      setCopiedPrefix(false);
    }, 2500);
  };

  const displayKeyPlaceholder = newlyCreatedKey || "hyd_live_your_api_key_here";

  const snippets = {
    curl: `curl -X POST https://hydrilla-backend.vercel.app/v1/3d/image-to-3d \\
  -H "Authorization: Bearer ${displayKeyPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/character.png",
    "resolution": 1536
  }'`,
    python: `import requests

url = "https://hydrilla-backend.vercel.app/v1/3d/image-to-3d"
headers = {
    "Authorization": "Bearer ${displayKeyPlaceholder}",
    "Content-Type": "application/json"
}
payload = {
    "image_url": "https://example.com/character.png",
    "resolution": 1536
}

response = requests.post(url, json=payload, headers=headers)
task = response.json()
print("Task queued:", task["id"])`,
    typescript: `import fetch from "node-fetch";

const res = await fetch("https://hydrilla-backend.vercel.app/v1/3d/image-to-3d", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${displayKeyPlaceholder}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    image_url: "https://example.com/character.png",
    resolution: 1536
  })
});

const task = await res.json();
console.log("Task queued:", task.id);`,
  };

  const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Never";

  const TH = "border-b border-neutral-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400";
  const TD = "border-b border-neutral-200/60 px-4 py-3.5 align-middle text-[13px] text-neutral-700";

  return (
    <div className="app-content-page font-dm-sans bg-(--app-canvas)">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-medium uppercase tracking-[0.14em] text-neutral-400">Developers</span>
              <span className="text-neutral-300">·</span>
              <Link
                href="https://docs.hydrilla.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-neutral-600 hover:text-neutral-900"
              >
                API docs
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <h1 className="mt-2 text-neutral-900">API keys</h1>
            <p className="mt-2.5 max-w-xl text-[15px] text-neutral-500">
              Secret keys for calling Text-to-3D, Image-to-3D and image generation from your own code. Usage is billed in credits.
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="h-10 shrink-0 gap-2 self-start px-5 text-[13px] sm:self-auto">
            <Plus className="h-4 w-4" />
            Create secret key
          </Button>
        </header>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {newlyCreatedKey && (
          <div className="rounded-[24px] bg-emerald-500/10 p-5 ring-1 ring-emerald-500/20 sm:p-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              Copy your new secret key now
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
              This full key is shown once. The truncated value in the list below is only a label — it will not work as an API key.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                readOnly
                value={newlyCreatedKey}
                onFocus={(e) => {
                  e.currentTarget.select();
                }}
                aria-label="New API key"
                className="h-11 min-w-0 flex-1 rounded-2xl bg-white px-4 font-mono text-[13px] text-neutral-900"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void copySecretKey();
                }}
                className="h-11 shrink-0 gap-1.5 px-5"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copiedKey ? "Copied full key" : "Copy full key"}
              </Button>
            </div>
          </div>
        )}

        {isCreating && (
          <form onSubmit={handleCreateKey} className="app-panel p-5 sm:p-6">
            <h2 className="text-[18px] text-neutral-900">New secret key</h2>
            <p className="mt-1 text-[13px] text-neutral-500">Name it after where it&apos;s used, like &ldquo;Production pipeline&rdquo; or &ldquo;Blender add-on&rdquo;.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                id="keyName"
                aria-label="Key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name"
                autoFocus
                required
                className="h-11 flex-1 rounded-full bg-white px-4"
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} disabled={creatingSubmitting} className="h-11 px-5">
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingSubmitting || !newKeyName.trim()} className="h-11 flex-1 gap-1.5 px-5 sm:flex-none">
                  {creatingSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {creatingSubmitting ? "Creating…" : "Create key"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Keys */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[20px] leading-tight text-neutral-900">Your keys</h2>
              <p className="mt-1 text-[14px] text-neutral-500">Open a key to see its requests and credit usage.</p>
            </div>
            {!loading && keys.length > 0 && (
              <span className="text-[12px] tabular-nums text-neutral-500">
                {keys.filter((k) => k.status === "active").length} active
              </span>
            )}
          </div>

          {loading ? (
            <div className="app-panel flex items-center justify-center gap-2 py-14 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading API keys…
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-neutral-300 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <Key className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-neutral-900">No secret keys yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-[13px] text-neutral-500">
                  Create a key to call Hydrilla from your backend, tools or game engine.
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-1 h-10 px-5">
                Create your first key
              </Button>
            </div>
          ) : (
            <div className="app-panel overflow-hidden">
              <div className="overflow-x-auto p-2 sm:p-3">
                <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-left [&_tbody_tr:last-child_td]:border-b-0">
                  <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[15%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={TH}>Name</th>
                      <th className={TH}>Status</th>
                      <th className={`${TH} text-right`}>Requests</th>
                      <th className={`${TH} text-right`}>Credits</th>
                      <th className={TH}>Last used</th>
                      <th className={`${TH} text-right`}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id} className="group">
                        <td className={TD}>
                          <p className="truncate font-semibold text-neutral-900">{k.name}</p>
                          <p className="mt-0.5 truncate font-mono text-[12px] text-neutral-400" title="Masked label — not the full API key">
                            {k.keyPrefix} · created {fmtDate(k.createdAt)}
                          </p>
                        </td>
                        <td className={TD}>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                              k.status === "active"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-neutral-200/70 text-neutral-500"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {k.status}
                          </span>
                        </td>
                        <td className={`${TD} text-right font-medium tabular-nums text-neutral-900`}>
                          {(k.totalRequests ?? 0).toLocaleString()}
                        </td>
                        <td className={`${TD} text-right font-semibold tabular-nums text-neutral-900`}>
                          {(k.totalCreditsUsed ?? 0).toLocaleString()}
                        </td>
                        <td className={`${TD} whitespace-nowrap text-neutral-500`}>{fmtDate(k.lastUsedAt)}</td>
                        <td className={`${TD} text-right`}>
                          <div className="inline-flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedKeyId(k.id)}
                              className="h-8 gap-1.5 px-3 text-[12px]"
                              title="View requests and credit usage"
                            >
                              <BarChart2 className="h-3.5 w-3.5" />
                              Details
                            </Button>
                            {k.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevoke(k.id)}
                                className="h-8 w-8 p-0 text-neutral-400 hover:bg-red-500/10 hover:text-red-600"
                                title="Revoke key"
                                aria-label={`Revoke ${k.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Quickstart */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-[20px] leading-tight text-neutral-900">Quickstart</h2>
            <p className="mt-1 text-[14px] text-neutral-500">
              Queue an Image-to-3D task, then poll <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[12px] text-neutral-800">GET /v1/3d/tasks/:taskId</code> until it&apos;s done.
            </p>
          </div>
          <CodeBlock
            snippets={snippets}
            lang={snippetLang}
            onLangChange={setSnippetLang}
            secret={displayKeyPlaceholder}
            title="POST /v1/3d/image-to-3d"
          />
        </section>

        {/* Reference */}
        <section className="grid gap-3 md:grid-cols-2">
          <div className="app-panel p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-500" />
              <h2 className="text-[17px] text-neutral-900">Endpoints</h2>
            </div>
            <ul className="mt-4 flex flex-col gap-1.5 font-mono text-[12.5px]">
              {(
                [
                  ["POST", "/v1/3d/image-to-3d"],
                  ["POST", "/v1/3d/text-to-3d"],
                  ["GET", "/v1/3d/tasks/:taskId"],
                  ["POST", "/v1/images/generate"],
                  ["POST", "/v1/images/edit"],
                  ["GET", "/v1/models"],
                  ["GET", "/v1/user/me"],
                ] as const
              ).map(([method, path]) => (
                <li key={path} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                  <span
                    className={`w-11 shrink-0 rounded-md py-0.5 text-center text-[10px] font-bold tracking-wide ${
                      method === "POST"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-[var(--hyd-100)] text-[#3f6fa8] dark:text-[var(--hyd-400)]"
                    }`}
                  >
                    {method}
                  </span>
                  <span className="truncate text-neutral-800">{path}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="app-panel p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-neutral-500" />
              <h2 className="text-[17px] text-neutral-900">Models</h2>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                ["BlueFox 3D", "bluefox-1", "1536/1024 image-to-3D reconstruction with 4096 PBR maps."],
                ["OpenAI Images", "gpt-image-2.5-flare · sunburst", "Low and high quality orthographic concept renders."],
                ["Google Gemini Images", "gemini-3.1-flash-image · gemini-3-pro-image", "1K and 2K image generation."],
              ].map(([name, id, body]) => (
                <li key={name} className="rounded-xl bg-white px-3.5 py-3">
                  <p className="text-[13px] font-semibold text-neutral-900">{name}</p>
                  <p className="mt-0.5 truncate font-mono text-[11.5px] text-neutral-500">{id}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Single API Key Inspection Modal */}
      {selectedKeyId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-md community-overlay-in sm:p-6"
          onClick={() => {
            setSelectedKeyId(null);
          }}
        >
          <div
            className="community-pop-in relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.35)]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-neutral-900 p-2 text-white">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-neutral-900">
                      {keyDetails?.key.name || "API Key Details"}
                    </h3>
                    {keyDetails && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          keyDetails.key.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}
                      >
                        {keyDetails.key.status}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <code className="text-xs font-mono text-neutral-500">
                      {keyDetails?.key.keyPrefix || "Loading..."}
                    </code>
                    {keyDetails && (
                      <button
                        type="button"
                        onClick={() => {
                          void copyKeyPrefix(keyDetails.key.keyPrefix);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
                        title="Copy masked key label"
                        aria-label="Copy masked key label"
                      >
                        {copiedPrefix ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Masked label only — the full secret cannot be shown again.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedKeyId(null);
                }}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700" aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-900" />
                  <p className="text-sm">Loading credit analytics &amp; request logs...</p>
                </div>
              ) : detailsError ? (
                <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p>{detailsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedKeyId) {
                          void loadKeyDetails(selectedKeyId);
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : keyDetails ? (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Total Credits Used
                      </div>
                      <div className="mt-1 text-2xl font-bold text-neutral-900 flex items-center gap-1.5">
                        <Zap className="h-5 w-5 text-amber-500" />
                        {keyDetails.summary.totalCreditsUsed}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">credits consumed</div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Total Requests
                      </div>
                      <div className="mt-1 text-2xl font-bold text-neutral-900">
                        {keyDetails.summary.totalRequests}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">lifetime API calls</div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        3D Pipeline
                      </div>
                      <div className="mt-1 text-2xl font-bold text-[#3f6fa8] dark:text-[var(--hyd-400)]">
                        {keyDetails.summary.credits3d}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        credits ({keyDetails.summary.requests3d} tasks)
                      </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        2D Image Gen
                      </div>
                      <div className="mt-1 text-2xl font-bold text-emerald-600">
                        {keyDetails.summary.credits2d}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        credits ({keyDetails.summary.requests2d} calls)
                      </div>
                    </div>
                  </div>

                  {/* Key Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3.5 text-xs text-neutral-600">
                    <div>
                      <span className="text-neutral-400">Created:</span>{" "}
                      <span className="font-medium text-neutral-800">
                        {new Date(keyDetails.key.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Last Used:</span>{" "}
                      <span className="font-medium text-neutral-800">
                        {keyDetails.key.lastUsedAt
                          ? new Date(keyDetails.key.lastUsedAt).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                    {keyDetails.key.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await handleRevoke(keyDetails.key.id);
                          setSelectedKeyId(null);
                        }}
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Revoke this key
                      </Button>
                    )}
                  </div>

                  {/* Endpoint Breakdown */}
                  {Object.keys(keyDetails.summary.endpointCounts).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Usage by Endpoint
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {Object.entries(keyDetails.summary.endpointCounts).map(([endpoint, stats]) => (
                          <div
                            key={endpoint}
                            className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-3 text-xs"
                          >
                            <code className="font-mono text-neutral-800 font-medium">{endpoint}</code>
                            <div className="text-right">
                              <span className="font-semibold text-neutral-900">{stats.requests} calls</span>
                              <span className="text-neutral-400 mx-1">•</span>
                              <span className="text-amber-600 font-semibold">{stats.credits} credits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Request Logs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Recent Activity Log ({keyDetails.recentLogs.length} events)
                    </h4>
                    {keyDetails.recentLogs.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500">
                        No requests recorded for this key yet. Calls made to the developer API will show here in real-time.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl bg-neutral-50 p-1.5">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-400">
                            <tr>
                              <th className="px-3 py-2 font-semibold">Time</th>
                              <th className="px-3 py-2 font-semibold">Method &amp; Endpoint</th>
                              <th className="px-3 py-2 font-semibold">Status</th>
                              <th className="px-3 py-2 font-semibold">Credits</th>
                              <th className="px-3 py-2 font-semibold">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {keyDetails.recentLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-neutral-50/50">
                                <td className="px-3 py-2 text-neutral-400 whitespace-nowrap text-[11px]">
                                  {new Date(log.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </td>
                                <td className="px-3 py-2 font-mono whitespace-nowrap">
                                  <span
                                    className={`font-semibold mr-1.5 ${
                                      log.method === "POST" ? "text-emerald-600" : "text-blue-600"
                                    }`}
                                  >
                                    {log.method}
                                  </span>
                                  <span className="text-neutral-800">{log.endpoint}</span>
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                                      log.statusCode >= 200 && log.statusCode < 300
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : log.statusCode === 402
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                  >
                                    {log.statusCode}
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-semibold whitespace-nowrap">
                                  {log.creditsDeducted > 0 ? (
                                    <span className="text-amber-600 font-mono">
                                      -{log.creditsDeducted} credits
                                    </span>
                                  ) : (
                                    <span className="text-neutral-400 font-mono">0 credits</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-neutral-500 text-[11px] truncate max-w-50">
                                  {log.details && Object.keys(log.details).length > 0 ? (
                                    <span>
                                      {String(
                                        log.details.model ||
                                          log.details.taskId ||
                                          log.details.prompt ||
                                          log.details.error ||
                                          JSON.stringify(log.details)
                                      )}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-neutral-200/70 px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedKeyId(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
