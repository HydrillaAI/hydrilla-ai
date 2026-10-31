"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GcpInstanceItem } from "@/lib/gpu-api";

export const MIN_TIMER_MS = 5 * 60_000;
export const MAX_TIMER_MS = 24 * 60 * 60_000;

const WARN_MS = 60_000;
const RETRY_MS = 30_000;
// Tolerance for client/GCP clock skew when deciding a timer predates the VM's last start.
const CLOCK_SKEW_MS = 5 * 60_000;

const PRESETS: { label: string; minutes: number }[] = [
  { label: "5m", minutes: 5 },
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "4h", minutes: 240 },
  { label: "8h", minutes: 480 },
  { label: "12h", minutes: 720 },
  { label: "24h", minutes: 1440 },
];

type AutoStopEntry = {
  startedAt: number;
  endsAt: number;
  durationMs: number;
};

type AutoStopTimers = Record<string, AutoStopEntry>;

const STOPPED_STATUSES = new Set(["TERMINATED", "STOPPED", "STOPPING", "SUSPENDED", "SUSPENDING"]);

export function isStoppedStatus(status: string | undefined): boolean {
  return status !== undefined && STOPPED_STATUSES.has(status);
}

const EMPTY: AutoStopTimers = {};

// --- Hook: shows the countdown. The deadline is stored on the backend. ---

export type AutoStopController = {
  timers: AutoStopTimers;
  now: number;
  start: (name: string, durationMs: number) => Promise<void>;
  extend: (name: string, byMs: number) => Promise<void>;
  cancel: (name: string) => Promise<void>;
};

export function useAutoStopTimers({
  instances,
  saved,
  onExpire,
  onStart,
  onExtend,
  onCancel,
}: {
  instances: GcpInstanceItem[] | undefined;
  saved: AutoStopTimers | undefined;
  onExpire: (name: string) => Promise<void>;
  onStart: (name: string, durationMs: number) => Promise<void>;
  onExtend: (name: string, byMs: number) => Promise<void>;
  onCancel: (name: string) => Promise<void>;
}): AutoStopController {
  const timers = saved ?? EMPTY;
  const [now, setNow] = useState(0);
  const onExpireRef = useRef(onExpire);
  const onCancelRef = useRef(onCancel);
  const warnedRef = useRef<Set<string>>(new Set());
  const firingRef = useRef<Set<string>>(new Set());
  const droppedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onExpireRef.current = onExpire;
    onCancelRef.current = onCancel;
  }, [onExpire, onCancel]);

  useEffect(() => {
    const first = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    const tick = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(tick);
    };
  }, []);

  // Drop a saved timer when the VM is already stopped or was started again after the timer.
  useEffect(() => {
    if (!instances) {
      return;
    }
    for (const [name, entry] of Object.entries(timers)) {
      const inst = instances.find((item) => {
        return item.name === name;
      });
      if (!inst) {
        continue;
      }
      const lastStart = inst.lastStartTimestamp ? Date.parse(inst.lastStartTimestamp) : NaN;
      const key = `${name}:${entry.endsAt}`;
      if (
        (isStoppedStatus(inst.status) || lastStart > entry.startedAt + CLOCK_SKEW_MS) &&
        !droppedRef.current.has(key)
      ) {
        droppedRef.current.add(key);
        void onCancelRef.current(name);
      }
    }
  }, [instances, timers]);

  useEffect(() => {
    if (now === 0) {
      return;
    }
    for (const [name, entry] of Object.entries(timers)) {
      const remaining = entry.endsAt - now;
      const warnKey = `${name}:${entry.endsAt}`;
      if (remaining > 0 && remaining <= WARN_MS && entry.durationMs > WARN_MS && !warnedRef.current.has(warnKey)) {
        warnedRef.current.add(warnKey);
        toast.warning(`${name} auto-stops in under a minute.`);
      }
      if (remaining > 0 || firingRef.current.has(warnKey)) {
        continue;
      }
      firingRef.current.add(warnKey);
      void onExpireRef.current(name).catch((err: unknown) => {
        toast.error(
          `Auto-stop for ${name} failed: ${err instanceof Error ? err.message : String(err)}. Retrying in 30s.`,
        );
        window.setTimeout(() => {
          firingRef.current.delete(warnKey);
        }, RETRY_MS);
      });
    }
  }, [now, timers]);

  return {
    timers,
    now,
    start: onStart,
    extend: onExtend,
    cancel: onCancel,
  };
}

// --- UI ---

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s]
    .map((n) => {
      return String(n).padStart(2, "0");
    })
    .join(":");
}

export function AutoStopTimer({
  instanceName,
  controller,
  disabled,
}: {
  instanceName: string;
  controller: AutoStopController;
  disabled?: boolean;
}) {
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const entry = controller.timers[instanceName];

  if (entry) {
    const remaining = entry.endsAt - controller.now;
    const ratio = entry.durationMs > 0 ? Math.min(1, Math.max(0, remaining / entry.durationMs)) : 0;
    const ticking = controller.now > 0;
    const expired = ticking && remaining <= 0;
    const urgent = ticking && remaining <= MIN_TIMER_MS;
    const atMax = entry.endsAt - controller.now >= MAX_TIMER_MS - 30 * 60_000;

    return (
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            {expired ? "Auto-stop: stopping VM…" : "Auto-stop in"}
          </span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${
              urgent ? "text-destructive" : "text-foreground"
            }`}
          >
            {ticking ? formatCountdown(remaining) : "--:--:--"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${urgent ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            Stops at {new Date(entry.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, even if
            this page is closed.
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[11px]"
              disabled={expired || atMax}
              onClick={() => {
                void controller.extend(instanceName, 30 * 60_000).catch((err: unknown) => {
                  toast.error(err instanceof Error ? err.message : "Could not extend the timer");
                });
              }}
            >
              +30m
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[11px] text-muted-foreground"
              disabled={expired}
              onClick={() => {
                void controller.cancel(instanceName).then(() => {
                  toast.success(`Auto-stop timer cancelled for ${instanceName}`);
                }).catch((err: unknown) => {
                  toast.error(err instanceof Error ? err.message : "Could not cancel the timer");
                });
              }}
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const h = Number(hours);
  const m = Number(minutes);
  const valid = Number.isInteger(h) && Number.isInteger(m) && h >= 0 && m >= 0 && m < 60;
  const durationMs = valid ? (h * 60 + m) * 60_000 : 0;
  const inRange = valid && durationMs >= MIN_TIMER_MS && durationMs <= MAX_TIMER_MS;

  return (
    <div className="space-y-2 rounded-md border border-dashed border-border/60 p-2.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Timer className="h-3.5 w-3.5" />
        Auto-stop timer
      </span>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => {
          const active = valid && h * 60 + m === preset.minutes;
          return (
            <Button
              key={preset.label}
              size="sm"
              variant={active ? "secondary" : "outline"}
              className="h-6 px-2 text-[11px]"
              onClick={() => {
                setHours(String(Math.floor(preset.minutes / 60)));
                setMinutes(String(preset.minutes % 60));
              }}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={24}
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
          }}
          aria-label="Hours"
          className="h-7 w-14 px-2 text-xs tabular-nums"
        />
        <span className="text-xs text-muted-foreground">h</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minutes}
          onChange={(e) => {
            setMinutes(e.target.value);
          }}
          aria-label="Minutes"
          className="h-7 w-14 px-2 text-xs tabular-nums"
        />
        <span className="text-xs text-muted-foreground">m</span>
        <Button
          size="sm"
          className="ml-auto h-7 text-xs"
          disabled={disabled || !inRange}
          onClick={() => {
            void controller.start(instanceName, durationMs).then(() => {
              toast.success(`${instanceName} will stop automatically in ${formatCountdown(durationMs)}`);
            }).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not start the timer");
            });
          }}
        >
          Start timer
        </Button>
      </div>
      <p className={`text-[11px] ${valid && !inRange ? "text-destructive" : "text-muted-foreground"}`}>
        {valid && !inRange
          ? "Pick between 5 minutes and 24 hours."
          : "5 min – 24 h. The VM stops at that time even if you close this page."}
      </p>
    </div>
  );
}
