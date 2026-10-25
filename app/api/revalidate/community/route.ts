import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** Called by the backend (src/lib/communityRevalidate.ts) after community mutations. */
export async function POST(req: NextRequest) {
  const secret = process.env.COMMUNITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body = (await req.json()) as { tags?: string[] };
    tags = Array.isArray(body.tags) ? body.tags : [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const accepted = tags.filter((tag) => typeof tag === "string" && tag.startsWith("community:")).slice(0, 50);
  for (const tag of accepted) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags: accepted });
}
