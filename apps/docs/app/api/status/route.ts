import { NextResponse } from "next/server";

export const revalidate = 0;

type Status = "operational" | "degraded" | "capacity" | "unknown";

// TODO: point STATUS_URL at the real status provider and map its payload here.
const STATUS_URL = process.env.STATUS_URL || "";

function mapStatus(raw: string | undefined): Status {
  if (!raw) return "unknown";
  const value = raw.toLowerCase();
  if (["operational", "ok", "up", "normal"].includes(value)) return "operational";
  if (["degraded", "partial", "minor"].includes(value)) return "degraded";
  if (["capacity", "major", "outage", "down"].includes(value)) return "capacity";
  return "unknown";
}

export async function GET() {
  if (!STATUS_URL) {
    return NextResponse.json({ status: "operational", source: "stub" });
  }
  try {
    const res = await fetch(STATUS_URL, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ status: "unknown" });
    const data = (await res.json()) as { status?: string };
    return NextResponse.json({ status: mapStatus(data.status), source: "remote" });
  } catch {
    return NextResponse.json({ status: "unknown" });
  }
}
