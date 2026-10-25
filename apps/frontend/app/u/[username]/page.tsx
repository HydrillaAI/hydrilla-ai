import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { profilePath } from "@/lib/community";
import { getProfile, getProfilePosts } from "@/lib/community-server";
import { CommunityShell } from "@/components/community/CommunityShell";
import { ProfileView } from "@/components/community/ProfileView";

/** Served at /@username through the rewrite in next.config.js. */
type Props = { params: Promise<{ username: string }> };

async function resolve(params: Props["params"]) {
  const raw = decodeURIComponent((await params).username);
  const username = raw.toLowerCase();
  return { raw, username, result: await getProfile(username) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { result } = await resolve(params);
  if (!result || "redirectTo" in result) return { title: "Profile not found", robots: { index: false, follow: false } };
  const { profile } = result;
  return createPageMetadata({
    title: `${profile.displayName} (@${profile.username})`,
    description:
      profile.bio?.slice(0, 155) ||
      `3D models by ${profile.displayName} on Hydrilla. ${profile.postsCount} published ${profile.postsCount === 1 ? "model" : "models"}.`,
    path: profilePath(profile.username),
    ogImage: profile.bannerUrl ?? profile.avatarUrl ?? undefined,
    noMarkdown: true,
    // Empty profiles add nothing to search; index once they publish.
    noIndex: profile.postsCount === 0,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { raw, username, result } = await resolve(params);
  if (!result) notFound();
  if ("redirectTo" in result) permanentRedirect(profilePath(result.redirectTo));
  if (raw !== username) permanentRedirect(profilePath(username));
  const posts = await getProfilePosts(username);
  return (
    <CommunityShell>
      <ProfileView profile={result.profile} initialPosts={posts} />
    </CommunityShell>
  );
}
