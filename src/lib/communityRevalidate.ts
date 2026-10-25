import { logger } from "../logger.js";

/** Cache tags used by the frontend's community fetchers (lib/community-server.ts). */
export const communityTags = {
  feed: "community:feed",
  post: (id: string) => `community:post:${id}`,
  user: (username: string) => `community:user:${username.toLowerCase()}`,
};

/**
 * Ask the Next.js frontend to drop cached community pages. Fire-and-forget:
 * public pages also revalidate on a short timer, so a failed call only delays freshness.
 */
export async function revalidateCommunityFrontend(tags: string[]): Promise<void> {
  const secret = process.env.COMMUNITY_REVALIDATE_SECRET;
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).replace(/\/+$/, "");

  if (!secret || !frontendUrl || tags.length === 0) {
    logger.debug("Community revalidation skipped (missing COMMUNITY_REVALIDATE_SECRET or FRONTEND_URL)");
    return;
  }

  try {
    const res = await fetch(`${frontendUrl}/api/revalidate/community`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ tags: [...new Set(tags)] }),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, "Community revalidation request failed");
    }
  } catch (err) {
    logger.warn({ err }, "Community revalidation request error");
  }
}
