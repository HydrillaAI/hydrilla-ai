import crypto from "crypto";
import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { decryptApiKey, encryptApiKey } from "../lib/userApiKeysCrypto.js";

export type DeveloperApiKeyStatus = "active" | "revoked";

export type DeveloperApiKeyMeta = {
  id: string;
  name: string;
  keyPrefix: string;
  status: DeveloperApiKeyStatus;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  totalCreditsUsed: number;
  totalRequests: number;
  /** True when an encrypted copy exists and the key can be emailed. */
  canReveal: boolean;
};

export type VerifiedDeveloperKey = {
  userId: string;
  keyId: string;
  name: string;
};

export type DeveloperApiKeyUsageLog = {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsDeducted: number;
  details: Record<string, unknown>;
  createdAt: string;
};

export type DeveloperApiKeyDetails = {
  key: DeveloperApiKeyMeta;
  summary: {
    totalCreditsUsed: number;
    totalRequests: number;
    credits3d: number;
    credits2d: number;
    requests3d: number;
    requests2d: number;
    endpointCounts: Record<string, { requests: number; credits: number }>;
  };
  recentLogs: DeveloperApiKeyUsageLog[];
};

export type RecordDeveloperUsageParams = {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsDeducted?: number;
  details?: Record<string, unknown>;
};

export type RevealDeveloperApiKeyResult =
  | {
      ok: true;
      apiKey: string;
      keyName: string;
      keyPrefix: string;
    }
  | {
      ok: false;
      reason: "not_found" | "revoked" | "unavailable";
    };

const META_SELECT =
  "id, name, key_prefix, status, last_used_at, revoked_at, created_at, total_credits_used, total_requests, encrypted_key, iv, auth_tag";

function rowCanReveal(row: {
  encrypted_key?: string | null;
  iv?: string | null;
  auth_tag?: string | null;
}): boolean {
  return Boolean(row.encrypted_key && row.iv && row.auth_tag);
}

function mapMeta(row: {
  id: string;
  name: string;
  key_prefix: string;
  status: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  total_credits_used?: number | null;
  total_requests?: number | null;
  encrypted_key?: string | null;
  iv?: string | null;
  auth_tag?: string | null;
}): DeveloperApiKeyMeta {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    status: row.status as DeveloperApiKeyStatus,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    totalCreditsUsed: Number(row.total_credits_used ?? 0),
    totalRequests: Number(row.total_requests ?? 0),
    canReveal: rowCanReveal(row),
  };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key.trim()).digest("hex");
}

export function formatKeyPrefix(key: string): string {
  const trimmed = key.trim();
  const start = trimmed.slice(0, 12);
  const end = trimmed.slice(-4);
  return `${start}...${end}`;
}

export async function generateDeveloperApiKey(
  userId: string,
  name: string
): Promise<{ apiKey: string; meta: DeveloperApiKeyMeta }> {
  const randomHex = crypto.randomBytes(24).toString("hex");
  const apiKey = `hyd_live_${randomHex}`;
  const keyHash = hashApiKey(apiKey);
  const keyPrefix = formatKeyPrefix(apiKey);
  const keyName = name.trim() || "Default API Key";
  const encrypted = encryptApiKey(apiKey);

  const { data, error } = await supabase
    .from("developer_api_keys")
    .insert({
      user_id: userId,
      name: keyName,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      status: "active",
      total_credits_used: 0,
      total_requests: 0,
      encrypted_key: encrypted.encrypted_key,
      iv: encrypted.iv,
      auth_tag: encrypted.auth_tag,
    })
    .select(META_SELECT)
    .single();

  if (error || !data) {
    logger.error({ error, userId }, "Failed to create developer API key");
    throw new Error(error?.message || "Failed to create developer API key");
  }

  return { apiKey, meta: mapMeta(data) };
}

export async function verifyDeveloperApiKey(
  rawKey: string
): Promise<VerifiedDeveloperKey | null> {
  const trimmed = rawKey.trim();
  if (!trimmed.startsWith("hyd_live_")) {
    return null;
  }

  const keyHash = hashApiKey(trimmed);
  const { data, error } = await supabase
    .from("developer_api_keys")
    .select("id, user_id, name, status")
    .eq("key_hash", keyHash)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      logger.warn({ error }, "Error looking up developer API key");
    }
    return null;
  }

  return {
    userId: data.user_id,
    keyId: data.id,
    name: data.name,
  };
}

export async function listDeveloperKeysForUser(
  userId: string
): Promise<DeveloperApiKeyMeta[]> {
  const { data, error } = await supabase
    .from("developer_api_keys")
    .select(META_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error, userId }, "Failed to list developer API keys");
    return [];
  }

  return (data || []).map((row) => mapMeta(row));
}

export async function revokeDeveloperApiKey(
  userId: string,
  keyId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("developer_api_keys")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", keyId)
    .eq("user_id", userId);

  if (error) {
    logger.error({ error, userId, keyId }, "Failed to revoke developer API key");
    return false;
  }

  return true;
}

export async function revealDeveloperApiKey(
  userId: string,
  keyId: string
): Promise<RevealDeveloperApiKeyResult> {
  const { data, error } = await supabase
    .from("developer_api_keys")
    .select("id, name, key_prefix, status, encrypted_key, iv, auth_tag")
    .eq("id", keyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error({ error, userId, keyId }, "Failed to load developer API key for reveal");
    return { ok: false, reason: "not_found" };
  }
  if (!data) {
    return { ok: false, reason: "not_found" };
  }
  if (data.status !== "active") {
    return { ok: false, reason: "revoked" };
  }
  if (!rowCanReveal(data)) {
    return { ok: false, reason: "unavailable" };
  }

  const apiKey = decryptApiKey({
    encrypted_key: data.encrypted_key!,
    iv: data.iv!,
    auth_tag: data.auth_tag!,
  });
  if (!apiKey || !apiKey.startsWith("hyd_live_") || apiKey.includes("...")) {
    logger.warn({ userId, keyId }, "Developer API key decrypt failed or returned invalid value");
    return { ok: false, reason: "unavailable" };
  }

  return {
    ok: true,
    apiKey,
    keyName: data.name,
    keyPrefix: data.key_prefix,
  };
}

export async function recordDeveloperApiKeyUsage(
  params: RecordDeveloperUsageParams
): Promise<void> {
  const credits = Math.max(0, Math.floor(params.creditsDeducted ?? 0));

  try {
    const { error: rpcError } = await supabase.rpc("record_developer_key_usage", {
      p_api_key_id: params.apiKeyId,
      p_user_id: params.userId,
      p_endpoint: params.endpoint,
      p_method: params.method.toUpperCase(),
      p_status_code: params.statusCode,
      p_credits_deducted: credits,
      p_details: params.details ?? {},
    });

    if (!rpcError) {
      return;
    }

    // Fallback if migration 016 function hasn't been created yet
    await supabase.from("developer_api_key_usage").insert({
      api_key_id: params.apiKeyId,
      user_id: params.userId,
      endpoint: params.endpoint,
      method: params.method.toUpperCase(),
      status_code: params.statusCode,
      credits_deducted: credits,
      details: params.details ?? {},
    });

    const { data: currentKey } = await supabase
      .from("developer_api_keys")
      .select("total_credits_used, total_requests")
      .eq("id", params.apiKeyId)
      .maybeSingle();

    const newCredits = Number(currentKey?.total_credits_used ?? 0) + credits;
    const newRequests = Number(currentKey?.total_requests ?? 0) + 1;

    await supabase
      .from("developer_api_keys")
      .update({
        total_credits_used: newCredits,
        total_requests: newRequests,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", params.apiKeyId);
  } catch (err: unknown) {
    logger.warn({ err, apiKeyId: params.apiKeyId }, "Failed to record developer API key usage");
  }
}

export async function getDeveloperKeyDetails(
  userId: string,
  keyId: string
): Promise<DeveloperApiKeyDetails | null> {
  const { data: keyData, error: keyError } = await supabase
    .from("developer_api_keys")
    .select(META_SELECT)
    .eq("id", keyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (keyError || !keyData) {
    if (keyError) {
      logger.error({ error: keyError, userId, keyId }, "Failed to get developer API key details");
    }
    return null;
  }

  const { data: logsData, error: logsError } = await supabase
    .from("developer_api_key_usage")
    .select("id, api_key_id, endpoint, method, status_code, credits_deducted, details, created_at")
    .eq("api_key_id", keyId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (logsError) {
    logger.warn({ error: logsError, keyId }, "Failed to fetch developer key usage logs");
  }

  const recentLogs: DeveloperApiKeyUsageLog[] = (logsData || []).map((row) => {
    return {
      id: row.id,
      apiKeyId: row.api_key_id,
      endpoint: row.endpoint,
      method: row.method,
      statusCode: row.status_code,
      creditsDeducted: Number(row.credits_deducted ?? 0),
      details: (row.details as Record<string, unknown>) || {},
      createdAt: row.created_at,
    };
  });

  const summary = recentLogs.reduce(
    (acc, log) => {
      const is3d = log.endpoint.startsWith("/v1/3d");
      const is2d = log.endpoint.startsWith("/v1/images");

      const existingEndpoint = acc.endpointCounts[log.endpoint] || { requests: 0, credits: 0 };
      const updatedEndpoint = {
        requests: existingEndpoint.requests + 1,
        credits: existingEndpoint.credits + log.creditsDeducted,
      };

      return {
        totalCreditsUsed: acc.totalCreditsUsed,
        totalRequests: acc.totalRequests,
        credits3d: is3d ? acc.credits3d + log.creditsDeducted : acc.credits3d,
        credits2d: is2d ? acc.credits2d + log.creditsDeducted : acc.credits2d,
        requests3d: is3d ? acc.requests3d + 1 : acc.requests3d,
        requests2d: is2d ? acc.requests2d + 1 : acc.requests2d,
        endpointCounts: {
          ...acc.endpointCounts,
          [log.endpoint]: updatedEndpoint,
        },
      };
    },
    {
      totalCreditsUsed: Number(keyData.total_credits_used ?? 0),
      totalRequests: Number(keyData.total_requests ?? 0),
      credits3d: 0,
      credits2d: 0,
      requests3d: 0,
      requests2d: 0,
      endpointCounts: {} as Record<string, { requests: number; credits: number }>,
    }
  );

  return {
    key: mapMeta(keyData),
    summary,
    recentLogs,
  };
}
