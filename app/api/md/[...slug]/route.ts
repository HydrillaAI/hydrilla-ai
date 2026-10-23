import { NextResponse } from "next/server";
import { markdownFor } from "@/lib/markdown";
import { API_SPECS, GUIDE_PAGE_META } from "@/lib/docsData";

export const dynamic = "force-static";

export function generateStaticParams() {
  const guides = Object.keys(GUIDE_PAGE_META).map((href) => ({ slug: [href.replace(/^\//, "")] }));
  const endpoints = Object.keys(API_SPECS).map((endpoint) => ({ slug: ["api", endpoint] }));
  return [...guides, ...endpoints];
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const joined = (slug ?? []).join("/").replace(/\.md$/, "");
  const markdown = markdownFor(joined);
  if (!markdown) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
