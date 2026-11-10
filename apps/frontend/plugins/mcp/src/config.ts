import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SERVER_VERSION = "2.0.2";
export const DEFAULT_API_BASE = "https://hydrilla-ai-g1bm.vercel.app";
export const API_KEYS_URL = "https://hydrilla.ai/app/api-keys";

/** Hosts that do not serve the developer API (old backend, GPU gateway). */
const RETIRED_API_HOSTS = ["hydrilla-backend.vercel.app", "api.hydrilla.co", "api.hydrilla.ai"];

function unquoteEnvValue(value: string): string {
  const quoted =
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"));
  if (quoted && value.length >= 2) {
    return value.slice(1, -1);
  }
  return value;
}

/** Load mcp.env next to the server. Claude Code does not read an envFile field. */
export function loadLocalEnv(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const envPath = [join(here, "mcp.env"), join(here, "..", "mcp.env")].find((path) => existsSync(path));
  if (!envPath) {
    return;
  }
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = unquoteEnvValue(trimmed.slice(eq + 1).trim());
  }
}

type SharedConfig = { api_key?: unknown; api_base?: unknown };

/**
 * Config the Hydrilla plugins write when a key is pasted into one of them.
 * Read on every call, so a key added in Blender works without restarting the agent.
 */
function readSharedConfig(): SharedConfig {
  const folder = (process.env.HYDRILLA_CONFIG_DIR || "").trim() || join(homedir(), ".hydrilla");
  const path = join(folder, "config.json");
  if (!existsSync(path)) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (parsed && typeof parsed === "object") {
      return parsed as SharedConfig;
    }
    return {};
  } catch {
    // An unreadable shared file just means no shared key.
    return {};
  }
}

function cleanApiKey(value: unknown): string {
  const text = typeof value === "string" ? value.trim().replace(/^["']|["']$/g, "").trim() : "";
  if (text.toLowerCase().startsWith("bearer ")) {
    return text.slice(7).trim();
  }
  return text;
}

/** Key to use: the agent's MCP config first, else the one saved by a Hydrilla plugin. */
export function resolveApiKey(): string {
  const fromEnv = cleanApiKey(process.env.HYDRILLA_API_KEY || process.env.HYDRILLA_API_TOKEN);
  if (fromEnv) {
    return fromEnv;
  }
  return cleanApiKey(readSharedConfig().api_key);
}

export function normalizeApiBase(value: unknown): string {
  const text = typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
  if (!/^https?:\/\/\S+$/i.test(text)) {
    return DEFAULT_API_BASE;
  }
  if (RETIRED_API_HOSTS.some((host) => text.toLowerCase().includes(host))) {
    return DEFAULT_API_BASE;
  }
  return text;
}

export function resolveApiBase(): string {
  const fromEnv = (process.env.HYDRILLA_API_BASE || "").trim();
  if (fromEnv) {
    return normalizeApiBase(fromEnv);
  }
  return normalizeApiBase(readSharedConfig().api_base);
}

/** Project token from env only. Secrets are never hardcoded. */
export function getPostHogProjectToken(): string | undefined {
  return (
    process.env.POSTHOG_PROJECT_TOKEN ||
    process.env.POSTHOG_API_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  );
}

export function getPostHogHost(): string {
  return (
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    "https://us.i.posthog.com"
  );
}
