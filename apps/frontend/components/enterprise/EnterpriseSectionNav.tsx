"use client";

import { useEffect, useState } from "react";

/** In-page anchor row that stays under the site navbar and marks the section in view. */
export function EnterpriseSectionNav({
  items,
}: {
  items: readonly { id: string; label: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // A thin band across the upper third of the viewport decides which section is current.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const { id } of items) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[68px] z-30 mt-14 border-y border-black/10 bg-white/85 backdrop-blur-xl md:top-[72px] md:mt-20"
    >
      <ul className="ent-container flex gap-7 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className="flex h-12 items-center border-b-2 border-transparent text-[15px] font-[510] tracking-[-0.01em] text-black/55 transition-colors hover:text-black aria-[current=true]:border-black aria-[current=true]:text-black"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
