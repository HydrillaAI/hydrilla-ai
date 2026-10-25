import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid-cards">{children}</div>;
}

export function NextStepCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="card group">
      <span className="card-icon">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <p className="card-title flex items-center gap-1.5">
        {title}
        <ArrowRight className="h-4 w-4 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
      <p className="card-desc">{description}</p>
    </Link>
  );
}
