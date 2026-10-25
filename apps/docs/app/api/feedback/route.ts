import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: { path?: unknown; helpful?: unknown; comment?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const helpful = typeof payload.helpful === "boolean" ? payload.helpful : null;
  if (helpful === null) {
    return NextResponse.json({ error: "helpful is required" }, { status: 400 });
  }

  const comment = typeof payload.comment === "string" ? payload.comment.slice(0, 2000) : "";
  const path = typeof payload.path === "string" ? payload.path.slice(0, 300) : "";

  // No PII is required or persisted here. Wire this to your feedback store.
  void path;
  void comment;

  return NextResponse.json({ ok: true });
}
