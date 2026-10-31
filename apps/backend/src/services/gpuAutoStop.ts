import { logger } from "../logger.js";
import { getAppSetting, setAppSetting } from "./appSettings.js";
import { runGpuInstanceAction } from "./gcpCompute.js";

const SETTING_KEY = "gpu_auto_stop";
const MIN_TIMER_MS = 5 * 60_000;
const MAX_TIMER_MS = 24 * 60 * 60_000;

export type GpuAutoStopEntry = {
  startedAt: number;
  endsAt: number;
  durationMs: number;
};

export type GpuAutoStopTimers = Record<string, GpuAutoStopEntry>;

export type GpuAutoStopRun = {
  stopped: string[];
  failed: { name: string; error: string }[];
};

function isEntry(value: unknown): value is GpuAutoStopEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Partial<GpuAutoStopEntry>;
  return (
    typeof entry.startedAt === "number" &&
    typeof entry.endsAt === "number" &&
    typeof entry.durationMs === "number"
  );
}

function parseTimers(raw: string): GpuAutoStopTimers {
  if (!raw) {
    return {};
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") {
      return {};
    }
    const timers: GpuAutoStopTimers = {};
    for (const [name, entry] of Object.entries(data as Record<string, unknown>)) {
      if (isEntry(entry)) {
        timers[name] = {
          startedAt: entry.startedAt,
          endsAt: entry.endsAt,
          durationMs: entry.durationMs,
        };
      }
    }
    return timers;
  } catch {
    return {};
  }
}

async function readTimers(): Promise<GpuAutoStopTimers> {
  return parseTimers(await getAppSetting(SETTING_KEY, ""));
}

async function writeTimers(timers: GpuAutoStopTimers): Promise<void> {
  await setAppSetting(SETTING_KEY, JSON.stringify(timers));
}

export function clampAutoStopDuration(durationMs: number): number | null {
  if (!Number.isFinite(durationMs)) {
    return null;
  }
  const ms = Math.floor(durationMs);
  if (ms < MIN_TIMER_MS || ms > MAX_TIMER_MS) {
    return null;
  }
  return ms;
}

export async function getGpuAutoStopTimers(): Promise<GpuAutoStopTimers> {
  return readTimers();
}

export async function startGpuAutoStop(name: string, durationMs: number): Promise<GpuAutoStopEntry> {
  const at = Date.now();
  const entry = { startedAt: at, endsAt: at + durationMs, durationMs };
  const timers = await readTimers();
  timers[name] = entry;
  await writeTimers(timers);
  return entry;
}

export async function extendGpuAutoStop(name: string, byMs: number): Promise<GpuAutoStopEntry | null> {
  const timers = await readTimers();
  const entry = timers[name];
  if (!entry) {
    return null;
  }
  const at = Date.now();
  const endsAt = Math.min(at + MAX_TIMER_MS, Math.max(entry.endsAt, at) + byMs);
  const next = { ...entry, endsAt, durationMs: endsAt - entry.startedAt };
  timers[name] = next;
  await writeTimers(timers);
  return next;
}

export async function cancelGpuAutoStop(name: string): Promise<void> {
  const timers = await readTimers();
  delete timers[name];
  await writeTimers(timers);
}

function alreadyStopped(message: string): boolean {
  return /already|terminated|not running|resource is not ready/i.test(message);
}

/** Stops every instance whose saved deadline has passed. Safe to call when no admin page is open. */
export async function runDueGpuAutoStops(now = Date.now()): Promise<GpuAutoStopRun> {
  const timers = await readTimers();
  const dueNames = Object.entries(timers)
    .filter(([, entry]) => {
      return entry.endsAt <= now;
    })
    .map(([name]) => {
      return name;
    });
  const stopped: string[] = [];
  const failed: { name: string; error: string }[] = [];
  const next = { ...timers };
  for (const name of dueNames) {
    try {
      await runGpuInstanceAction("stop", name);
      delete next[name];
      stopped.push(name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (alreadyStopped(message)) {
        delete next[name];
        stopped.push(name);
      } else {
        logger.error({ err: message, name }, "GPU auto-stop failed");
        failed.push({ name, error: message });
      }
    }
  }
  if (stopped.length > 0) {
    await writeTimers(next);
  }
  return { stopped, failed };
}
