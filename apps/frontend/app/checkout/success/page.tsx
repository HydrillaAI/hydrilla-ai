"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { PickleActions } from "@/components/layout/PicklePage";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app").replace(/\/+$/, "");

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-black animate-spin" />
    </div>
  );
}

function CheckoutSuccessContent() {
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "checking" | "active" | "pending" | "error"
  >("checking");
  const activatedTracked = useRef(false);

  // Dodo returns different params depending on payment type:
  //   subscription: ?subscription_id=sub_xxx&status=active&email=...
  //   one-time:     ?payment_id=pay_xxx
  const paymentId = searchParams.get("payment_id");
  const subscriptionIdFromUrl = searchParams.get("subscription_id");
  const statusFromUrl = searchParams.get("status"); // "active" when Dodo confirms

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setSubscriptionStatus("pending");
      return;
    }

    runSyncThenCheck();
    // Poll for up to 30s so we pick up webhook/sync when it lands
    const interval = setInterval(runSyncThenCheck, 2000);
    const stop = setTimeout(() => clearInterval(interval), 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, paymentId, subscriptionIdFromUrl]);

  async function runSyncThenCheck() {
    // Once active, stop re-posting /sync. Polling used to hit activation (and T04) repeatedly.
    if (activatedTracked.current) {
      return;
    }
    setSubscriptionStatus((prev) => (prev === "active" ? prev : "checking"));
    try {
      const token = await getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // Always call sync when we have any identifier from Dodo (payment_id or subscription_id)
      if (paymentId || subscriptionIdFromUrl) {
        try {
          const syncBody: Record<string, string> = {};
          if (paymentId) syncBody.payment_id = paymentId;
          if (subscriptionIdFromUrl) syncBody.subscription_id = subscriptionIdFromUrl;

          const syncRes = await fetch(`${BACKEND_URL}/api/payments/sync`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(syncBody),
          });
          const syncJson = await syncRes.json().catch(() => ({}));
          if (syncRes.status === 403 || syncJson.granted === false) {
            setSubscriptionStatus("pending");
            return;
          }
        } catch {
          // A network error does not grant credits. The status check below only reads this account.
        }
      }

      const [subRes, credRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/subscription`, { headers }),
        fetch(`${BACKEND_URL}/api/payments/credits`, { headers }),
      ]);

      let hasActiveSubscription = false;
      if (subRes.ok) {
        const r = await subRes.json();
        hasActiveSubscription = !!(r.subscription && (r.subscription.status === "active" || r.subscription.status === "on_hold"));
      }
      let hasCredits = false;
      if (credRes.ok) {
        const cred = await credRes.json();
        // Only count as "paid credits" when the plan is set (not free tier)
        hasCredits = !!(cred.credits && cred.credits.plan && cred.credits.total > 0);
      }

      setSubscriptionStatus((prev) => {
        if (prev === "active") return prev;
        const next = hasActiveSubscription || hasCredits ? "active" : "pending";
        if (next === "active" && !activatedTracked.current) {
          activatedTracked.current = true;
          track("subscription_activated", {
            source: "checkout_success",
            has_subscription_id: !!subscriptionIdFromUrl,
            has_payment_id: !!paymentId,
          });
        }
        return next;
      });
    } catch {
      setSubscriptionStatus("pending");
    }
  }

  async function checkSubscription() {
    await runSyncThenCheck();
  }

  // Auto-redirect after success
  useEffect(() => {
    if (subscriptionStatus === "active") {
      const t = setTimeout(() => router.push("/app/studio"), 3500);
      return () => clearTimeout(t);
    }
  }, [subscriptionStatus, router]);

  const referenceId = paymentId
    ? `Payment ID: ${paymentId}`
    : subscriptionIdFromUrl
      ? `Subscription ID: ${subscriptionIdFromUrl}`
      : null;

  return (
    <article className="pickle-article">
      <header className="pickle-article-header">
        <p className="pickle-article-kicker">Checkout</p>
        {subscriptionStatus === "checking" ? (
          <>
            <h1 className="pickle-article-title">Verifying your subscription</h1>
            <div className="pickle-lead">
              <p>This takes just a moment.</p>
            </div>
            <div
              role="status"
              aria-label="Verifying"
              className="mt-4 h-9 w-9 animate-spin rounded-full border-[3px] border-black/10 border-t-black"
            />
          </>
        ) : subscriptionStatus === "active" ? (
          <>
            <h1 className="pickle-article-title">You&apos;re all set</h1>
            <div className="pickle-lead">
              <p>Your subscription is active and your credits have been added. Redirecting you to Studio…</p>
            </div>
            {referenceId && <p className="pickle-caption">{referenceId}</p>}
            <PickleActions primary={{ label: "Go to Studio", href: "/app/studio" }} />
          </>
        ) : (
          <>
            <h1 className="pickle-article-title">We couldn&apos;t confirm this payment</h1>
            <div className="pickle-lead">
              <p>
                Credits are added only after Dodo confirms the payment for this account. If you just paid, wait a moment and check again.
              </p>
            </div>
            {referenceId && <p className="pickle-caption">{referenceId}</p>}
            <div className="pickle-actions">
              <button type="button" onClick={checkSubscription} className="pickle-pill-solid">
                Check Again
              </button>
              <Link href="/app/studio" className="pickle-pill-ghost">
                Go to Studio Anyway
              </Link>
            </div>
          </>
        )}
      </header>
    </article>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
