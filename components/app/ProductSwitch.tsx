"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = "studio" | "community";

const ITEMS = [
  { id: "studio", label: "Studio", href: "/app/studio", icon: LayoutDashboard },
  { id: "community", label: "Community", href: "/discover", icon: Compass },
] as const;

/**
 * The one way to move between the app (Studio) and the public community. Same control, same slot (right side, just
 * left of the avatar), same size in both headers. The pill slides to the clicked side while the next page loads; that
 * page's header mounts with the pill already there, so the move reads as one motion.
 */
export function ProductSwitch({ active, className }: { active: Product; className?: string }) {
  const [shown, setShown] = useState<Product>(active);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<Product, HTMLAnchorElement | null>>({ studio: null, community: null });
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  // No slide on first paint: the pill just appears under the current page.
  const [animate, setAnimate] = useState(false);

  // Back/forward or any other route change: follow the page.
  useEffect(() => setShown(active), [active]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[shown];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    // Labels hide below `sm`, which changes item widths.
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <nav
      ref={navRef}
      aria-label="Switch between Studio and Community"
      className={cn("relative inline-flex h-9 shrink-0 items-center gap-0.5 rounded-full bg-neutral-100 p-1", className)}
    >
      {pill ? (
        <span
          aria-hidden
          className={cn(
            "absolute top-1 h-7 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_-4px_rgba(0,0,0,0.12)] dark:bg-neutral-200 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.4)]",
            animate && "transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          )}
          style={{ left: 0, width: pill.width, transform: `translateX(${pill.left}px)` }}
        />
      ) : null}
      {ITEMS.map((item) => {
        const on = item.id === shown;
        return (
          <Link
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id] = el;
            }}
            href={item.href}
            aria-current={item.id === active ? "page" : undefined}
            onClick={(event) => {
              // Modifier clicks open a new tab; this page stays put, so the pill should too.
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || item.id === shown) return;
              setAnimate(true);
              setShown(item.id);
            }}
            className={cn(
              "relative z-10 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors duration-200 sm:px-3",
              // Until the pill is measured, the active item draws its own chip so first paint is never bare.
              !pill && on && "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-neutral-200",
              on ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <item.icon className="h-[15px] w-[15px]" strokeWidth={2} />
            <span className={cn(!on && "hidden sm:inline")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
