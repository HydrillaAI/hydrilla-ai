import posthog from "posthog-js";

/**
 * Product analytics helpers.
 * Capture actions only — never send prompt text, image URLs, or PII beyond plan/ids.
 */
export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  try {
    if (typeof window === "undefined") {
      return;
    }
    posthog.capture(event, properties);
  } catch {
    /* analytics must never break product flows */
  }
}

/** Survives a full-page redirect (checkout handoff to the payment provider). */
export function trackBeforeLeave(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  try {
    if (typeof window === "undefined") {
      return;
    }
    posthog.capture(event, properties, { transport: "sendBeacon" });
  } catch {
    track(event, properties);
  }
}

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

function readFlag(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    /* private mode / blocked storage */
  }
}

/** Fire once per browser session or forever. Stops refresh and poll retries from duplicating the same action. */
export function trackOnce(
  scope: "session" | "local",
  key: string,
  event: string,
  properties?: AnalyticsProps
): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const storage = scope === "session" ? window.sessionStorage : window.localStorage;
  if (readFlag(storage, key)) {
    return false;
  }
  const loaded = Boolean((posthog as { __loaded?: boolean }).__loaded);
  if (!loaded) {
    return false;
  }
  writeFlag(storage, key, "1");
  track(event, properties);
  return true;
}

/** Marketing homepage. Once per browser session. */
export function trackLandingVisit(): void {
  trackOnce("session", "hyd_funnel_landing_visit", "landing_visit", { surface: "home" });
}

/**
 * Signup the first time we see a brand-new Clerk user.
 * Later visits in a new tab session record login once, not on every refresh.
 */
export function trackAuthFunnel(userId: string, createdAt: Date | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const send = (): void => {
    const isNewAccount = createdAt !== null && Date.now() - createdAt.getTime() < 10 * 60 * 1000;
    const loginKey = `hyd_funnel_login_v2:${userId}`;
    if (isNewAccount) {
      const signedUp = trackOnce("local", `hyd_funnel_signup_v2:${userId}`, "signup", { method: "clerk" });
      if (signedUp) {
        writeFlag(window.sessionStorage, loginKey, "1");
        return;
      }
    }
    trackOnce("session", loginKey, "login", { method: "clerk" });
  };
  queueMicrotask(send);
}

/** Workspace open. `first_workspace_entry` is once per user; later opens are `workspace_entered` once per id per session. */
export function trackWorkspaceEntry(userId: string | null, workspaceId: string): void {
  const who = userId || "anon";
  trackOnce("session", `hyd_funnel_ws:${who}:${workspaceId}`, "workspace_entered", {
    workspace_id: workspaceId,
  });
  if (!userId) {
    return;
  }
  trackOnce("local", `hyd_funnel_first_ws:${userId}`, "first_workspace_entry", {
    workspace_id: workspaceId,
  });
}

/** A generation the user actually started. The second and later starts also emit `generation_repeat`. */
export function trackGenerationStarted(kind: string, properties?: AnalyticsProps): void {
  if (typeof window === "undefined") {
    return;
  }
  const repeatKey = "hyd_funnel_has_generated";
  const repeat = readFlag(window.localStorage, repeatKey) === "1";
  track("generation_started", { kind, repeat, ...properties });
  if (repeat) {
    track("generation_repeat", { kind, ...properties });
  }
  writeFlag(window.localStorage, repeatKey, "1");
}

export function trackGenerationOutcome(
  outcome: "generation_succeeded" | "generation_failed" | "generation_cancelled",
  jobId: string | null | undefined,
  properties?: AnalyticsProps
): void {
  if (!jobId) {
    track(outcome, properties);
    return;
  }
  const fired = trackOnce("session", `hyd_funnel_${outcome}:${jobId}`, outcome, {
    job_id: jobId,
    ...properties,
  });
  if (outcome === "generation_succeeded" && fired) {
    trackOnce("session", `hyd_funnel_credits_consumed:${jobId}`, "credits_consumed", {
      job_id: jobId,
      source: "generation",
    });
  }
}

export function trackExportDownload(properties?: AnalyticsProps): void {
  track("export_download", properties);
}

export function trackCreditsViewed(remaining: number): void {
  trackOnce("session", "hyd_funnel_credits_viewed", "credits_viewed", { remaining });
}

export function trackCheckoutStarted(plan: string): void {
  trackBeforeLeave("checkout_started", { plan });
}

export function trackPaymentFailed(plan: string, errorType: string): void {
  trackOnce("session", `hyd_funnel_payment_failed:${plan}:${errorType}`, "payment_failed", {
    plan,
    error_type: errorType,
  });
}

export function trackPaymentSucceeded(paymentKey: string, properties?: AnalyticsProps): void {
  trackOnce("local", `hyd_funnel_payment_ok:${paymentKey}`, "payment_succeeded", properties);
}

/** True when an API error is an insufficient-credits / paywall response. */
export function isPaywallError(message: string | null | undefined): boolean {
  if (!message) {
    return false;
  }
  return /insufficient credits|subscribe or buy more credits/i.test(message);
}
