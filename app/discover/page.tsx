import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { COMMUNITY_TAGS, type FeedSort } from "@/lib/community";
import { getFeedPage } from "@/lib/community-server";
import { DiscoverView } from "@/components/community/DiscoverView";

export const metadata: Metadata = createPageMetadata({
  title: "Community: 3D models made with Hydrilla",
  description:
    "Explore 3D models created with Hydrilla and shared by artists, game developers and designers. Inspect every model in 3D.",
  ogTitle: "Hydrilla Community",
  path: "/discover",
  noMarkdown: true,
});

const PUBLIC_SORTS: FeedSort[] = ["trending", "newest", "featured"];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tag?: string }>;
}) {
  const { sort: rawSort, tag: rawTag } = await searchParams;
  const sort: FeedSort =
    rawSort === "following" ? "following" : PUBLIC_SORTS.includes(rawSort as FeedSort) ? (rawSort as FeedSort) : "trending";
  const tag = COMMUNITY_TAGS.some((t) => t.id === rawTag) ? (rawTag as string) : null;
  // "Following" depends on who is viewing, so it always loads on the client.
  const initial = sort === "following" ? null : await getFeedPage(sort, tag);

  return <DiscoverView initial={initial} initialSort={sort} initialTag={tag} />;
}
