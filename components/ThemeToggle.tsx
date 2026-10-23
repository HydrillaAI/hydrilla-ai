"use client";

import React, { useEffect, useRef, useState } from "react";
import { Monitor, Sun, Moon, Check } from "lucide-react";

type ThemeChoice = "system" | "light" | "dark";

const OPTIONS: { value: ThemeChoice; label: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function applyTheme(choice: ThemeChoice) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = choice === "dark" || (choice === "system" && systemDark);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ menuSide = "bottom" }: { menuSide?: "top" | "bottom" }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (localStorage.getItem("hyd-theme") as ThemeChoice | null) ?? "system";
    setChoice(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("hyd-theme") as ThemeChoice | null) === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.value === choice) ?? OPTIONS[0];

  function select(value: ThemeChoice) {
    setChoice(value);
    localStorage.setItem("hyd-theme", value);
    applyTheme(value);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Theme: ${current.label}. Change theme`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <current.icon className="h-4 w-4" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className={`absolute right-0 z-50 w-40 overflow-hidden rounded border border-line bg-surface py-1 shadow-card ${
            menuSide === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          }`}
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={choice === option.value}
              onClick={() => select(option.value)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-small text-ink-2 hover:bg-muted hover:text-ink"
            >
              <option.icon className="h-4 w-4" aria-hidden />
              <span className="flex-1">{option.label}</span>
              {choice === option.value && <Check className="h-4 w-4 text-accent" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
