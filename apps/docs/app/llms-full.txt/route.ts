import { allMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";

export function GET() {
  return new Response(allMarkdown(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
