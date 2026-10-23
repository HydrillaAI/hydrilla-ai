import React from "react";
import { Info, Lightbulb, TriangleAlert, OctagonAlert } from "lucide-react";

type CalloutVariant = "note" | "tip" | "warning" | "danger";

const VARIANTS: Record<
  CalloutVariant,
  { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; title: string }
> = {
  note: { icon: Info, title: "Note" },
  tip: { icon: Lightbulb, title: "Tip" },
  warning: { icon: TriangleAlert, title: "Warning" },
  danger: { icon: OctagonAlert, title: "Danger" },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}) {
  const config = VARIANTS[variant];
  const Icon = config.icon;
  return (
    <div className={`callout callout-${variant}`} role="note">
      <Icon className="mt-[2px] h-[18px] w-[18px] shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="callout-title">{title ?? config.title}</p>
        <div className="callout-body">{children}</div>
      </div>
    </div>
  );
}
