"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ProductSwitch } from "@/components/app/ProductSwitch";
import { useCommunity } from "./CommunityProvider";
import { UserAvatar } from "./UserAvatar";

/**
 * Slim top bar for community pages (matches the light-only product chrome).
 * Mirrors the Studio header (AppNavbar): same height and side padding, and the Studio/Community switch sits in the
 * same spot, directly left of the avatar, so it doesn't jump when you move between the two.
 * Logo goes to the Studio when signed in, the homepage otherwise.
 */
export function CommunityHeader() {
  const pathname = usePathname();
  const { isSignedIn, me, openComposer } = useCommunity();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-[color-mix(in_srgb,var(--app-canvas)_82%,transparent)] backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={isSignedIn ? "/app/studio" : "/"}
            className="flex shrink-0 items-center gap-2.5"
            aria-label={isSignedIn ? "Hydrilla Studio" : "Hydrilla home"}
          >
            {/* Same lockup as the app sidebar and site navbar: mark 32px, wordmark ¾ of it, caps centred on the mark. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hyd01-mark.png" width={140} height={132} alt="" aria-hidden className="block h-8 w-auto shrink-0 dark:brightness-0 dark:invert" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-hydrilla/hydsvgblack.svg" alt="Hydrilla" className="hidden h-6 w-auto translate-y-[2px] dark:hidden md:block" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-hydrilla/hydsvg.svg" alt="Hydrilla" className="hidden h-6 w-auto translate-y-[2px] dark:md:block" />
          </Link>
          <span aria-hidden className="hidden h-4 w-px bg-neutral-200 lg:block" />
          <Link
            href="/discover"
            className="community-display hidden truncate text-[16px] text-neutral-900 lg:block"
          >
            Community
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openComposer()}
            className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-900 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700 sm:mr-2 sm:px-4"
            aria-label="New post"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            <span className="hidden sm:inline">New post</span>
          </button>
          <ProductSwitch active="community" className="mx-1.5 sm:mx-2" />
          {isSignedIn ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              {me && (
                <Link href="/app/profile" aria-label="Your profile" className="rounded-full">
                  <UserAvatar user={me} size={32} />
                </Link>
              )}
            </div>
          ) : (
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(pathname || "/discover")}`}
              className="inline-flex h-9 items-center rounded-full border border-neutral-200 px-4 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
