"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LibraryNavbar from "./LibraryNavbar";
import Navbar from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  const [waterSectionNav, setWaterSectionNav] = useState(false);

  // Water Agent page swaps Hydrilla navbar for its Genie-style pill once you scroll into the sections.
  useEffect(() => {
    if (pathname !== "/water") {
      setWaterSectionNav(false);
      return;
    }

    const sync = () => setWaterSectionNav(document.body.dataset.waterSectionNav === "true");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-water-section-nav"] });
    return () => observer.disconnect();
  }, [pathname]);

  // Don't show marketing navbar on app shell / workspace (auth pages keep it so
  // Hydrilla → home and the post-login App button stay available).
  if (
    pathname?.startsWith("/app") ||
    pathname === "/generate" ||
    pathname?.startsWith("/workspace") ||
    pathname === "/generations" ||
    // Community pages render their own theme-aware header (components/community/CommunityHeader).
    pathname === "/discover" ||
    pathname?.startsWith("/posts/") ||
    pathname?.startsWith("/u/") ||
    pathname?.startsWith("/@")
  ) {
    return null;
  }

  // Library uses a minimal bar — brand + home only
  if (pathname === "/library") {
    return <LibraryNavbar />;
  }

  if (pathname === "/water" && waterSectionNav) {
    return null;
  }

  // Use default variant (black text) for light pages; hero for dark/immersive heroes
  const variant =
    pathname === "/viewer" ||
    pathname === "/privacy-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/cookie-policy" ||
    pathname?.startsWith("/usecase") ||
    pathname === "/blog" ||
    pathname?.startsWith("/blog/") ||
    pathname === "/integrations" ||
    pathname?.startsWith("/integrations/") ||
    pathname === "/community-guidelines" ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up")
      ? "default"
      : "hero";

  return <Navbar variant={variant} pathname={pathname} />;
}

