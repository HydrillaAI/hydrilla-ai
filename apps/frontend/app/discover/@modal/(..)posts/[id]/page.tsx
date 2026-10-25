import { notFound } from "next/navigation";
import { getPost } from "@/lib/community-server";
import { PostModal } from "@/components/community/PostModal";
import { PostView } from "@/components/community/PostView";

/** Soft navigation from the Discover grid to /posts/[id] lands here and overlays the feed. */
export default async function InterceptedPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return (
    <PostModal postId={post.id}>
      <PostView post={post} variant="modal" />
    </PostModal>
  );
}
