"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(70);
    const toFull = window.setTimeout(() => setWidth(100), 120);
    const hide = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 520);
    return () => {
      window.clearTimeout(toFull);
      window.clearTimeout(hide);
    };
  }, [pathname]);

  return (
    <div
      className="route-progress"
      style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      aria-hidden
    />
  );
}
