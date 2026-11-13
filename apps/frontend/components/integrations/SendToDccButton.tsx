"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Box, ChevronDown, ExternalLink, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { isBridgeOnline, sendGlbBytesToBridge } from "@/lib/dcc/bridge";
import { INTEGRATIONS, type Integration } from "@/lib/integrations";
import { cn } from "@/lib/utils";

type SendTarget = Integration & { bridgePort: number };

const SEND_TARGETS = INTEGRATIONS.filter(
  (item): item is SendTarget => item.status === "available" && typeof item.bridgePort === "number"
);

type Props = {
  meshUrl: string | null | undefined;
  jobId?: string | null;
  className?: string;
  compact?: boolean;
};

/** Which apps have their Hydrilla Bridge running; null while still checking. */
type OnlineState = Record<string, boolean> | null;

const probeTargets = async (): Promise<Record<string, boolean>> => {
  const results = await Promise.all(
    SEND_TARGETS.map(async (target) => [target.slug, await isBridgeOnline(target.bridgePort)] as const)
  );
  return Object.fromEntries(results);
};

export function SendToDccButton({
  meshUrl,
  jobId,
  className,
  compact = false,
}: Props) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState<OnlineState>(null);
  const [busyTarget, setBusyTarget] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const state = { cancelled: false };
    const refresh = async () => {
      const result = await probeTargets();
      if (!state.cancelled) {
        setOnline(result);
      }
    };
    void refresh();
    return () => {
      state.cancelled = true;
    };
  }, [open]);

  const disabled = !meshUrl;
  const anyOnline = online ? Object.values(online).some(Boolean) : false;

  const send = async (target: SendTarget) => {
    if (!meshUrl) {
      return;
    }
    setBusyTarget(target.slug);
    setMessage(null);
    try {
      await sendGlbBytesToBridge({
        port: target.bridgePort,
        meshUrl,
        name: `hydrilla-${jobId || target.slug}`,
        jobId: jobId || undefined,
        getToken: async () => (await getToken()) ?? null,
      });
      setMessage(`Sent to ${target.name}. It appears in your open project.`);
      setOnline((current) => ({ ...(current ?? {}), [target.slug]: true }));
    } catch (error) {
      console.error("Send to DCC failed", error);
      const stillOnline = await isBridgeOnline(target.bridgePort);
      setOnline((current) => ({ ...(current ?? {}), [target.slug]: stillOnline }));
      setMessage(
        stillOnline
          ? `${target.name} could not import this model. Try again, or download the GLB instead.`
          : `${target.name} is not listening. Open the Hydrilla plugin in ${target.name}, click Run Bridge, then retry.`
      );
    } finally {
      setBusyTarget(null);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
          compact
            ? "h-8 px-2.5 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-100"
            : "h-9 border border-neutral-200/80 bg-white px-3.5 text-[13px] font-semibold shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] hover:bg-neutral-50"
        )}
        title="Send this model to an app running the Hydrilla plugin"
      >
        <Send className="h-3.5 w-3.5" strokeWidth={2} />
        Send to DCC
        <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[280px] rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)]">
          <div className="mb-2 flex items-start gap-2 rounded-xl bg-neutral-50 px-3 py-2">
            <Box className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.85} />
            <div className="min-w-0 text-[12px] leading-5 text-neutral-600">
              {online === null ? (
                <span>Looking for open apps…</span>
              ) : anyOnline ? (
                <span>Pick an app that is ready to receive.</span>
              ) : (
                <span>
                  No app is listening. Open the Hydrilla plugin and click Run Bridge.{" "}
                  <Link href="/integrations" className="font-semibold text-neutral-950 underline">
                    Setup
                  </Link>
                </span>
              )}
            </div>
          </div>

          <ul className="max-h-64 space-y-0.5 overflow-auto">
            {SEND_TARGETS.map((target) => {
              const ready = online?.[target.slug] === true;
              return (
                <li key={target.slug}>
                  <button
                    type="button"
                    disabled={Boolean(busyTarget)}
                    onClick={() => void send(target)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          ready ? "bg-emerald-500" : "bg-neutral-300"
                        )}
                      />
                      {target.name}
                    </span>
                    {busyTarget === target.slug ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="text-[11px] font-normal text-neutral-500">
                        {ready ? "Ready" : "Not open"}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {message ? (
            <p className="mt-2 px-2 text-[12px] leading-5 text-neutral-600">{message}</p>
          ) : null}

          <Link
            href="/integrations"
            className="mt-2 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            All integrations
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
