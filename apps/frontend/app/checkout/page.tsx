"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { track, trackCheckoutStarted, trackPaymentFailed } from "@/lib/analytics";
import {
  checkoutHref,
  parseCheckoutPlanParam,
  planPriceLabel,
  PRICING,
  SLOT_PRICING,
  type CheckoutPlanId,
} from "@/lib/pricing";

// Ensure we never point at the frontend; use production API when env is wrong or unset
const ENV_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const BACKEND_URL =
  ENV_BACKEND && !ENV_BACKEND.includes("hydrilla.co/checkout") && !ENV_BACKEND.includes("hydrilla.ai/checkout")
    ? ENV_BACKEND.replace(/\/+$/, "")
    : "https://hydrilla-backend.vercel.app";

const checkoutStartLock: { planId: string | null } = { planId: null };

const PLAN_INFO: Record<
  CheckoutPlanId,
  { label: string; credits: string }
> = {
  starter: {
    label: PRICING.starter.label,
    credits: PRICING.starter.creditsLabel,
  },
  pro: {
    label: PRICING.pro.label,
    credits: PRICING.pro.creditsLabel,
  },
  slot: {
    label: SLOT_PRICING.slot.label,
    credits: SLOT_PRICING.slot.summary,
  },
  slot_pro: {
    label: SLOT_PRICING.slot_pro.label,
    credits: SLOT_PRICING.slot_pro.summary,
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const { user } = useUser();

  const planParam = searchParams.get("plan") || "";
  const plan: CheckoutPlanId | null = parseCheckoutPlanParam(planParam);
  const planInfo = plan ? PLAN_INFO[plan] : null;
  const priceLabel = plan ? planPriceLabel(plan) : null;

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [trialEligible, setTrialEligible] = useState<boolean | null>(null);

  const userEmail =
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.primaryEmailAddress?.emailAddress ||
    null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${BACKEND_URL}/api/payments/trial-eligibility`, { headers });
        if (!cancelled && res.ok) {
          const json = await res.json();
          setTrialEligible(Boolean(json.eligible));
        } else if (!cancelled) {
          setTrialEligible(false);
        }
      } catch {
        if (!cancelled) setTrialEligible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const redirect = encodeURIComponent(
        checkoutHref(plan ?? "starter")
      );
      router.push(`/sign-in?redirect_url=${redirect}`);
      return;
    }

    if (!planInfo || !plan) {
      setError(`Unknown plan: "${planParam}". Please go back and choose a valid plan.`);
      setStatus("error");
      return;
    }

    if (!userEmail) {
      setError("Could not get your email address. Please try signing in again.");
      setStatus("error");
      return;
    }

    // Auto-start checkout as soon as we have everything
    if (status === "idle") {
      startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userEmail, plan]);

  async function startCheckout() {
    const planId = plan ?? planParam;
    if (checkoutStartLock.planId === planId) {
      return;
    }
    checkoutStartLock.planId = planId;
    setStatus("loading");
    setError(null);
    track("checkout_initiated", { plan: planParam, billing: "monthly" });
    trackCheckoutStarted(planId);

    const url = `${BACKEND_URL}/api/payments/create-checkout`;
    try {
      const token = await getToken();
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: plan ?? planParam, email: userEmail }),
      });

      let data: { error?: string; checkoutUrl?: string; applyTrial?: boolean };
      try {
        data = await response.json();
      } catch {
        throw new Error(response.ok ? "Invalid response from server" : `Server error (${response.status}). Try again.`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (typeof data.applyTrial === "boolean") {
        setTrialEligible(data.applyTrial);
      }

      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned from server");
      }

      // Redirect to Dodo Payments hosted checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      const msg = err?.message || "";
      const isNetworkError = msg === "Failed to fetch" || msg === "Load failed" || msg === "NetworkError when attempting to fetch resource";
      track("checkout_error", {
        plan: planParam,
        billing: "monthly",
        error_type: isNetworkError ? "network" : "server",
      });
      checkoutStartLock.planId = null;
      trackPaymentFailed(plan ?? planParam, isNetworkError ? "network" : "server");
      setError(
        isNetworkError
          ? "Could not reach the payment server. Check your connection and try again, or contact support if it persists."
          : msg || "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  }

  return (
    <article className="pickle-article">
      <header className="pickle-article-header">
        <p className="pickle-article-kicker">Checkout</p>
        {planInfo && <span className="pickle-chip">{planInfo.label} Plan</span>}
        {status === "error" ? (
          <>
            <h1 className="pickle-article-title">Something went wrong</h1>
            <div className="pickle-lead">
              <p>{error}</p>
            </div>
            <div className="pickle-actions">
              <button type="button" onClick={startCheckout} className="pickle-pill-solid">
                Try Again
              </button>
              <button type="button" onClick={() => router.back()} className="pickle-pill-ghost">
                Go Back
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="pickle-article-title">
              {status === "loading" ? "Opening Checkout…" : "Preparing your checkout"}
            </h1>
            {planInfo && priceLabel && (
              <div className="pickle-lead">
                <p>
                  {planInfo.label} · {priceLabel}
                </p>
                <p>{planInfo.credits}</p>
              </div>
            )}

            {trialEligible === true ? (
              <div className="pickle-form-panel" style={{ maxWidth: 480, padding: "24px 28px", gap: 8 }}>
                <div className="flex w-full items-center justify-between gap-4 font-medium">
                  <span>14-Day Free Trial</span>
                  <span>$0.00 today</span>
                </div>
                <p className="pickle-card-body">
                  Full plan access for 14 days. Cancel anytime before the trial ends without being charged.
                </p>
              </div>
            ) : trialEligible === false ? (
              <div className="pickle-form-panel" style={{ maxWidth: 480, padding: "24px 28px", gap: 8 }}>
                <div className="flex w-full items-center justify-between gap-4 font-medium">
                  <span>Monthly Subscription</span>
                  <span>{priceLabel}</span>
                </div>
                <p className="pickle-card-body">Billed monthly. Cancel anytime in your billing settings.</p>
              </div>
            ) : null}

            <div
              role="status"
              aria-label="Loading"
              className="mt-2 h-9 w-9 animate-spin rounded-full border-[3px] border-black/10 border-t-black"
            />
            <p className="pickle-caption">
              {trialEligible === true
                ? "You will continue to Dodo Payments to start your 14-day trial."
                : trialEligible === false
                ? "You will continue to Dodo Payments to complete your subscription."
                : "Preparing checkout with Dodo Payments…"}
            </p>
          </>
        )}
      </header>
    </article>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-black animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
