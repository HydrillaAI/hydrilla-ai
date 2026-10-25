"use client";

import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleActions } from "@/components/layout/PicklePage";

const NAMING =
  'Hydrilla AI is the product and company; Hawan Research Labs is its research lab. Names: Hydrilla AI, Hawan Research Labs (Hydrilla AI\'s research lab), BlueFox ("BlueFox 1" only in specs), and Water Agent, always in full.';
const BOILERPLATE =
  "Hydrilla AI is an AI 3D workspace for studio and artist pipelines. BlueFox is its 3D model.";

const MARKS = [
  { label: "Wordmark, light", file: "/logo-hydrilla/hydsvgblack.svg", dark: false },
  { label: "Wordmark, dark", file: "/logo-hydrilla/hydsvg.svg", dark: true },
  { label: "Symbol", file: "/hyd01.png", dark: false },
] as const;

const FOUNDERS = [
  ["Tharak Nagaveti", "Co-Founder"],
  ["Dharani Kumar", "Co-Founder and CTO"],
  ["Tejesh Varma", "Co-Founder and CGO"],
] as const;

export default function BrandPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/brand")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <h1 className="pickle-article-title">Press kit</h1>
          <div className="pickle-lead">
            <p>
              Logos, names, and boilerplate for press covering Hydrilla AI. <Link href="/contact">Contact us</Link>
            </p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Please <strong>use the names and marks exactly as shown here</strong>. Consistent naming helps readers tell Hydrilla AI, its research lab, and its products apart, and keeps coverage accurate.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Brand marks</h2>
            </div>
            <ul className="pickle-cards" style={{ "--cols": 3 } as React.CSSProperties}>
              {MARKS.map((mark) => (
                <li key={mark.label}>
                  <a href={mark.file} download className="group block">
                    <span className="pickle-swatch" data-tone={mark.dark ? "dark" : undefined}>
                      <Image src={mark.file} alt={`Hydrilla ${mark.label.toLowerCase()}`} width={180} height={48} className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
                    </span>
                    <span className="pickle-media-label">
                      <strong>{mark.label}</strong>Download
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <PickleActions primary={{ label: "Download the brand mark", href: "/hyd01.png", download: true }} />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Naming and boilerplate</h2>
            <div className="pickle-text">
              <p>{NAMING}</p>
              <p>{BOILERPLATE}</p>
            </div>
            <div className="pickle-actions" data-align="start">
              <button type="button" className="pickle-pill-ghost" onClick={() => navigator.clipboard.writeText(NAMING)}>
                Copy naming
              </button>
              <button type="button" className="pickle-pill-ghost" onClick={() => navigator.clipboard.writeText(BOILERPLATE)}>
                Copy boilerplate
              </button>
            </div>
          </section>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Founders</h2>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FOUNDERS.map(([name, role]) => (
                      <tr key={name}>
                        <th>{name}</th>
                        <td>{role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
