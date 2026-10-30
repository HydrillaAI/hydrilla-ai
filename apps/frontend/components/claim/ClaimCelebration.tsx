"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  life: number;
  maxLife: number;
  kind: "mark" | "chip";
  color: string;
};

const CHIP_COLORS = ["#141414", "#3F3F3F", "#8A8A8A", "#C8C8C8", "#D1FAE5"];

type Props = {
  active: boolean;
};

/**
 * Short, low-count celebration: soft chips + a few crisp Hydrilla marks.
 * Does not block clicks; runs once per activation.
 */
export function ClaimCelebration({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markRef = useRef<HTMLImageElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/hyd01-mark.png";
    img.decoding = "async";
    markRef.current = img;
  }, []);

  useEffect(() => {
    if (!active) {
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return () => {
        startedRef.current = false;
      };
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      startedRef.current = false;
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      startedRef.current = false;
      return;
    }

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;
    const cx = w() / 2;
    const cy = h() * 0.38;

    const particles: Particle[] = [];
    const chipCount = 28;
    const markCount = 7;

    for (let i = 0; i < chipCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35;
      const speed = 3.2 + Math.random() * 4.2;
      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: Math.cos(angle) * speed * (0.55 + Math.random()),
        vy: Math.sin(angle) * speed - 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.12,
        size: 4 + Math.random() * 5,
        life: 0,
        maxLife: 55 + Math.random() * 35,
        kind: "chip",
        color: CHIP_COLORS[i % CHIP_COLORS.length],
      });
    }

    for (let i = 0; i < markCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
      const speed = 2.6 + Math.random() * 3.4;
      particles.push({
        x: cx + (Math.random() - 0.5) * 28,
        y: cy,
        vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.8),
        vy: Math.sin(angle) * speed - 1.6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        size: 18 + Math.random() * 10,
        life: 0,
        maxLife: 70 + Math.random() * 30,
        kind: "mark",
        color: "#141414",
      });
    }

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w(), h());
      let alive = 0;

      for (const p of particles) {
        p.life += 1;
        if (p.life > p.maxLife) continue;
        alive += 1;

        p.vy += 0.14;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        const t = p.life / p.maxLife;
        const alpha = t < 0.12 ? t / 0.12 : Math.max(0, 1 - (t - 0.12) / 0.88);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha * (p.kind === "mark" ? 0.85 : 0.7);

        if (p.kind === "mark" && markRef.current?.complete) {
          const s = p.size;
          ctx.drawImage(markRef.current, -s / 2, -s / 2, s, s);
        } else {
          const hw = p.size * 0.9;
          const hh = p.size * 0.45;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const r = 1.5;
          ctx.moveTo(-hw + r, -hh);
          ctx.arcTo(hw, -hh, hw, hh, r);
          ctx.arcTo(hw, hh, -hw, hh, r);
          ctx.arcTo(-hw, hh, -hw, -hh, r);
          ctx.arcTo(-hw, -hh, hw, -hh, r);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (alive > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w(), h());
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w(), h());
      startedRef.current = false;
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20"
    />
  );
}
