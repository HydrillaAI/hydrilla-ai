import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.HYDRILA_API_BASE || "https://api.hydrilla.co";

export async function POST(req: NextRequest) {
  let payload: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    body?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const method = (payload.method || "GET").toUpperCase();
  const path = payload.path || "";

  if (!path.startsWith("/") || path.includes("://")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(API_BASE + path);
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (target.origin !== new URL(API_BASE).origin) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }

  const started = Date.now();
  const forwardHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  const incomingAuth = payload.headers?.Authorization;
  if (incomingAuth) forwardHeaders.Authorization = incomingAuth;
  if (payload.body) forwardHeaders["Content-Type"] = "application/json";

  try {
    const upstream = await fetch(target.toString(), {
      method,
      headers: forwardHeaders,
      body: method === "GET" || method === "HEAD" ? undefined : payload.body,
      cache: "no-store",
    });
    const text = await upstream.text();
    return NextResponse.json({
      status: upstream.status,
      statusText: upstream.statusText,
      timeMs: Date.now() - started,
      body: text,
    });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
