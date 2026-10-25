"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  filterModelsByQuery,
  isPinnedModel,
  resolveEnabledModelIds,
  setModelEnabled,
} from "@/lib/waterModels";
import {
  deleteUserApiKey,
  fetchUserApiKeys,
  fetchWaterModels,
  getCredits,
  getCreditRewardsHistory,
  providerKeyAvailable,
  saveUserApiKey,
  saveUserModelPrefs,
  verifyUserApiKey,
  type ConnectorPublic,
  type CreditRewardRow,
  type CreditsInfo,
  type UserApiKeyMeta,
  type UserModelPrefs,
  type WaterModelGroup,
} from "@/lib/api";
import { FALLBACK_CONNECTORS } from "@/lib/connectors";
import { migrateCodeModelId, type ApiKeyProvider, type ModelId } from "@/lib/models";
import { checkoutHref, planDisplayLabel, PRICING, SLOT_PRICING, type CheckoutPlanId } from "@/lib/pricing";
import { SlotHours } from "@/components/app/SlotHours";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [keys, setKeys] = useState<UserApiKeyMeta[]>([]);
  const [sharedKeys, setSharedKeys] = useState<UserApiKeyMeta[]>([]);
  const [connectors, setConnectors] = useState<ConnectorPublic[]>([]);
  const [prefs, setPrefs] = useState<UserModelPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<"models" | "billing">(() =>
    searchParams.get("tab") === "billing" ? "billing" : "models",
  );

  useEffect(() => {
    if (searchParams.get("tab") === "billing") {
      setSection("billing");
    }
  }, [searchParams]);

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("section");
    if (asked === "billing") setSection("billing");
  }, []);

  const load = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const tokenGetter = async () => (await getToken()) ?? null;
      const data = await fetchUserApiKeys(tokenGetter);
      setKeys(data.keys);
      setSharedKeys(data.sharedKeys ?? []);
      setConnectors(data.connectors?.length ? data.connectors : FALLBACK_CONNECTORS);
      setPrefs(data.prefs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    void load();
  }, [isLoaded, isSignedIn]);

  const selectSection = (next: "models" | "billing") => {
    setSection(next);
    router.replace(next === "billing" ? "/app/settings?section=billing" : "/app/settings", { scroll: false });
  };

  return (
    <div className="app-content-page font-dm-sans bg-[var(--app-canvas)]">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-400">Account</p>
            <h1 className="mt-2 text-neutral-900">Settings</h1>
            <p className="mt-2.5 text-[15px] text-neutral-500">
              {section === "billing" ? "Your plan, payments and credit grants." : "Provider keys and the models Water can use."}
            </p>
          </div>
          <div role="tablist" aria-label="Settings sections" className="inline-flex self-start rounded-full bg-neutral-100 p-1 sm:self-auto">
            {([
              ["models", "Models & keys"],
              ["billing", "Billing"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={section === id}
                onClick={() => selectSection(id)}
                className={cn(
                  "h-9 rounded-full px-4 text-[13px] font-semibold transition-colors",
                  section === id
                    ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-10 flex flex-col">
          {section === "billing" ? (
            <BillingSection />
          ) : (
            <>
              {error && <ErrorBanner message={error} />}
              {loading ? (
                <div className="app-panel flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading settings…
                </div>
              ) : (
                <>
                  <SettingsSection
                    first
                    title="Provider keys"
                    description="Bring your own keys for Water. Only the last four characters are ever shown again."
                  >
                    <div className="app-panel divide-y divide-neutral-200/70 overflow-hidden">
                      {(connectors.length ? connectors : FALLBACK_CONNECTORS).map((p) => (
                        <ApiKeyCard
                          key={p.id}
                          connector={p}
                          meta={keys.find((k) => (k.provider === "gemini" ? "google" : k.provider) === p.id)}
                          shared={sharedKeys.find((k) => (k.provider === "gemini" ? "google" : k.provider) === p.id)}
                          onChanged={load}
                        />
                      ))}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Models" description="Choose which models show up in the Water engine picker.">
                    <WaterModelSlots
                      keys={keys}
                      sharedKeys={sharedKeys}
                      connectors={connectors.length ? connectors : FALLBACK_CONNECTORS}
                      defaultCodeModel={(migrateCodeModelId(prefs?.defaultCodeModel) as ModelId) || null}
                      serverEnabled={prefs?.enabledCodeModels}
                      onDefaultSaved={async (id) => {
                        const tokenGetter = async () => (await getToken()) ?? null;
                        const next = await saveUserModelPrefs(
                          { defaultCodeModel: migrateCodeModelId(id) || id },
                          tokenGetter
                        );
                        setPrefs(next);
                      }}
                      onEnabledSaved={async (ids) => {
                        const tokenGetter = async () => (await getToken()) ?? null;
                        try {
                          const next = await saveUserModelPrefs({ enabledCodeModels: ids }, tokenGetter);
                          setPrefs(next);
                        } catch {
                          // localStorage already updated; SQL 008 may not be applied yet
                        }
                      }}
                    />
                  </SettingsSection>

                  <SettingsSection title="Limits & credits" description="What each engine costs and where its limits come from.">
                    <LimitsCard />
                  </SettingsSection>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Settings row: heading + description on the left, content on the right (stacked on phones). */
function SettingsSection({
  title,
  description,
  children,
  first = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={cn(
        "grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12",
        !first && "mt-10 border-t border-neutral-200/70 pt-10"
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[19px] leading-tight text-neutral-900">{title}</h2>
        {description && <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-500">{description}</p>}
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-8 flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

const TH = "border-b border-neutral-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400";
const TD = "border-b border-neutral-200/60 px-4 py-3 align-middle text-[13px] text-neutral-700";
const TABLE = "w-full min-w-[520px] table-fixed border-separate border-spacing-0 text-left [&_tbody_tr:last-child_td]:border-b-0";

function Pill({ tone, children }: { tone: "green" | "red" | "amber" | "neutral" | "sky"; children: React.ReactNode }) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
    neutral: "bg-neutral-200/70 text-neutral-600",
    sky: "bg-[var(--hyd-100)] text-neutral-800",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app").replace(/\/+$/, "");

type BillingPayment = {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  plan: string | null;
  paymentId: string;
};

function receiptPlan(plan: string | null): string {
  if (plan === "starter") return "Starter";
  if (plan === "pro") return "Pro";
  if (plan === "slot" || plan === "hourly") return "Hourly";
  if (plan === "slot_pro" || plan === "hourly_pro") return "Hourly Pro";
  if (plan === "creator") return "Starter";
  if (plan === "studio") return "Pro";
  return "Subscription";
}

function receiptStatus(status: string): string {
  if (status === "succeeded") return "Paid";
  if (status === "failed") return "Failed";
  if (status === "refunded") return "Refunded";
  return status;
}

function formatCharge(amount: number, currency: string): string {
  const code = (currency || "USD").toUpperCase();
  const major = amount / 100;
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: code }).format(major);
  } catch {
    return `${major.toFixed(2)} ${code}`;
  }
}

function rewardSourceLabel(source: string): string {
  if (source === "claim_link") {
    return "Reward link";
  }
  if (source === "admin_grant") {
    return "Bonus";
  }
  return "System";
}

type CompactPlanOption = {
  id: CheckoutPlanId;
  name: string;
  priceLabel: string;
  description: string;
  cta: string;
  href: string;
};

function resolveCanonicalPlan(plan: string | null): "free" | CheckoutPlanId {
  const raw = (plan ?? "").toLowerCase();
  if (raw === "starter" || raw === "creator") {
    return "starter";
  }
  if (raw === "pro" || raw === "studio") {
    return "pro";
  }
  if (raw === "slot") {
    return "slot";
  }
  if (raw === "slot_pro" || raw === "slot-pro") {
    return "slot_pro";
  }
  return "free";
}

function getCurrentPlanDetails(canonical: "free" | CheckoutPlanId): {
  name: string;
  priceLabel: string;
  description: string;
  quotaTitle: string;
} {
  switch (canonical) {
    case "starter":
      return {
        name: PRICING.starter.label,
        priceLabel: `$${PRICING.starter.monthly} /mo.`,
        description:
          "30 model generations each month (900 credits), premium plugins included, and 24/7 generation.",
        quotaTitle: "30 Model Generations · 900 Credits",
      };
    case "pro":
      return {
        name: PRICING.pro.label,
        priceLabel: `$${PRICING.pro.monthly} /mo.`,
        description:
          "100 model generations per month (3,000 credits), full plugin suite, and priority studio access.",
        quotaTitle: "100 Model Generations · 3,000 Credits",
      };
    case "slot":
      return {
        name: SLOT_PRICING.slot.label,
        priceLabel: `$${SLOT_PRICING.slot.monthly} /mo.`,
        description:
          "30 model generations each month (900 credits) and premium plugins with a 1-hour daily generation window.",
        quotaTitle: "30 Models · 1h Daily Window",
      };
    case "slot_pro":
      return {
        name: SLOT_PRICING.slot_pro.label,
        priceLabel: `$${SLOT_PRICING.slot_pro.monthly} /mo.`,
        description:
          "100 model generations per month (3,000 credits) and full plugin suite with a 2-hour daily generation window.",
        quotaTitle: "100 Models · 2h Daily Window",
      };
    default:
      return {
        name: PRICING.free.label,
        priceLabel: `$${PRICING.free.monthly} /mo.`,
        description:
          "Free access with 100 monthly credits (3 model generations) for exploring image and 3D generation.",
        quotaTitle: "100 Monthly Credits Included",
      };
  }
}

function getUpgradeOptions(canonical: "free" | CheckoutPlanId): CompactPlanOption[] {
  const proCard: CompactPlanOption = {
    id: "pro",
    name: PRICING.pro.label,
    priceLabel: `$${PRICING.pro.monthly} /mo.`,
    description:
      "100 model generations per month (3,000 credits), full plugin suite, and 14-day free trial.",
    cta: "Upgrade to Pro",
    href: checkoutHref("pro"),
  };
  const starterCard: CompactPlanOption = {
    id: "starter",
    name: PRICING.starter.label,
    priceLabel: `$${PRICING.starter.monthly} /mo.`,
    description:
      "30 model generations each month (900 credits), premium plugins included, and 14-day free trial.",
    cta: canonical === "pro" || canonical === "slot_pro" ? "Switch to Starter" : "Upgrade to Starter",
    href: checkoutHref("starter"),
  };
  const slotProCard: CompactPlanOption = {
    id: "slot_pro",
    name: SLOT_PRICING.slot_pro.label,
    priceLabel: `$${SLOT_PRICING.slot_pro.monthly} /mo.`,
    description:
      "100 model generations per month, full plugin suite, and a 2-hour daily generation window.",
    cta: canonical === "pro" ? "Switch to Hourly Pro" : "Upgrade to Hourly Pro",
    href: checkoutHref("slot_pro"),
  };

  if (canonical === "starter") {
    return [proCard, slotProCard];
  }
  if (canonical === "slot") {
    return [starterCard, slotProCard];
  }
  if (canonical === "slot_pro") {
    return [proCard, starterCard];
  }
  if (canonical === "pro") {
    return [starterCard, slotProCard];
  }
  return [starterCard, proCard];
}

function BillingSection() {
  const { getToken, isSignedIn } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const [renewsAt, setRenewsAt] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [pastPlan, setPastPlan] = useState<string | null>(null);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [rewards, setRewards] = useState<CreditRewardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokenGetter = async () => (await getToken()) ?? null;
      const token = await tokenGetter();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const [billingRes, creditsInfo, rewardsHistory] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/billing`, { headers }),
        getCredits(tokenGetter),
        getCreditRewardsHistory(tokenGetter),
      ]);
      const body = await billingRes.json().catch(() => ({}));
      if (!billingRes.ok) {
        throw new Error(body.error || "Failed to load billing");
      }
      setPlan(body.plan ?? null);
      setRenewsAt(body.renewsAt ?? null);
      setCancelAtPeriodEnd(Boolean(body.cancelAtPeriodEnd));
      setAccessUntil(body.accessUntil ?? null);
      setIsTrial(Boolean(body.isTrial));
      setTrialEndsAt(body.trialEndsAt ?? null);
      setPastPlan(body.pastPlan ?? null);
      setPayments(Array.isArray(body.payments) ? body.payments : []);
      setCredits(creditsInfo);
      setRewards(rewardsHistory);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load billing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSignedIn]);

  const renewLabel = renewsAt
    ? new Date(renewsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;
  const accessLabel = accessUntil
    ? new Date(accessUntil).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : renewLabel;

  const cancelRenewal = async () => {
    if (!plan || cancelAtPeriodEnd || cancelling) {
      return;
    }
    const until = accessLabel ? ` You keep ${planDisplayLabel(plan)} until ${accessLabel}.` : "";
    const confirmMsg = isTrial
      ? `Cancel your 14-day free trial? You keep full access until ${accessLabel || "the trial ends"}, and you will not be charged.`
      : `Cancel renewal?${until} It will not charge again after that.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const token = await getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BACKEND_URL}/api/payments/cancel`, {
        method: "POST",
        headers,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to cancel renewal");
      }
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel renewal");
    } finally {
      setCancelling(false);
    }
  };

  const canonicalPlan = resolveCanonicalPlan(plan);
  const currentPlanMeta = getCurrentPlanDetails(canonicalPlan);
  const upgradeOptions = getUpgradeOptions(canonicalPlan);

  const planBadge = isTrial
    ? { tone: "amber" as const, label: cancelAtPeriodEnd ? "Trial ending" : "14-day free trial" }
    : plan && cancelAtPeriodEnd
      ? { tone: "amber" as const, label: "Ending" }
      : { tone: "sky" as const, label: "Current plan" };

  const planStatusText =
    isTrial && cancelAtPeriodEnd
      ? `Your free trial ends on ${accessLabel || "the end of the trial period"}. You won't be charged.`
      : isTrial
        ? `You're on a 14-day free trial. Billing of ${currentPlanMeta.priceLabel} starts ${renewLabel || "when the trial ends"}. Cancel anytime before then at no charge.`
        : plan && cancelAtPeriodEnd
          ? `You keep ${planDisplayLabel(plan)} until ${accessLabel || "the end of this period"}. It won't renew.`
          : !plan && pastPlan
            ? `Your previous ${planDisplayLabel(pastPlan)} plan ended. You're on the Free plan with 100 monthly credits.`
            : currentPlanMeta.description;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      {error && <ErrorBanner message={error} />}

      <SettingsSection first title="Current plan" description="What you're on today and when it renews.">
        {loading ? (
          <div className="app-panel space-y-3 p-6">
            <div className="studio-skeleton h-7 w-40 rounded-full" />
            <div className="studio-skeleton h-4 w-72 max-w-full rounded-full" />
          </div>
        ) : (
          <div className="app-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="community-display text-[26px] leading-tight text-neutral-900">{currentPlanMeta.name}</h3>
              <Pill tone={planBadge.tone}>{planBadge.label}</Pill>
              <span className="ml-auto text-[15px] font-semibold tabular-nums text-neutral-900">{currentPlanMeta.priceLabel}</span>
            </div>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">{planStatusText}</p>

            <div className="mt-5 flex flex-col gap-1 rounded-2xl bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-[14px] font-semibold text-neutral-900">{currentPlanMeta.quotaTitle}</p>
              <p className="text-[12px] text-neutral-500">
                {plan && !cancelAtPeriodEnd && renewLabel
                  ? `Renews ${renewLabel}`
                  : plan && cancelAtPeriodEnd && accessLabel
                    ? `Active until ${accessLabel}`
                    : "Resets monthly"}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/app/usage"
                className="inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
              >
                View usage
              </Link>
              {plan && !cancelAtPeriodEnd ? (
                <button
                  type="button"
                  onClick={() => void cancelRenewal()}
                  disabled={cancelling}
                  className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white px-5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-red-600 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling…" : isTrial ? "Cancel free trial" : "Cancel renewal"}
                </button>
              ) : !plan ? (
                <Link
                  href="/app/pricing"
                  className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white px-5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Compare plans
                </Link>
              ) : (
                <Pill tone="amber">Cancellation scheduled</Pill>
              )}
            </div>
          </div>
        )}
        <SlotHours getToken={getToken} active={plan === "slot" || plan === "slot_pro"} />
      </SettingsSection>

      {!loading && upgradeOptions.length > 0 && (
        <SettingsSection title="Change plan" description="More generations, plugins or a different daily window.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upgradeOptions.map((option) => (
              <div key={option.id} className="app-panel flex flex-col p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="community-display text-[19px] text-neutral-900">{option.name}</h3>
                  <span className="text-[13px] font-semibold tabular-nums text-neutral-500">{option.priceLabel}</span>
                </div>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-neutral-500">{option.description}</p>
                <Link
                  href={option.href}
                  className="mt-5 inline-flex h-9 items-center justify-center self-start rounded-full bg-neutral-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  {option.cta}
                </Link>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      <SettingsSection title="Payment history" description="Receipts for every charge on this account.">
        <div className="app-panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payments…
            </div>
          ) : payments.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">No payments on this account yet.</p>
          ) : (
            <div className="overflow-x-auto p-2 sm:p-3">
              <table className={TABLE}>
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[34%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th className={TH}>Date</th>
                    <th className={TH}>Plan</th>
                    <th className={TH}>Status</th>
                    <th className={cn(TH, "text-right")}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className={cn(TD, "whitespace-nowrap tabular-nums text-neutral-500")}>{fmtDate(payment.createdAt)}</td>
                      <td className={TD}>
                        <p className="font-medium text-neutral-900">{receiptPlan(payment.plan)}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-400" title={payment.paymentId}>
                          {payment.paymentId}
                        </p>
                      </td>
                      <td className={TD}>
                        <Pill tone={payment.status === "succeeded" ? "green" : payment.status === "failed" ? "red" : "amber"}>
                          {receiptStatus(payment.status)}
                        </Pill>
                      </td>
                      <td className={cn(TD, "text-right font-semibold tabular-nums text-neutral-900")}>
                        {formatCharge(payment.amount, payment.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Rewards & grants" description="Bonus credits from reward links and the Hydrilla team.">
        <div className="app-panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading rewards…
            </div>
          ) : rewards.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">No claimed rewards yet.</p>
          ) : (
            <div className="overflow-x-auto p-2 sm:p-3">
              <table className={TABLE}>
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[20%]" />
                  <col className="w-[36%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th className={TH}>Date</th>
                    <th className={TH}>Source</th>
                    <th className={TH}>Reason</th>
                    <th className={cn(TH, "text-right")}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr key={reward.id}>
                      <td className={cn(TD, "whitespace-nowrap tabular-nums text-neutral-500")}>{fmtDate(reward.createdAt)}</td>
                      <td className={cn(TD, "font-medium text-neutral-900")}>{rewardSourceLabel(reward.source)}</td>
                      <td className={cn(TD, "truncate text-neutral-600")} title={reward.reason || undefined}>
                        {reward.reason || "—"}
                      </td>
                      <td className={cn(TD, "text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400")}>
                        +{reward.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SettingsSection>
    </>
  );
}

function LimitsCard() {
  const rows = [
    ["Hydrilla cloud", "2–10 Hydrilla credits", "Your plan balance"],
    ["Water", "0 Hydrilla credits", "Your provider key"],
    ["OpenRouter free", "$0 · your key", "~50/day · ~20/min"],
  ];
  return (
    <div className="app-panel overflow-hidden">
      <div className="overflow-x-auto p-2 sm:p-3">
        <table className={TABLE}>
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[33%]" />
            <col className="w-[33%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={TH}>Engine</th>
              <th className={TH}>Cost</th>
              <th className={TH}>Limit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([engine, cost, limit]) => (
              <tr key={engine}>
                <td className={cn(TD, "font-medium text-neutral-900")}>{engine}</td>
                <td className={TD}>{cost}</td>
                <td className={TD}>{limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-neutral-200/70 px-5 py-4 text-[12px] leading-relaxed text-neutral-500">
        One Water build uses 2 provider requests (up to 4 if a quality gate retries). After a one-time $10 OpenRouter
        credit purchase, the free-model daily limit rises to ~1,000.
      </p>
    </div>
  );
}

function ApiKeyCard({
  connector,
  meta,
  shared,
  onChanged,
}: {
  connector: ConnectorPublic;
  meta?: UserApiKeyMeta;
  shared?: UserApiKeyMeta;
  onChanged: () => Promise<void>;
}) {
  const provider = connector.id as ApiKeyProvider;
  const placeholder = connector.keyPlaceholder;
  const docs = connector.docsUrl;
  const { getToken } = useAuth();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"save" | "verify" | "remove" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const status = meta?.status ?? "unchecked";
  const configured = Boolean(meta?.configured);
  const tokenGetter = async () => (await getToken()) ?? null;

  const handleSave = async () => {
    if (!value.trim()) return;
    setBusy("save");
    setLocalError(null);
    try {
      await saveUserApiKey(provider, value.trim(), tokenGetter);
      setValue("");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
      await onChanged();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const handleVerify = async () => {
    setBusy("verify");
    setLocalError(null);
    try {
      await verifyUserApiKey(provider, tokenGetter);
      await onChanged();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async () => {
    setBusy("remove");
    setLocalError(null);
    try {
      await deleteUserApiKey(provider, tokenGetter);
      await onChanged();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-neutral-900">
                {connector.name}
              </h3>
              {docs && (
                <a
                  href={docs}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-800"
                >
                  Get key
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {connector.product ? (
              <p className="mt-0.5 text-[12px] text-neutral-500">{connector.product}</p>
            ) : null}
            {!configured && shared?.configured && shared.status !== "invalid" ? (
              <p className="mt-1 text-[12px] text-neutral-500">Hydrilla key available until you add your own.</p>
            ) : null}
          </div>
          <StatusPill configured={configured} status={status} last4={meta?.last4} />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={configured ? `••••••••${meta?.last4 || ""}` : placeholder}
              className="h-10 rounded-full bg-white pl-4 pr-10"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
              }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              aria-label={show ? "Hide key" : "Show key"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!value.trim() || busy !== null}
            className="h-10 min-w-[76px] rounded-full px-5"
          >
            {busy === "save" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedFlash ? (
              <Check className="h-4 w-4" />
            ) : (
              "Save"
            )}
          </Button>
        </div>

        {(configured || localError || (meta?.lastError && status === "invalid")) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {configured && (
              <>
                <button
                  type="button"
                  onClick={() => void handleVerify()}
                  disabled={busy !== null}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                >
                  {busy === "verify" ? "Verifying…" : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={busy !== null}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {busy === "remove" ? "Removing…" : "Remove"}
                </button>
              </>
            )}
            {meta?.lastError && status === "invalid" && (
              <p className="w-full text-[11px] text-red-600 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                {meta.lastError}
              </p>
            )}
            {localError && <p className="w-full text-[11px] text-red-600">{localError}</p>}
          </div>
        )}
        {provider === "anthropic" && (
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Create a Console key at{" "}
            <a
              href="https://platform.claude.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-700 underline-offset-2 hover:underline"
            >
              platform.claude.com/settings/keys
            </a>
            , ensure billing/credits are active, then Save and Verify.
          </p>
        )}
    </div>
  );
}

function StatusPill({
  configured,
  status,
  last4,
}: {
  configured: boolean;
  status: string;
  last4?: string | null;
}) {
  if (!configured) return <Pill tone="neutral">Not set</Pill>;
  if (status === "valid") return <Pill tone="green">Valid{last4 ? ` · ${last4}` : ""}</Pill>;
  if (status === "invalid") return <Pill tone="red">Invalid</Pill>;
  return <Pill tone="amber">Unchecked</Pill>;
}

function WaterModelSlots({
  keys,
  sharedKeys,
  connectors,
  defaultCodeModel,
  serverEnabled,
  onDefaultSaved,
  onEnabledSaved,
}: {
  keys: UserApiKeyMeta[];
  sharedKeys: UserApiKeyMeta[];
  connectors: ConnectorPublic[];
  defaultCodeModel: ModelId | null;
  serverEnabled?: string[] | null;
  onDefaultSaved: (id: ModelId) => Promise<void>;
  onEnabledSaved: (ids: string[]) => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState<WaterModelGroup[]>([]);
  const [enabled, setEnabled] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [syncing, setSyncing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const keyFingerprint = [...keys, ...sharedKeys]
    .map((k) => `${k.provider}:${k.configured}:${k.status}`)
    .sort()
    .join("|");

  const loadModels = async () => {
    setSyncing(true);
    try {
      const data = await fetchWaterModels(async () => (await getToken()) ?? null);
      setGroups(data.groups);
      setEnabled(resolveEnabledModelIds(data.groups, serverEnabled));
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Could not load models");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyFingerprint]);

  const hasAccess = connectors.some((c) => providerKeyAvailable(c.id, keys, sharedKeys));

  if (!hasAccess && !groups.length && !syncing) {
    return (
      <div className="rounded-[24px] border border-dashed border-neutral-300 p-6 text-[14px] text-neutral-500">
        Save a provider key above and its models will show up here.
      </div>
    );
  }

  const toggle = (id: string, on: boolean) => {
    const next = setModelEnabled(id, on, enabled, groups);
    setEnabled(next);
    void onEnabledSaved(next);
    if (on && !defaultCodeModel) {
      void onDefaultSaved(id);
    }
    if (!on && defaultCodeModel === id) {
      const fallback = next[0];
      if (fallback) void onDefaultSaved(fallback);
    }
  };

  return (
    <div className="app-panel overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models"
            className="h-10 rounded-full border-neutral-200 bg-white pl-10 text-[14px]"
          />
        </div>
        <button
          type="button"
          onClick={() => void loadModels()}
          disabled={syncing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          aria-label="Refresh models"
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
        </button>
      </div>

      {loadError && <p className="mx-3 mb-3 rounded-2xl bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700">{loadError}</p>}

      <div className="max-h-[min(28rem,60vh)] overflow-y-auto">
        {groups.map((g) => {
          const models = filterModelsByQuery(g.models, query);
          if (!models.length) return null;
          return (
            <div key={g.provider}>
              <div className="sticky top-0 z-[1] bg-neutral-50 px-5 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                {g.name}
              </div>
              {models.map((m) => {
                const on = enabled.includes(m.id);
                const pinned = isPinnedModel(m.id, enabled, groups);
                return (
                  <div
                    key={m.id}
                    className="flex min-h-[52px] items-center justify-between gap-4 border-t border-neutral-200/60 px-5 py-2.5"
                  >
                    <span className="min-w-0 truncate text-[14px] font-medium text-neutral-900">{m.name}</span>
                    <Switch
                      checked={on}
                      disabled={pinned && on}
                      onCheckedChange={(next) => toggle(m.id, next)}
                      className="h-6 w-11 shrink-0 data-[state=checked]:bg-[var(--hyd-400)] data-[state=unchecked]:bg-neutral-300 [&>span]:h-5 [&>span]:w-5 [&>span]:bg-[#fff] data-[state=checked]:[&>span]:translate-x-5"
                      aria-label={`Show ${m.name} in Engine`}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
