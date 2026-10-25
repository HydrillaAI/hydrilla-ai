import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { getPost } from "@/lib/community-server";
import { CommunityShell } from "@/components/community/CommunityShell";
import { PostView } from "@/components/community/PostView";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Post not found", robots: { index: false, follow: false } };
  return createPageMetadata({
    title: `${post.title} by @${post.author.username}`,
    description:
      post.description.slice(0, 155) ||
      `${post.title}: a 3D model by ${post.author.displayName}, made with Hydrilla. Open it to inspect in 3D.`,
    path: `/posts/${post.id}`,
    ogImage: post.coverImageUrl ?? undefined,
    noMarkdown: true,
  });
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return (
    <CommunityShell>
      <main className="mx-auto max-w-[1600px] px-2 py-3 sm:px-4 lg:py-4">
        <PostView post={post} />
      </main>
    </CommunityShell>
  );
}
