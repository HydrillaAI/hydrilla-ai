"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  CreditCard,
  Settings,
  Key,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  HelpCircle,
  Clock,
  Coins,
  X,
  UserRound,
} from "lucide-react";
import { useSlotStatus } from "../../hooks/useSlotStatus";
import { cn } from "../../lib/utils";
import { track } from "../../lib/analytics";
import { isPaidPlan, planDisplayLabel } from "../../lib/pricing";
import { useAppLayout } from "../../context/AppLayoutContext";
import { useSupport } from "@/context/SupportContext";

const RAW_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app";
const BACKEND_URL = RAW_BACKEND.replace(/\/+$/, "");

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; hideWhenPaid?: boolean };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Create",
    items: [
      { href: "/app/studio", label: "Studio", icon: LayoutDashboard },
      { href: "/app/assets", label: "Assets", icon: FolderOpen },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/app/profile", label: "Profile", icon: UserRound },
      { href: "/app/usage", label: "Usage", icon: BarChart3 },
      { href: "/app/api-keys", label: "API Keys", icon: Key },
      { href: "/app/settings", label: "Settings", icon: Settings },
      { href: "/app/pricing", label: "Pricing", icon: CreditCard, hideWhenPaid: true },
    ],
  },
];

type CreditsState = {
  used: number;
  total: number;
  remaining: number;
  plan: string | null;
  resetAt: string | null;
  loading: boolean;
};

const CREDITS_CACHE_KEY = "hyd.sidebar.credits.v1";

type CreditsSnapshot = { credits: Omit<CreditsState, "loading">; active: boolean };

function readCreditsCache(): CreditsSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CREDITS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CreditsSnapshot) : null;
  } catch {
    return null;
  }
}

function writeCreditsCache(snapshot: CreditsSnapshot) {
  try {
    sessionStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable: skip */
  }
}

function formatShortReset(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return null;
  }
}

function SlotCard({ collapsed }: { collapsed: boolean }) {
  const { getToken, isSignedIn } = useAuth();
  const { closeMobileSidebar } = useAppLayout();
  const slot = useSlotStatus(getToken, Boolean(isSignedIn), { tick: true });

  if (!slot.enrolled) {
    return null;
  }

  if (slot.needsHour) {
    if (collapsed) {
      return (
        <Link
          href="/app/settings?section=billing"
          prefetch
          onClick={closeMobileSidebar}
          title="Select your hour"
          aria-label="Select your hour"
          className="mx-auto mb-2 hidden h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white md:flex"
        >
          <Clock className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      );
    }
    return (
      <Link
        href="/app/settings?section=billing"
        prefetch
        onClick={closeMobileSidebar}
        className="mb-2 block credits-card rounded-xl p-3 font-dm-sans transition-colors"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
          <Clock className="h-2.5 w-2.5" strokeWidth={2.25} />
          Slot
        </span>
        <p className="mt-2.5 text-[15px] font-semibold tracking-[-0.02em] text-neutral-900">
          Select your hour
        </p>
        <p className="mt-1 text-[12px] leading-5 text-neutral-500">
          Choose the hour you can generate images and models.
        </p>
      </Link>
    );
  }

  const phrase = slot.open
    ? `${slot.remainingLabel} left in ${slot.label}`
    : `Opens in ${slot.remainingLabel}. Your hours are ${slot.label}.`;

  if (collapsed) {
    return (
      <div
        className="mx-auto mb-2 hidden h-10 w-10 items-center justify-center rounded-xl bg-[var(--hyd-50)] text-neutral-900 md:flex"
        title={phrase}
        role="status"
      >
        <Clock className="h-4 w-4" strokeWidth={1.75} />
      </div>
    );
  }

  return (
    <div className="credits-card mb-2 rounded-xl p-3 font-dm-sans">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--hyd-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-700">
          <Clock className="h-2.5 w-2.5 text-neutral-500" strokeWidth={2.25} />
          {slot.open ? "Open" : "Closed"}
        </span>
      </div>
      <p className="mt-2.5 text-[22px] leading-none font-semibold tracking-tight text-neutral-900 tabular-nums">
        {slot.remainingLabel}
      </p>
      <p className="mt-1 text-[12px] leading-5 text-neutral-500">
        {slot.open ? `left · ${slot.label}` : `until ${slot.label}`}
      </p>
    </div>
  );
}

/** Credits: one number, one bar, the reset date. Upgrade lives inside for free plans. */
function CreditsCard({
  credits,
  collapsed,
  showUpgrade,
}: {
  credits: CreditsState;
  collapsed: boolean;
  showUpgrade: boolean;
}) {
  const { closeMobileSidebar } = useAppLayout();
  const { total, remaining, plan, resetAt, loading } = credits;

  const hasTotal = total > 0;
  const left = hasTotal ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const isLow = !loading && hasTotal && left <= 0.15;
  const resetLabel = formatShortReset(resetAt);
  const planLabel = planDisplayLabel(plan);

  const onUpgrade = () => {
    track("upgrade_clicked", { source: "app_sidebar", collapsed });
    closeMobileSidebar();
  };

  if (collapsed) {
    return (
      <div className="hidden flex-col items-center gap-2 md:flex">
        <Link
          href="/app/usage"
          onClick={closeMobileSidebar}
          title={loading ? "Credits" : `${remaining.toLocaleString()} credits left`}
          aria-label="View credit usage"
          className="sidebar-toggle flex h-10 w-10 items-center justify-center rounded-full text-neutral-600"
        >
          <Coins className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </Link>
        {showUpgrade && (
          <Link
            href="/app/pricing"
            onClick={onUpgrade}
            title="Upgrade"
            aria-label="Upgrade"
            className="sidebar-upgrade-btn flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="credits-card rounded-xl p-3.5 font-dm-sans">
      <Link
        href="/app/usage"
        onClick={closeMobileSidebar}
        aria-label="View credit usage"
        className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--hyd-400)]"
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 truncate text-[13px] font-semibold tracking-[-0.01em] text-neutral-900">
            <span className="tabular-nums">{loading ? "—" : remaining.toLocaleString()}</span>
            <span className="ml-1 font-medium text-neutral-500">credits left</span>
          </p>
          {!loading && plan && (
            <span className="shrink-0 text-[11px] font-medium text-neutral-400">{planLabel}</span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Credits remaining"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={loading ? undefined : Math.round(left * 100)}
          className="credits-track mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
        >
          <div
            className={cn(
              "credits-bar h-full w-full rounded-full",
              isLow ? "bg-amber-500" : "credits-fill"
            )}
            style={{ transform: `scaleX(${loading ? 0 : left})` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-neutral-400 transition-colors group-hover:text-neutral-600">
          {resetLabel ? `Resets ${resetLabel}` : "View usage"}
        </p>
      </Link>
      {showUpgrade && (
        <Link
          href="/app/pricing"
          onClick={onUpgrade}
          className="sidebar-upgrade-btn mt-3 flex h-10 w-full items-center justify-center rounded-full bg-neutral-900 text-[13px] font-semibold text-white hover:bg-neutral-700"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [credits, setCredits] = useState<CreditsState>({
    used: 0,
    total: 0,
    remaining: 0,
    plan: null,
    resetAt: null,
    loading: true,
  });
  const { getToken, isSignedIn } = useAuth();
  const { mobileSidebarOpen, closeMobileSidebar } = useAppLayout();
  const { openSupport } = useSupport();

  // Paint last known balance immediately; the fetch below revalidates it.
  useEffect(() => {
    const cached = readCreditsCache();
    if (!cached) return;
    setCredits({ ...cached.credits, loading: false });
    setHasActiveSubscription(cached.active);
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setHasActiveSubscription(false);
      setCredits((prev) => ({ ...prev, loading: false }));
      return;
    }

    const state = { cancelled: false };
    void (async () => {
      try {
        const token = await getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [creditsRes, subRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/payments/credits`, { headers }),
          fetch(`${BACKEND_URL}/api/payments/subscription`, { headers }),
        ]);

        if (state.cancelled) {
          return;
        }

        const subJson = subRes.ok ? await subRes.json().catch(() => null) : null;
        const subscription = subJson?.subscription ?? null;
        const subPlan = subscription?.plan ?? null;
        const subActive =
          Boolean(subscription) &&
          (subscription.status === "active" ||
            subscription.status === "past_due" ||
            subscription.status === "on_hold");

        if (creditsRes.ok) {
          const { credits: c } = await creditsRes.json();
          const nextUsed = c?.used ?? 0;
          const nextTotal = c?.total ?? 0;
          const resolvedPlan = c?.plan || subPlan || null;
          const nextBonus = typeof c?.bonus === "number" ? c.bonus : 0;
          const nextCredits = {
            used: nextUsed,
            total: nextTotal,
            remaining:
              typeof c?.remaining === "number"
                ? c.remaining
                : Math.max(0, nextTotal - nextUsed) + Math.max(0, nextBonus),
            plan: resolvedPlan,
            resetAt: c?.resetAt ?? null,
          };
          const active = subActive || isPaidPlan(resolvedPlan);
          setCredits({ ...nextCredits, loading: false });
          setHasActiveSubscription(active);
          writeCreditsCache({ credits: nextCredits, active });
        } else {
          setHasActiveSubscription(subActive || isPaidPlan(subPlan));
          setCredits((prev) => ({ ...prev, plan: subPlan, loading: false }));
        }
      } catch {
        if (!state.cancelled) {
          setHasActiveSubscription(false);
          setCredits((prev) => ({ ...prev, loading: false }));
        }
      }
    })();

    return () => {
      state.cancelled = true;
    };
  }, [isSignedIn, getToken]);

  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !(i.hideWhenPaid && hasActiveSubscription)) }))
    .filter((g) => g.items.length > 0);

  // Off-canvas drawer: keep it out of the tab order and close on Escape.
  const asideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      el.inert = mq.matches && !mobileSidebarOpen;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileSidebar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  const sidebarFg = "hsl(var(--sidebar-fg))";
  const sidebarBorder = "hsl(var(--sidebar-border))";

  return (
    <>
      {/* Mobile backdrop – close on tap */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden transition-opacity duration-200"
        style={{ opacity: mobileSidebarOpen ? 1 : 0, pointerEvents: mobileSidebarOpen ? "auto" : "none" }}
        onClick={closeMobileSidebar}
      />

      <aside
        ref={asideRef}
        className={cn(
          "app-sidebar-root flex flex-col shrink-0 h-screen transition-[width,transform] duration-200 ease-out border-r",
          "max-md:fixed max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:z-50 max-md:w-[min(300px,86vw)] max-md:pb-[env(safe-area-inset-bottom)] max-md:translate-x-[-100%] max-md:shadow-xl",
          mobileSidebarOpen && "max-md:translate-x-0",
          "md:relative md:translate-x-0 md:shadow-none",
          !collapsed && "md:w-[232px]",
          collapsed && "md:w-[56px]"
        )}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          color: sidebarFg,
          borderColor: sidebarBorder,
        }}
      >
        {/* Logo row – mobile: logo + close (X); desktop: logo + collapse toggle */}
        <div
          className={cn(
            "flex items-center justify-between shrink-0 h-16 pl-5 pr-3 transition-[padding] duration-200",
            // Collapsed rail (56px) shows only the toggle; even padding keeps it centred.
            collapsed && "md:px-0"
          )}
        >
          <Link
            href="/app/studio"
            onClick={closeMobileSidebar}
            className={cn(
              "flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity",
              collapsed && "md:w-0 md:overflow-hidden md:min-w-0"
            )}
            aria-label="Hydrilla Studio"
            title="Studio"
          >
            {/*
              Same lockup as the site navbar: mark 32px, wordmark ¾ of it, 10px apart. The wordmark SVG
              reserves room for the "y" descender, so its capitals sit high in the box; 2px down centres
              them on the mark.
            */}
            <span className={cn("flex items-center gap-2.5", collapsed && "md:hidden")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hyd01-mark.png" width={140} height={132} alt="" aria-hidden className="block h-8 w-auto shrink-0 dark:brightness-0 dark:invert" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-hydrilla/hydsvgblack.svg" alt="Hydrilla" className="block h-6 w-auto translate-y-[2px] dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-hydrilla/hydsvg.svg" alt="" aria-hidden className="hidden h-6 w-auto translate-y-[2px] dark:block" />
            </span>
          </Link>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="sidebar-toggle flex md:hidden items-center justify-center rounded-full shrink-0 w-10 h-10 text-neutral-500"
            aria-label="Close menu"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "sidebar-toggle hidden md:flex items-center justify-center rounded-full shrink-0 w-9 h-9 text-neutral-500",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Nav – always show labels on mobile overlay */}
        <nav
          aria-label="App"
          className="flex-1 overflow-y-auto pt-3 pb-2 flex flex-col"
          style={{
            paddingLeft: "var(--sidebar-spacing)",
            paddingRight: "var(--sidebar-spacing)",
          }}
        >
          {visibleGroups.map((group, gi) => (
            <div key={group.label} className={cn("flex flex-col gap-1", gi > 0 && "mt-6")}>
              <p
                className={cn(
                  "px-3.5 pb-1.5 text-[12px] font-medium text-[hsl(var(--sidebar-fg-muted))]",
                  collapsed && "md:hidden"
                )}
              >
                {group.label}
              </p>
              {collapsed && gi > 0 && <div className="hidden md:block mx-2 mb-2 h-px bg-[hsl(var(--sidebar-border))]" />}
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/app/studio" && pathname?.startsWith(href)) ||
                  (href === "/app/assets" && pathname?.startsWith("/app/image"));
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    onClick={closeMobileSidebar}
                    className={cn(
                      "sidebar-item",
                      collapsed && "md:justify-center md:px-0",
                      isActive && "active"
                    )}
                  >
                    <Icon className="sidebar-icon w-[18px] h-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className={cn("truncate", collapsed && "md:hidden")}>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              openSupport("issue");
              closeMobileSidebar();
            }}
            className={cn("sidebar-item mt-auto w-full text-left", collapsed && "md:justify-center md:px-0")}
            title="Help"
          >
            <HelpCircle className="sidebar-icon w-[18px] h-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
            <span className={cn("truncate", collapsed && "md:hidden")}>Help</span>
          </button>
        </nav>

        {/* Slot & Credits */}
        <div
          className="shrink-0 pb-3 empty:hidden"
          style={{
            paddingLeft: "var(--sidebar-spacing)",
            paddingRight: "var(--sidebar-spacing)",
          }}
        >
          <SlotCard collapsed={collapsed} />
          <CreditsCard
            credits={credits}
            collapsed={collapsed}
            showUpgrade={!hasActiveSubscription}
          />
        </div>
      </aside>
    </>
  );
}
