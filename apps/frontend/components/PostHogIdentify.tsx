"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { withPostHog } from "@/lib/posthog-browser";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app").replace(/\/+$/, "");

/**
 * Sends the browser's time zone to the backend once per browser session, so Customer.io can
 * send scheduled emails (the weekly recap) at a sensible local time. Best effort.
 */
async function syncEmailTimeZone(getToken: () => Promise<string | null>) {
  try {
    if (sessionStorage.getItem("hyd_email_tz_synced")) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const token = await getToken();
    if (!timezone || !token) return;
    const res = await fetch(`${BACKEND_URL}/api/user/email-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ timezone }),
    });
    if (res.ok) sessionStorage.setItem("hyd_email_tz_synced", "1");
  } catch {
    /* never affects the app */
  }
}

/**
 * Links Clerk users to PostHog so product events, session replay, and errors
 * share one person profile. Call identify after login; reset on logout.
 * See: https://posthog.com/docs/product-analytics/identify
 */
export function PostHogIdentify() {
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (isSignedIn && userId) {
      const email = user?.primaryEmailAddress?.emailAddress;
      const name = user?.fullName ?? undefined;
      withPostHog((posthog) => posthog.identify(userId, { email, name }));
      wasSignedIn.current = true;
      void syncEmailTimeZone(getToken);
      return;
    }

    if (wasSignedIn.current && !isSignedIn) {
      withPostHog((posthog) => posthog.reset());
      wasSignedIn.current = false;
    }
  }, [isSignedIn, userId, user, getToken]);

  return null;
}
