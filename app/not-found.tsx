import React from "react";
import Link from "next/link";
import { Rocket, BookOpen } from "lucide-react";
import { OpenSearchOnMount } from "@/components/OpenSearchOnMount";
import { SearchTrigger } from "@/components/SearchTrigger";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="prose py-10">
      <OpenSearchOnMount />
      <p className="text-caption uppercase tracking-wider text-ink-3">404</p>
      <h1 className="doc-title mt-2 text-ink">This page doesn’t exist.</h1>
      <p className="mt-3">
        The page may have moved. Try searching the docs, or jump straight to a common destination.
      </p>

      <SearchTrigger />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quickstart" className="btn btn-primary">
          <Rocket className="h-4 w-4" aria-hidden />
          Quickstart
        </Link>
        <Link href="/api/text-to-3d" className="btn btn-secondary">
          <BookOpen className="h-4 w-4" aria-hidden />
          API reference
        </Link>
      </div>
    </div>
  );
}
