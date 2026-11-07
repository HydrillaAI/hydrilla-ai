"use client";

import { useEffect } from "react";
import { trackLandingVisit } from "@/lib/analytics";

/** Records one landing_visit per browser session. Refresh does not send another. */
export function LandingVisit() {
  useEffect(() => {
    trackLandingVisit();
  }, []);
  return null;
}
