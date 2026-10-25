import React from "react";
import { Link2 } from "lucide-react";

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id}>
      <span>{children}</span>
      <a href={`#${id}`} className="anchor-link" aria-label={`Link to section`}>
        <Link2 className="h-4 w-4" aria-hidden />
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="flex items-center gap-2">
      <span>{children}</span>
      <a href={`#${id}`} className="anchor-link" aria-label={`Link to section`}>
        <Link2 className="h-4 w-4" aria-hidden />
      </a>
    </h3>
  );
}
