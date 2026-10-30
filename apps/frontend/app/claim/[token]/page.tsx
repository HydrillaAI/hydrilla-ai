"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  Lock,
} from "lucide-react";
import {
  getClaimInfo,
  claimCredits,
  type ClaimInfoResponse,
  type ClaimCreditsResponse,
} from "@/lib/api";
import { ClaimCelebration } from "@/components/claim/ClaimCelebration";
import { PickleActions } from "@/components/layout/PicklePage";

function formatExpiry(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatusIcon({
  tone,
  children,
}: {
  tone: "success" | "danger" | "warn" | "neutral";
  children: ReactNode;
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    warn: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
    neutral: "bg-[#f5f5f5] text-black/50 ring-1 ring-black/[0.06]",
  } as const;
  return (
    <div
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${tones[tone]}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

type PanelProps = {
  tone: "success" | "danger" | "warn" | "neutral";
  icon: ReactNode;
  title: string;
  wideTitle?: boolean;
  lead: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
};

function ClaimPanel({ tone, icon, title, wideTitle, lead, children, actions }: PanelProps) {
  return (
    <>
      <header className="pickle-article-header">
        <p className="pickle-article-kicker">Credits</p>
        <StatusIcon tone={tone}>{icon}</StatusIcon>
        <h1 className="pickle-article-title" data-wide={wideTitle ? "true" : undefined}>
          {title}
        </h1>
        <div className="pickle-lead">{lead}</div>
        {actions}
      </header>
      {children ? <div className="pickle-article-column">{children}</div> : null}
    </>
  );
}

export default function ClaimTokenPage() {
  const params = useParams<{ token: string }>();
  const rawToken = typeof params?.token === "string" ? params.token : "";
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [claimInfo, setClaimInfo] = useState<ClaimInfoResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<ClaimCreditsResponse | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const loadInfo = useCallback(async () => {
    if (!rawToken) {
      setClaimInfo({ status: "not_found" });
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    try {
      const authToken = isSignedIn ? await getToken() : null;
      const info = await getClaimInfo(rawToken, authToken);
      setClaimInfo(info);
    } catch {
      setClaimInfo({ status: "not_found" });
    } finally {
      setIsChecking(false);
    }
  }, [rawToken, isSignedIn, getToken]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        void loadInfo();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, loadInfo]);

  const handleClaim = async () => {
    if (!isSignedIn) {
      return;
    }
    setIsClaiming(true);
    setClaimError(null);
    try {
      const authToken = await getToken();
      if (!authToken) {
        setClaimError("Please sign in to claim credits.");
        return;
      }
      const res = await claimCredits(rawToken, authToken);
      setClaimResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to claim credits.";
      setClaimError(message);
    } finally {
      setIsClaiming(false);
    }
  };

  const celebrate = Boolean(claimResult);

  return (
    <>
      <ClaimCelebration active={celebrate} />
      <article className="pickle-article pickle-article--fill">
        {isChecking || !isLoaded ? (
          <header className="pickle-article-header">
            <p className="pickle-article-kicker">Credits</p>
            <Loader2 className="h-8 w-8 animate-spin text-black/35" aria-hidden />
            <h1 className="pickle-article-title">Verifying link</h1>
            <div className="pickle-lead">
              <p>Checking this claim link…</p>
            </div>
          </header>
        ) : null}

        {!isChecking && claimResult ? (
          <ClaimPanel
            tone="success"
            icon={<CheckCircle2 className="h-7 w-7" />}
            title="Credits claimed"
            lead={
              <p>
                Added <strong>+{claimResult.amount} credits</strong> to your account.
              </p>
            }
            actions={
              <PickleActions
                primary={{ label: "Go to Studio", href: "/app/studio" }}
                secondary={{ label: "View in Billing", href: "/app/settings?tab=billing" }}
              />
            }
          >
            <figure className="pickle-figure">
              <div className="pickle-card-surface" style={{ textAlign: "center" }}>
                <p className="pickle-caption" style={{ margin: 0, opacity: 0.5 }}>
                  New credit balance
                </p>
                <p className="pickle-h2" style={{ width: "100%", marginTop: 8 }}>
                  {claimResult.remaining} credits
                </p>
                {formatExpiry(claimResult.creditsExpireAt) ? (
                  <p className="pickle-caption" style={{ marginTop: 12 }}>
                    <Clock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                    These {claimResult.amount} credits expire on{" "}
                    {formatExpiry(claimResult.creditsExpireAt)}
                  </p>
                ) : null}
              </div>
            </figure>
          </ClaimPanel>
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "not_found" ? (
          <ClaimPanel
            tone="danger"
            icon={<AlertCircle className="h-7 w-7" />}
            title="Invalid claim link"
            lead={
              <p>This claim link does not exist, has expired, or is no longer valid.</p>
            }
            actions={<PickleActions primary={{ label: "Return home", href: "/" }} />}
          />
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "disabled" ? (
          <ClaimPanel
            tone="warn"
            icon={<Lock className="h-7 w-7" />}
            title="Link disabled"
            lead={
              <p>This credit claim link has been disabled by an administrator.</p>
            }
            actions={<PickleActions primary={{ label: "Return home", href: "/" }} />}
          />
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "expired" ? (
          <ClaimPanel
            tone="danger"
            icon={<Clock className="h-7 w-7" />}
            title="Link expired"
            lead={
              <p>
                This credit claim link has passed its expiration deadline and can no longer be used.
              </p>
            }
            actions={<PickleActions primary={{ label: "Return home", href: "/" }} />}
          />
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "exhausted" ? (
          <ClaimPanel
            tone="neutral"
            icon={<CheckCircle2 className="h-7 w-7" />}
            title={claimInfo?.alreadyClaimedByUser ? "Already claimed" : "Link exhausted"}
            lead={
              <p>
                {claimInfo?.alreadyClaimedByUser
                  ? "You have already claimed credits from this link."
                  : "All available credits from this claim link have already been claimed."}
              </p>
            }
            actions={<PickleActions primary={{ label: "Open Studio", href: "/app/studio" }} />}
          />
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "email_mismatch" ? (
          <ClaimPanel
            tone="warn"
            icon={<Lock className="h-7 w-7" />}
            title="Restricted claim link"
            wideTitle
            lead={
              <>
                <p>This link is restricted and can only be accessed by an authorized account.</p>
                {user?.primaryEmailAddress?.emailAddress ? (
                  <p className="pickle-caption" style={{ marginTop: 8 }}>
                    You are currently signed in as {user.primaryEmailAddress.emailAddress}.
                  </p>
                ) : null}
              </>
            }
            actions={<PickleActions primary={{ label: "Return home", href: "/" }} />}
          />
        ) : null}

        {!isChecking && !claimResult && claimInfo?.status === "ok" ? (
          <ClaimPanel
            tone="success"
            icon={<Gift className="h-7 w-7" />}
            title={`+${claimInfo.amount} credits`}
            lead={
              <>
                {claimInfo.reason ? (
                  <p>“{claimInfo.reason}”</p>
                ) : (
                  <p>Free credits to generate 3D models on Hydrilla.</p>
                )}
                {formatExpiry(claimInfo.creditsExpireAt) ? (
                  <p className="pickle-caption" style={{ marginTop: 8 }}>
                    <Clock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                    Use them by {formatExpiry(claimInfo.creditsExpireAt)}. Unused credits expire then.
                  </p>
                ) : null}
              </>
            }
            actions={
              isSignedIn ? (
                <div className="pickle-actions">
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="pickle-pill-solid"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Claiming credits…
                      </>
                    ) : (
                      "Claim credits"
                    )}
                  </button>
                </div>
              ) : (
                <div className="pickle-actions">
                  <SignInButton mode="modal">
                    <button type="button" className="pickle-pill-solid">
                      Sign in to claim
                    </button>
                  </SignInButton>
                </div>
              )
            }
          >
            {claimError ? (
              <div className="pickle-intro">
                <p style={{ color: "#b42318" }}>{claimError}</p>
              </div>
            ) : null}
            {!isSignedIn ? (
              <div className="pickle-intro">
                <p>
                  New to Hydrilla? Signing in creates an account automatically. Then return here to
                  claim.{" "}
                  <Link href="/docs">Read the docs</Link>
                </p>
              </div>
            ) : null}
          </ClaimPanel>
        ) : null}
      </article>
    </>
  );
}
