"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getKitJsonLd } from "@/lib/kit-schema";
import Footer from "@/components/layout/Footer";
import { TEAM_MEMBERS } from "@/lib/team";
import { CONTACT_EMAIL } from "@/lib/brand";

const NAMING =
  'Hydrilla AI is the product and company; Hawan Research Labs is its research lab. Names: Hydrilla AI, Hawan Research Labs (Hydrilla AI\'s research lab), BlueFox ("BlueFox 1" only in specs), and Water Agent, always in full.';

const BOILERPLATE =
  "Hydrilla AI is an AI 3D workspace for studio and artist pipelines. BlueFox is its 3D model.";

type BrandAssetFormat = {
  ext: string;
  href: string;
  filename: string;
};

type BrandMark = {
  id: string;
  label: string;
  usage: string;
  previewSrc: string;
  width: number;
  height: number;
  kind: "wordmark" | "symbol" | "lockup";
  defaultDark: boolean;
  invertOnDark?: boolean;
  formats: readonly BrandAssetFormat[];
};

const MARKS: readonly BrandMark[] = [
  {
    id: "wordmark-dark",
    label: "Hydrilla Wordmark (Dark)",
    usage: "Black wordmark for light backgrounds and print layouts.",
    previewSrc: "/logo-hydrilla/hydsvgblack.svg",
    width: 937,
    height: 274,
    kind: "wordmark",
    defaultDark: false,
    formats: [
      {
        ext: "SVG",
        href: "/logo-hydrilla/hydsvgblack.svg",
        filename: "hydrilla-wordmark-dark.svg",
      },
    ],
  },
  {
    id: "wordmark-light",
    label: "Hydrilla Wordmark (Light)",
    usage: "White wordmark for dark backgrounds and key art.",
    previewSrc: "/logo-hydrilla/hydsvg.svg",
    width: 937,
    height: 274,
    kind: "wordmark",
    defaultDark: true,
    formats: [
      {
        ext: "SVG",
        href: "/logo-hydrilla/hydsvg.svg",
        filename: "hydrilla-wordmark-light.svg",
      },
    ],
  },
  {
    id: "symbol",
    label: "Hydrilla Symbol",
    usage: "Five-petal 3D mark for app icons, avatars, and compact placements.",
    previewSrc: "/hyd01.png",
    width: 729,
    height: 688,
    kind: "symbol",
    defaultDark: false,
    invertOnDark: true,
    formats: [
      {
        ext: "PNG",
        href: "/hyd01.png",
        filename: "hydrilla-symbol.png",
      },
      {
        ext: "SVG",
        href: "/vectorized_019cb4b0-6961-73df-8fbb-bdaa166fad56.svg",
        filename: "hydrilla-symbol.svg",
      },
    ],
  },
  {
    id: "lockup",
    label: "Hydrilla Lockup",
    usage: "Combined symbol and wordmark lockup for headers and press banners.",
    previewSrc: "/logo-hydrilla/Hydrilla-Logo.png",
    width: 4474,
    height: 1033,
    kind: "lockup",
    defaultDark: false,
    invertOnDark: true,
    formats: [
      {
        ext: "SVG",
        href: "/logo-hydrilla/Hydrilla-Logo.svg",
        filename: "hydrilla-logo.svg",
      },
      {
        ext: "PNG",
        href: "/logo-hydrilla/Hydrilla-Logo.png",
        filename: "hydrilla-logo.png",
      },
    ],
  },
] as const;

const FOUNDERS = [
  {
    name: "Tharak Nagaveti",
    role: "Co-founder & CEO",
    image: TEAM_MEMBERS[0]?.image || "/hyd01-mark.png",
    connect: TEAM_MEMBERS[0]?.connect,
  },
  {
    name: "Dharani Kumar",
    role: "Co-founder & CTO",
    image: TEAM_MEMBERS[1]?.image || "/ddhydrilla.jpeg",
    connect: TEAM_MEMBERS[1]?.connect,
  },
  {
    name: "Tejesh Varma",
    role: "CGO",
    image: TEAM_MEMBERS[2]?.image || "/tejahydrilla.jpeg",
    connect: TEAM_MEMBERS[2]?.connect,
  },
] as const;

const ENTITIES = [
  {
    name: "Hydrilla AI",
    category: "Product & Company",
    rule: "Use Hydrilla AI or Hydrilla. Never append legal corporate suffixes in editorial copy.",
  },
  {
    name: "Hawan Research Labs",
    category: "Research Lab",
    rule: "Always write Hawan Research Labs in full on first mention as Hydrilla AI's research lab.",
  },
  {
    name: "BlueFox",
    category: "3D Model",
    rule: 'Write BlueFox as one word with capital B and F. Use "BlueFox 1" only in technical specs and model cards.',
  },
  {
    name: "Water Agent",
    category: "AI 3D Agent",
    rule: "Always write Water Agent in full when referring to the agent for studio and DCC workflows.",
  },
] as const;

export default function BrandPage() {
  const [surfaceMode, setSurfaceMode] = useState<"recommended" | "light" | "dark">("recommended");
  const [copiedKey, setCopiedKey] = useState<"boilerplate" | "naming" | null>(null);

  const handleCopy = (key: "boilerplate" | "naming", text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleDownloadAll = () => {
    const downloads = [
      { href: "/logo-hydrilla/hydsvgblack.svg", filename: "hydrilla-wordmark-dark.svg" },
      { href: "/logo-hydrilla/hydsvg.svg", filename: "hydrilla-wordmark-light.svg" },
      { href: "/hyd01.png", filename: "hydrilla-symbol.png" },
      { href: "/logo-hydrilla/Hydrilla-Logo.svg", filename: "hydrilla-logo.svg" },
    ];
    downloads.forEach((item, index) => {
      window.setTimeout(() => {
        const link = document.createElement("a");
        link.href = item.href;
        link.download = item.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 180);
    });
  };

  return (
    <>
      <JsonLd data={getKitJsonLd("/brand")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <h1 className="pickle-article-title">Press kit</h1>
          <div className="pickle-lead">
            <p>
              Logos, names, and boilerplate for press covering Hydrilla AI.{" "}
              <Link href="/contact">Contact us</Link>
            </p>
          </div>
          <div className="pickle-actions" style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="pickle-pill-solid"
            >
              Download all brand marks
            </button>
            <a
              href="/hyd01.png"
              download="hydrilla-symbol.png"
              className="pickle-pill-ghost"
            >
              Download the brand mark
            </a>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Please <strong>use the names and marks exactly as shown here</strong>. Consistent naming helps readers tell Hydrilla AI, its research lab, and its products apart, and keeps coverage accurate.
            </p>
          </div>

          <section className="pickle-section">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="pickle-head-block">
                <h2 className="pickle-h2">Brand marks</h2>
              </div>
              <div
                role="group"
                aria-label="Preview background surface"
                className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] p-1"
              >
                {(
                  [
                    ["recommended", "Recommended"],
                    ["light", "Light surface"],
                    ["dark", "Dark surface"],
                  ] as const
                ).map(([mode, label]) => {
                  const active = surfaceMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSurfaceMode(mode)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-colors duration-200 ${
                        active
                          ? "bg-[#0a0a0c] text-white"
                          : "bg-transparent text-black/65 hover:text-black"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {MARKS.map((mark) => {
                const isDarkTile =
                  surfaceMode === "recommended"
                    ? mark.defaultDark
                    : surfaceMode === "dark";

                const previewSrc =
                  mark.kind === "wordmark"
                    ? isDarkTile
                      ? "/logo-hydrilla/hydsvg.svg"
                      : "/logo-hydrilla/hydsvgblack.svg"
                    : mark.previewSrc;

                const shouldInvert =
                  mark.invertOnDark && isDarkTile && mark.kind !== "wordmark";

                return (
                  <li
                    key={mark.id}
                    className="flex flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-6 sm:p-7"
                  >
                    <div>
                      <div
                        className={`flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[20px] px-8 transition-colors duration-200 ${
                          isDarkTile ? "bg-[#0a0a0c]" : "bg-white"
                        }`}
                      >
                        <Image
                          src={previewSrc}
                          alt={`Hydrilla ${mark.label}`}
                          width={mark.width}
                          height={mark.height}
                          className={
                            mark.kind === "symbol"
                              ? `h-24 w-24 object-contain transition-transform duration-300 ${
                                  shouldInvert ? "brightness-0 invert" : ""
                                }`
                              : mark.kind === "lockup"
                                ? `h-14 w-auto max-w-[82%] object-contain transition-transform duration-300 ${
                                    shouldInvert ? "brightness-0 invert" : ""
                                  }`
                                : "h-11 w-auto max-w-[78%] object-contain transition-transform duration-300"
                          }
                        />
                      </div>

                      <div className="mt-5">
                        <h3 className="m-0 text-[19px] font-medium tracking-[-0.015em] text-black">
                          {mark.label}
                        </h3>
                        <p className="mt-1.5 mb-0 text-[15px] leading-[1.45] text-black/65">
                          {mark.usage}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                      {mark.formats.map((fmt) => (
                        <a
                          key={fmt.filename}
                          href={fmt.href}
                          download={fmt.filename}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-black no-underline transition-colors duration-200 hover:bg-[#0a0a0c] hover:text-white"
                        >
                          <span>Download {fmt.ext}</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M8 2.5v7.25m0 0L5.25 7m2.75 2.75L10.75 7M3.25 12.75h9.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Naming and boilerplate</h2>
            </div>

            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-7">
                <div>
                  <h3 className="m-0 text-[19px] font-medium tracking-[-0.015em] text-black">
                    Short boilerplate
                  </h3>
                  <p className="mt-3 mb-0 text-[17px] leading-[1.55] text-black">
                    {BOILERPLATE}
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="pickle-pill-ghost"
                    onClick={() => handleCopy("boilerplate", BOILERPLATE)}
                  >
                    {copiedKey === "boilerplate" ? "Copied boilerplate" : "Copy boilerplate"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-7">
                <div>
                  <h3 className="m-0 text-[19px] font-medium tracking-[-0.015em] text-black">
                    Canonical naming
                  </h3>
                  <p className="mt-3 mb-0 text-[16px] leading-[1.55] text-black/85">
                    {NAMING}
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="pickle-pill-ghost"
                    onClick={() => handleCopy("naming", NAMING)}
                  >
                    {copiedKey === "naming" ? "Copied naming" : "Copy naming"}
                  </button>
                </div>
              </div>
            </div>

            <figure className="pickle-figure" style={{ marginTop: "8px" }}>
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Editorial usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENTITIES.map((entity) => (
                      <tr key={entity.name}>
                        <th>{entity.name}</th>
                        <td>{entity.category}</td>
                        <td>{entity.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Founders</h2>
            </div>

            <ul
              className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              {FOUNDERS.map((founder) => (
                <li
                  key={founder.name}
                  className="flex flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
                      <Image
                        src={founder.image}
                        alt={`Portrait of ${founder.name}, ${founder.role} at Hydrilla.`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="m-0 text-[18px] font-medium tracking-[-0.01em] text-black">
                        {founder.name}
                      </h3>
                      <p className="mt-0.5 mb-0 text-[15px] text-black/70">
                        {founder.role}
                      </p>
                    </div>
                  </div>
                  {founder.connect ? (
                    <div className="mt-5">
                      <a
                        href={founder.connect}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-black/75 no-underline transition-colors duration-200 hover:text-black"
                      >
                        <span>LinkedIn profile</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <figure className="pickle-figure" style={{ marginTop: "8px" }}>
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FOUNDERS.map((founder) => (
                      <tr key={founder.name}>
                        <th>{founder.name}</th>
                        <td>{founder.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>

            <p className="m-0 text-[16px] text-black/70">
              Press and media inquiries:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-black underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
