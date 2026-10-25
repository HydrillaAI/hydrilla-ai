"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  ArrowUp,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  FileText,
} from "lucide-react";
import { API_SPECS, PAGE_META } from "@/lib/docsData";
import { SITE } from "@/lib/site";

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  code?: { lang: string; snippet: string };
  sources?: { title: string; href: string }[];
}

const STARTERS_BY_PATH: Record<string, string[]> = {
  "/introduction": [
    "What can I build with the Hydrilla AI API?",
    "How does the BlueFox 3D cascade pipeline work?",
    "What happens if a 3D generation job fails?",
  ],
  "/quickstart": [
    "How do I generate my first 3D GLB mesh from text?",
    "How should I poll GET /v1/3d/tasks/:taskId in Python?",
    "Where do I create my hyd_live_ API key?",
  ],
  "/authentication": [
    "Should I use Authorization: Bearer or x-api-key?",
    "What causes a 401 vs 402 error response?",
    "How are API keys stored and revoked?",
  ],
  "/models": [
    "What is the credit cost difference between 1024 and 1536 resolution?",
    "Which 2D model should I use for concept generation?",
    "How do I list all available models via the API?",
  ],
  "/api/text-to-3d": [
    "Show a cURL and Python example for POST /v1/3d/text-to-3d",
    "How do I choose the upstream 2D concept model for Text-to-3D?",
    "How long does 1536 resolution reconstruction take?",
  ],
  "/api/image-to-3d": [
    "What image formats and URLs work best for Image-to-3d?",
    "Show a TypeScript example for POST /v1/3d/image-to-3d",
    "Does Image-to-3D remove the background automatically?",
  ],
  "/api/tasks": [
    "What are all the possible task status values?",
    "Where is the final .glb download URL in the task response?",
    "What is the recommended polling interval?",
  ],
};

const DEFAULT_STARTERS = [
  "How do I generate a 3D GLB mesh from a text prompt?",
  "How does Bearer authentication work?",
  "How do I poll a task until the GLB mesh is ready?",
];

function buildGroundedReply(question: string, pathname: string): Omit<AiMessage, "id" | "role"> {
  const q = question.toLowerCase();
  const endpointKey = pathname.startsWith("/api/") ? pathname.replace("/api/", "") : null;
  const activeSpec = endpointKey ? API_SPECS[endpointKey] : null;

  if (q.includes("auth") || q.includes("bearer") || q.includes("x-api-key") || q.includes("401") || q.includes("key")) {
    return {
      text: "Authenticate every request with your `hyd_live_` key using either `Authorization: Bearer <KEY>` (recommended) or the `x-api-key` header. Keys are hashed with SHA-256 and can be revoked instantaneously from the dashboard.\n\n• **401 Unauthorized** — Missing, malformed, or revoked key.\n• **402 Payment Required** — Credit balance is lower than the endpoint cost.",
      code: {
        lang: "bash",
        snippet: `curl -X GET ${SITE.apiBaseUrl}/v1/user/me \\\n  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
      },
      sources: [
        { title: "Authentication", href: "/authentication" },
        { title: "Account & Credits", href: "/api/user-me" },
      ],
    };
  }

  if (q.includes("poll") || q.includes("task") || q.includes("status") || q.includes("glb")) {
    const spec = API_SPECS["tasks"];
    return {
      text: "3D generation runs asynchronously. After submitting a job to `/v1/3d/text-to-3d` or `/v1/3d/image-to-3d`, poll `GET /v1/3d/tasks/:taskId` every **2–3 seconds**.\n\n• `queued` → `processing` → `completed` (or `failed`)\n• When `status === \"completed\"`, download the watertight PBR mesh from `result.mesh_url`.",
      code: {
        lang: "python",
        snippet: spec?.pythonExample ?? `res = requests.get("https://api.hydrilla.co/v1/3d/tasks/job_c18ab44d03e192a40", headers=headers)\nprint(res.json()["result"]["mesh_url"])`,
      },
      sources: [
        { title: "Tasks & Polling", href: "/api/tasks" },
        { title: "Python SDK Guide", href: "/sdks/python" },
      ],
    };
  }

  if (q.includes("model") || q.includes("credit") || q.includes("cost") || q.includes("1536") || q.includes("1024") || q.includes("bluefox")) {
    return {
      text: "Hydrilla provides **BlueFox 3D (`bluefox-1`)** for 3D reconstruction at `1024` (standard) or `1536` (high-detail) resolution, plus multi-modal 2D concept models (`gemini/flash`, `gemini/pro`, `openai/flare`, `openai/sunburst`).\n\nCredits are verified upfront and automatically refunded 100% if an upstream worker fails.",
      code: {
        lang: "bash",
        snippet: `curl -X GET ${SITE.apiBaseUrl}/v1/models \\\n  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
      },
      sources: [
        { title: "Models & Engines", href: "/models" },
        { title: "List Models", href: "/api/models-list" },
      ],
    };
  }

  if (q.includes("image-to-3d") || q.includes("image to 3d") || (q.includes("image") && q.includes("3d"))) {
    const spec = API_SPECS["image-to-3d"];
    return {
      text: "`POST /v1/3d/image-to-3d` reconstructs a single input image (`image_url` or base64 data URI) into a textured `.glb` mesh using the BlueFox 3D pipeline. Pass `resolution: 1536` for dense geometry.",
      code: {
        lang: "bash",
        snippet: spec.curlExample,
      },
      sources: [
        { title: "Image to 3D", href: "/api/image-to-3d" },
        { title: "Tasks & Polling", href: "/api/tasks" },
      ],
    };
  }

  if (q.includes("2d") || q.includes("concept") || q.includes("edit")) {
    const spec = q.includes("edit") ? API_SPECS["images-edit"] : API_SPECS["images-generate"];
    return {
      text: "Use `POST /v1/images/generate` to create 2D concept renders or `POST /v1/images/edit` to modify existing concept art before sending it to `POST /v1/3d/image-to-3d`.",
      code: {
        lang: "bash",
        snippet: spec.curlExample,
      },
      sources: [
        { title: "Generate Concept Image", href: "/api/images-generate" },
        { title: "Edit Concept Image", href: "/api/images-edit" },
      ],
    };
  }

  if (q.includes("typescript") || q.includes("node") || q.includes("next")) {
    return {
      text: "Use the typed `Hydrilla` client in TypeScript / Node.js to submit a generation job and poll until the `.glb` asset is ready:",
      code: {
        lang: "typescript",
        snippet: API_SPECS["text-to-3d"].tsExample,
      },
      sources: [
        { title: "TypeScript SDK Guide", href: "/sdks/typescript" },
        { title: "Text to 3D", href: "/api/text-to-3d" },
      ],
    };
  }

  if (activeSpec) {
    return {
      text: `**${activeSpec.title}** (\`${activeSpec.method} ${activeSpec.path}\`) — ${activeSpec.description}\n\n• **Base URL:** \`${SITE.apiBaseUrl}\`\n• **Authentication:** \`${activeSpec.authHeader}\`\n• **Credits:** ${activeSpec.creditCost}`,
      code: {
        lang: q.includes("python") ? "python" : "bash",
        snippet: q.includes("python") ? activeSpec.pythonExample : activeSpec.curlExample,
      },
      sources: [
        { title: activeSpec.title, href: pathname },
        { title: "Tasks & Polling", href: "/api/tasks" },
      ],
    };
  }

  const text3d = API_SPECS["text-to-3d"];
  return {
    text: "To generate a 3D asset with Hydrilla AI:\n\n1. Create a `hyd_live_` key in the Studio dashboard.\n2. Call `POST /v1/3d/text-to-3d` with a `prompt` and `resolution` (`1024` or `1536`).\n3. Poll `GET /v1/3d/tasks/:taskId` until `status` is `completed` and download `result.mesh_url`.",
    code: {
      lang: "bash",
      snippet: text3d.curlExample,
    },
    sources: [
      { title: "Quickstart", href: "/quickstart" },
      { title: "Text to 3D", href: "/api/text-to-3d" },
      { title: "Tasks & Polling", href: "/api/tasks" },
    ],
  };
}

export function AskAiSheet({
  open,
  onClose,
  initialPrompt,
  onConsumePrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt: string | null;
  onConsumePrompt: () => void;
}) {
  const pathname = usePathname();
  const pageMeta = PAGE_META[pathname];
  const contextTitle = pageMeta?.heading ?? "Hydrilla Docs";
  const pageUrl = `${SITE.docsUrl}${pathname === "/" ? "/quickstart" : pathname}`;

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const starters = useMemo(
    () => STARTERS_BY_PATH[pathname] ?? DEFAULT_STARTERS,
    [pathname],
  );

  function ask(questionText: string) {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const reply = buildGroundedReply(trimmed, pathname);
    const botMsg: AiMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      ...reply,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  useEffect(() => {
    if (open && initialPrompt) {
      ask(initialPrompt);
      onConsumePrompt();
    }
  }, [open, initialPrompt]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const lastQuestion =
    [...messages].reverse().find((m) => m.role === "user")?.text ??
    `Help me integrate ${contextTitle} from ${pageUrl}`;
  const externalPrompt = `${lastQuestion}\n\nReference documentation: ${pageUrl}.md`;
  const chatGptHref = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(externalPrompt)}`;
  const claudeHref = `https://claude.ai/new?q=${encodeURIComponent(externalPrompt)}`;

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-black/35" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        aria-label="Ask AI assistant"
        className="flex h-full w-full max-w-[420px] flex-col border-l border-line bg-surface shadow-card"
      >
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ink" aria-hidden />
            <span className="text-[14px] font-semibold tracking-[-0.011em] text-ink">
              Assistant
            </span>
            <span className="rounded-md border border-line bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-ink-3">
              ⌘I
            </span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="icon-btn !h-8 !w-8 !min-w-8"
                aria-label="Reset conversation"
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="icon-btn !h-8 !w-8 !min-w-8"
              aria-label="Close assistant panel"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between rounded-lg border border-line bg-subtle px-3 py-2 text-[12px]">
            <span className="flex items-center gap-1.5 truncate text-ink-2">
              <FileText className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
              <span className="text-ink-3">Context:</span>
              <span className="truncate font-medium text-ink">{contextTitle}</span>
            </span>
            <a
              href={`${pathname === "/" ? "/quickstart" : pathname}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 shrink-0 font-mono text-[11px] text-ink-3 hover:text-ink"
            >
              .md ↗
            </a>
          </div>

          {messages.length === 0 ? (
            <div className="py-4">
              <p className="text-[14px] font-medium text-ink">
                Ask anything about the Hydrilla API
              </p>
              <p className="mt-1 text-[13px] leading-5 text-ink-3">
                Answers are grounded in our official endpoints, schemas, and SDK guides.
              </p>

              <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Suggested for this page
              </p>
              <div className="mt-2 space-y-1.5">
                {starters.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => ask(prompt)}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-[13px] leading-5 text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle hover:text-ink"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.role === "user"
                      ? "ml-8 rounded-xl bg-muted px-3.5 py-2.5 text-[13.5px] leading-5 text-ink"
                      : "rounded-xl border border-line bg-subtle p-3.5 text-[13.5px] leading-[21px] text-ink-2"
                  }
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.code && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface">
                      <div className="flex items-center justify-between border-b border-line bg-subtle px-3 py-1.5">
                        <span className="font-mono text-[11px] uppercase text-ink-3">
                          {msg.code.lang}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(msg.code!.snippet);
                              setCopiedId(msg.id);
                              window.setTimeout(() => setCopiedId(null), 1800);
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-2 hover:text-ink"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3" aria-hidden />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" aria-hidden />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-[19px] text-ink">
                        <code>{msg.code.snippet}</code>
                      </pre>
                    </div>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-ink-3">Sources:</span>
                      {msg.sources.map((src) => (
                        <Link
                          key={src.href}
                          href={src.href}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11.5px] font-medium text-ink hover:bg-muted"
                        >
                          {src.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-line p-3.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-subtle px-3 py-1.5 focus-within:border-line-strong"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Hydrilla…"
              className="h-8 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-3"
              aria-label="Ask AI a question"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send question"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-fg transition-opacity disabled:opacity-35"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-ink-3">
            <span>Responses use official Hydrilla docs</span>
            <div className="flex items-center gap-2.5">
              <a
                href={chatGptHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-ink"
              >
                ChatGPT <ExternalLink className="h-2.5 w-2.5" aria-hidden />
              </a>
              <a
                href={claudeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-ink"
              >
                Claude <ExternalLink className="h-2.5 w-2.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
