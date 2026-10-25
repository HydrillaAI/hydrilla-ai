"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GcpInstanceItem } from "@/lib/gpu-api";

export const MIN_TIMER_MS = 5 * 60_000;
export const MAX_TIMER_MS = 24 * 60 * 60_000;

const STORAGE_KEY = "hydrilla-admin:gpu-auto-stop";
// Another tab (or a failed attempt) owns the stop for this long before we retry.
const CLAIM_MS = 30_000;
const WARN_MS = 60_000;
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
  firingAt?: number;
};

type AutoStopTimers = Record<string, AutoStopEntry>;

const STOPPED_STATUSES = new Set(["TERMINATED", "STOPPED", "STOPPING", "SUSPENDED", "SUSPENDING"]);

export function isStoppedStatus(status: string | undefined): boolean {
  return status !== undefined && STOPPED_STATUSES.has(status);
}

// --- Persistent store (localStorage, synced across tabs) ---

const EMPTY: AutoStopTimers = {};
const listeners = new Set<() => void>();
let memoryRaw: string | null = null;
let cache: { raw: string | null; value: AutoStopTimers } = { raw: null, value: EMPTY };

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryRaw;
  }
}

function writeRaw(raw: string | null) {
  memoryRaw = raw;
  try {
    if (raw === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {
    // Storage blocked: the in-memory copy keeps the timer alive for this tab.
  }
}

function parse(raw: string | null): AutoStopTimers {
  if (!raw) {
    return EMPTY;
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") {
      return EMPTY;
    }
    const timers: AutoStopTimers = {};
    for (const [name, entry] of Object.entries(data as Record<string, Partial<AutoStopEntry>>)) {
      if (
        entry &&
        typeof entry.startedAt === "number" &&
        typeof entry.endsAt === "number" &&
        typeof entry.durationMs === "number"
      ) {
        timers[name] = {
          startedAt: entry.startedAt,
          endsAt: entry.endsAt,
          durationMs: entry.durationMs,
          firingAt: typeof entry.firingAt === "number" ? entry.firingAt : undefined,
        };
      }
    }
    return timers;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): AutoStopTimers {
  const raw = readRaw();
  if (raw !== cache.raw) {
    cache = { raw, value: parse(raw) };
  }
  return cache.value;
}

function getServerSnapshot(): AutoStopTimers {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function updateTimers(mutate: (timers: AutoStopTimers) => void) {
  const next = { ...parse(readRaw()) };
  mutate(next);
  writeRaw(Object.keys(next).length > 0 ? JSON.stringify(next) : null);
  emit();
}

function setTimer(name: string, entry: AutoStopEntry) {
  updateTimers((timers) => {
    timers[name] = entry;
  });
}

function clearTimer(name: string) {
  updateTimers((timers) => {
    delete timers[name];
  });
}

/** Marks the stop as in flight so other tabs don't fire it too. Returns false if someone else holds it. */
function claimTimer(name: string, at: number): boolean {
  const entry = parse(readRaw())[name];
  if (!entry || at < entry.endsAt) {
    return false;
  }
  if (entry.firingAt !== undefined && at - entry.firingAt < CLAIM_MS) {
    return false;
  }
  setTimer(name, { ...entry, firingAt: at });
  return true;
}

// --- Hook: ticks once a second and stops the VM when a timer runs out ---

export type AutoStopController = {
  timers: AutoStopTimers;
  now: number;
  start: (name: string, durationMs: number) => void;
  extend: (name: string, byMs: number) => void;
  cancel: (name: string) => void;
};

export function useAutoStopTimers({
  instances,
  onExpire,
}: {
  instances: GcpInstanceItem[] | undefined;
  onExpire: (name: string) => Promise<void>;
}): AutoStopController {
  const timers = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [now, setNow] = useState(0);
  const onExpireRef = useRef(onExpire);
  const warnedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

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

  // Drop timers that no longer apply: the VM was stopped, or restarted after the timer was set.
  useEffect(() => {
    if (!instances) {
      return;
    }
    for (const [name, entry] of Object.entries(timers)) {
      const inst = instances.find((i) => {
        return i.name === name;
      });
      if (!inst) {
        continue;
      }
      const lastStart = inst.lastStartTimestamp ? Date.parse(inst.lastStartTimestamp) : NaN;
      if (isStoppedStatus(inst.status) || lastStart > entry.startedAt + CLOCK_SKEW_MS) {
        clearTimer(name);
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
      if (remaining > 0 || !claimTimer(name, now)) {
        continue;
      }
      onExpireRef
        .current(name)
        .then(() => {
          clearTimer(name);
        })
        .catch((err: unknown) => {
          toast.error(
            `Auto-stop for ${name} failed: ${err instanceof Error ? err.message : String(err)}. Retrying in 30s.`,
          );
        });
    }
  }, [now, timers]);

  return {
    timers,
    now,
    start: (name, durationMs) => {
      const at = Date.now();
      const ms = Math.min(MAX_TIMER_MS, Math.max(MIN_TIMER_MS, durationMs));
      setTimer(name, { startedAt: at, endsAt: at + ms, durationMs: ms });
    },
    extend: (name, byMs) => {
      const entry = timers[name];
      if (!entry) {
        return;
      }
      const at = Date.now();
      const endsAt = Math.min(at + MAX_TIMER_MS, Math.max(entry.endsAt, at) + byMs);
      setTimer(name, { ...entry, endsAt, durationMs: endsAt - entry.startedAt, firingAt: undefined });
    },
    cancel: (name) => {
      clearTimer(name);
    },
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
            Stops at {new Date(entry.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[11px]"
              disabled={expired || atMax}
              onClick={() => {
                controller.extend(instanceName, 30 * 60_000);
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
                controller.cancel(instanceName);
                toast.success(`Auto-stop timer cancelled for ${instanceName}`);
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
            controller.start(instanceName, durationMs);
            toast.success(`${instanceName} will stop automatically in ${formatCountdown(durationMs)}`);
          }}
        >
          Start timer
        </Button>
      </div>
      <p className={`text-[11px] ${valid && !inRange ? "text-destructive" : "text-muted-foreground"}`}>
        {valid && !inRange
          ? "Pick between 5 minutes and 24 hours."
          : "5 min – 24 h. Runs in this browser, so keep an admin tab open."}
      </p>
    </div>
  );
}
