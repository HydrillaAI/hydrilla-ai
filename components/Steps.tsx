import React from "react";

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="mt-6">{children}</div>;
}

export function Step({
  number,
  title,
  id,
  last,
  children,
}: {
  number: number;
  title: string;
  id?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 gap-4">
      <div className="flex flex-col items-center" aria-hidden>
        <span className="step-num">{number}</span>
        {!last && <span className="step-line" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-8"}`}>
        <h2 className="!mt-0 !border-t-0 !pt-0 text-h3 font-semibold text-ink">{title}</h2>
        <div className="mt-2 text-small text-ink-2 [&_p]:mt-2">{children}</div>
      </div>
    </section>
  );
}
