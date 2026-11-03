"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BlurReveal } from "@/components/ui/BlurReveal";
import { PuppetStage } from "@/components/sections/PuppetStage";
import { HEADING_FONT, HEADING_WEIGHT, BODY_FONT, SANS_FONT, SECTION_WEIGHT, DESCRIPTION_WEIGHT } from "@/lib/fonts";

/* Design tokens (shared with the other landing sections) */
const INK = "#000c1f";
const INK_SECONDARY = "rgba(0, 12, 31, 0.62)";
const INK_TERTIARY = "rgba(0, 12, 31, 0.42)";
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

/** One wavelength repeats across a 4x-wide path, so a -25% shift loops seamlessly. */
const WAVE_SPAN = 2400;
const WAVE_LENGTH = 600;

type Ribbon = {
  color: string;
  amplitude: number;
  harmonic: number;
  phase: number;
  offset: number;
  seconds: number;
};

const RIBBONS: Ribbon[] = [
  { color: "#3a6dff", amplitude: 34, harmonic: 9, phase: 0.4, offset: 6, seconds: 26 },
  { color: "#ee9cc4", amplitude: 26, harmonic: 12, phase: 2.2, offset: -10, seconds: 32 },
  { color: "#6fcf8a", amplitude: 22, harmonic: 8, phase: 4.1, offset: 18, seconds: 38 },
];

function wavePath({ amplitude, harmonic, phase, offset }: Ribbon) {
  const points: string[] = [];
  for (let x = 0; x <= WAVE_SPAN; x += 12) {
    const t = (x / WAVE_LENGTH) * Math.PI * 2;
    const y = 80 + offset + amplitude * Math.sin(t + phase) + harmonic * Math.sin(t * 2 + phase * 1.6);
    points.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return points.join(" ");
}

function Ribbons({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`cta-ribbons cta-ribbons--${side}`}
    >
      {RIBBONS.map((ribbon) => (
        <svg
          key={ribbon.color}
          className="cta-ribbon"
          viewBox={`0 0 ${WAVE_SPAN} 160`}
          preserveAspectRatio="none"
          style={{ animationDuration: `${ribbon.seconds}s` }}
        >
          <path
            d={wavePath(ribbon)}
            fill="none"
            stroke={ribbon.color}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
    </div>
  );
}

export default function CtaSection() {
  const prefersReducedMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.7, delay, ease: EASE_OUT_QUINT },
  });

  return (
    <section className="cta" aria-labelledby="cta-heading">
      <style>{`
        .cta {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #fff;
          padding-bottom: clamp(5rem, 3.5rem + 6vw, 9rem);
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        .cta-stage {
          position: relative;
          height: clamp(17rem, 12rem + 16vw, 27rem);
        }
        .cta-puppets {
          position: absolute;
          inset: 0;
        }
        .cta-ribbons {
          position: absolute;
          top: 34%;
          width: 36%;
          height: clamp(7rem, 5rem + 6vw, 10rem);
          overflow: hidden;
          pointer-events: none;
        }
        .cta-ribbons--left {
          left: 0;
          -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 35%, transparent 92%);
          mask-image: linear-gradient(90deg, #000 0%, #000 35%, transparent 92%);
        }
        .cta-ribbons--right {
          right: 0;
          transform: scaleX(-1);
          -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 35%, transparent 92%);
          mask-image: linear-gradient(90deg, #000 0%, #000 35%, transparent 92%);
        }
        .cta-ribbon {
          position: absolute;
          inset: 0 auto 0 0;
          width: 400%;
          height: 100%;
          overflow: visible;
          animation: cta-drift linear infinite;
          will-change: transform;
        }
        @keyframes cta-drift {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }

        .cta-copy {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 1.5rem;
          margin-top: clamp(1.25rem, 0.5rem + 2vw, 2.5rem);
        }
        .cta-title {
          margin: 0;
          max-width: 21ch;
          font-family: ${HEADING_FONT};
          font-size: clamp(2.375rem, 1.6rem + 3vw, 4.25rem);
          font-weight: ${HEADING_WEIGHT};
          color: ${INK};
          letter-spacing: -0.045em;
          line-height: 1;
          text-wrap: balance;
        }
        .cta-lede {
          margin: clamp(1.25rem, 1rem + 0.6vw, 1.75rem) 0 0;
          max-width: 31rem;
          font-family: ${BODY_FONT};
          font-weight: ${DESCRIPTION_WEIGHT};
          font-size: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
          line-height: 1.55;
          color: ${INK_SECONDARY};
          text-wrap: balance;
        }
        .cta-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: clamp(2rem, 1.6rem + 1vw, 2.5rem);
        }

        /* Buttons */
        .cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 3rem;
          padding: 0 1.375rem 0 1.5rem;
          border-radius: 999px;
          font-family: ${SANS_FONT};
          font-size: 0.9375rem;
          font-weight: ${SECTION_WEIGHT};
          letter-spacing: -0.005em;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background-color 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease,
            transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cta-button:active {
          transform: scale(0.98);
        }
        .cta-button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }
        .cta-button-icon {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cta-button--primary {
          border: 0;
          background: ${INK};
          color: #fff;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 1px 2px rgba(0, 12, 31, 0.24),
            0 10px 24px -10px rgba(0, 12, 31, 0.55);
        }
        .cta-button--primary:hover {
          background: #0c1c36;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            0 1px 2px rgba(0, 12, 31, 0.24),
            0 14px 30px -12px rgba(0, 12, 31, 0.6);
        }
        .cta-button--primary:hover .cta-button-icon {
          transform: translateX(3px);
        }
        .cta-button--secondary {
          border: 1px solid rgba(0, 12, 31, 0.12);
          background: #fff;
          color: ${INK};
          box-shadow: 0 1px 2px rgba(0, 12, 31, 0.05);
        }
        .cta-button--secondary:hover {
          border-color: rgba(0, 12, 31, 0.2);
          background: #f7f8fa;
        }
        .cta-button--secondary:hover .cta-button-icon {
          transform: translate(2px, -2px);
        }
        .cta-note {
          margin: 1.25rem 0 0;
          font-family: ${BODY_FONT};
          font-size: 0.8125rem;
          color: ${INK_TERTIARY};
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-ribbon {
            animation: none;
          }
          .cta-button,
          .cta-button-icon {
            transition: none;
          }
        }
        @media (max-width: 640px) {
          .cta-ribbons {
            top: 40%;
            width: 22%;
          }
          .cta-copy {
            padding: 0 1rem;
          }
          .cta-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            max-width: 22rem;
          }
        }
      `}</style>

      <div className="cta-stage">
        <Ribbons side="left" />
        <Ribbons side="right" />
        <PuppetStage className="cta-puppets" />
      </div>

      <div className="cta-copy">
        <BlurReveal as="h2" id="cta-heading" className="cta-title">
          Because every idea deserves a third dimension.
        </BlurReveal>
        <motion.p className="cta-lede" {...rise(0.08)}>
          Turn a prompt or a single image into production‑ready 3D, without waiting weeks in a
          modeling queue.
        </motion.p>
        <motion.div className="cta-actions" {...rise(0.16)}>
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/app/studio">
              <button type="button" className="cta-button cta-button--primary">
                Start creating free
                <ArrowRight className="cta-button-icon" size={16} strokeWidth={2} aria-hidden />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app/studio" className="cta-button cta-button--primary">
              Open the studio
              <ArrowRight className="cta-button-icon" size={16} strokeWidth={2} aria-hidden />
            </Link>
          </SignedIn>
          <a
            href="https://cal.com/hydrilla"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button cta-button--secondary"
          >
            Book a demo
            <ArrowUpRight className="cta-button-icon" size={16} strokeWidth={1.8} aria-hidden />
          </a>
        </motion.div>
        <motion.p className="cta-note" {...rise(0.22)}>
          Free plan · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
