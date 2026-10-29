"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pause, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type SnakeProps = { userKey?: string | null; className?: string; generationComplete?: boolean; onViewGeneratedModel?: () => void };
type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type Palette = { canvas: string; mist: string; grid: string; snake: string; ink: string };
const HIGH_SCORE_PREFIX = "hydrilla:snake:highscore:";
const VECTORS: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

const scoreKey = (userKey?: string | null) => `${HIGH_SCORE_PREFIX}${userKey || "anonymous"}`;
const isOpposite = (a: Direction, b: Direction) => (a === "up" && b === "down") || (a === "down" && b === "up") || (a === "left" && b === "right") || (a === "right" && b === "left");
const palette = (): Palette => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return { canvas: read("--app-canvas", "Canvas"), mist: read("--hyd-mist", "Canvas"), grid: read("--hyd-200", "currentColor"), snake: read("--hyd-400", "currentColor"), ink: read("--hyd-ink", "currentColor") };
};
const makeSnake = (size: number): Point[] => {
  const center = Math.floor(size / 2);
  return [{ x: center, y: center }, { x: center - 1, y: center }, { x: center - 2, y: center }];
};
const makeFood = (size: number, snake: Point[]): Point => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const point = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
    if (!snake.some((part) => part.x === point.x && part.y === point.y)) return point;
  }
  return { x: 0, y: 0 };
};

function drawBoard(context: CanvasRenderingContext2D, width: number, size: number, snake: Point[], food: Point, colors: Palette, paused: boolean) {
  const cell = width / size;
  context.clearRect(0, 0, width, width);
  context.fillStyle = colors.mist;
  context.fillRect(0, 0, width, width);
  context.strokeStyle = colors.grid;
  context.globalAlpha = 0.45;
  for (let i = 1; i < size; i += 1) {
    const p = Math.round(i * cell) + 0.5;
    context.beginPath(); context.moveTo(p, 0); context.lineTo(p, width); context.moveTo(0, p); context.lineTo(width, p); context.stroke();
  }
  context.globalAlpha = 1;
  const block = (point: Point, color: string) => { const inset = Math.max(2, cell * 0.12); context.fillStyle = color; context.fillRect(point.x * cell + inset, point.y * cell + inset, Math.max(1, cell - inset * 2), Math.max(1, cell - inset * 2)); };
  snake.slice().reverse().forEach((part, index) => block(part, index === snake.length - 1 ? colors.ink : colors.snake));
  const x = food.x * cell + cell / 2; const y = food.y * cell + cell / 2; const gem = Math.max(4, cell * 0.27);
  context.fillStyle = colors.snake; context.strokeStyle = colors.ink; context.lineWidth = Math.max(1, cell * 0.08); context.beginPath(); context.moveTo(x, y - gem); context.lineTo(x + gem, y); context.lineTo(x, y + gem); context.lineTo(x - gem, y); context.closePath(); context.fill(); context.stroke();
  if (paused) { context.fillStyle = colors.canvas; context.globalAlpha = 0.72; context.fillRect(0, 0, width, width); context.globalAlpha = 1; }
}

export function SnakeCard({ userKey, className, generationComplete = false, onViewGeneratedModel }: SnakeProps) {
  const cardRef = useRef<HTMLElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null); const surfaceRef = useRef<HTMLDivElement>(null); const frameRef = useRef<number | null>(null);
  const lastFrame = useRef(0); const accumulator = useRef(0); const snake = useRef<Point[]>([]); const food = useRef<Point>({ x: 0, y: 0 }); const direction = useRef<Direction>("right"); const queued = useRef<Direction>("right"); const turnLocked = useRef(false); const size = useRef(16); const swipe = useRef<Point | null>(null);
  const [score, setScore] = useState(0); const [highScore, setHighScore] = useState(0); const [running, setRunning] = useState(false); const [gameOver, setGameOver] = useState(false); const [touch, setTouch] = useState(false);

  const saveBest = useCallback((next: number) => setHighScore((current) => { if (next <= current) return current; try { window.localStorage.setItem(scoreKey(userKey), String(next)); } catch { /* best effort */ } return next; }), [userKey]);
  const paint = useCallback(() => {
    const canvas = canvasRef.current; const surface = surfaceRef.current; if (!canvas || !surface) return;
    const width = Math.max(1, Math.floor(surface.clientWidth)); const ratio = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * ratio); canvas.height = Math.round(width * ratio); canvas.style.width = `${width}px`; canvas.style.height = `${width}px`;
    const context = canvas.getContext("2d"); if (!context) return; context.setTransform(ratio, 0, 0, ratio, 0, 0); drawBoard(context, width, size.current, snake.current, food.current, palette(), !running || gameOver);
  }, [gameOver, running]);
  const reset = useCallback((start = false) => { snake.current = makeSnake(size.current); food.current = makeFood(size.current, snake.current); direction.current = "right"; queued.current = "right"; turnLocked.current = false; accumulator.current = 0; setScore(0); setGameOver(false); setRunning(start); }, []);
  const toggle = useCallback(() => { if (gameOver) reset(true); else setRunning((current) => !current); requestAnimationFrame(() => cardRef.current?.focus()); }, [gameOver, reset]);
  const steer = useCallback((next: Direction) => { if (!turnLocked.current && !isOpposite(direction.current, next)) { queued.current = next; turnLocked.current = true; } }, []);

  useEffect(() => { setTouch(window.matchMedia("(pointer: coarse)").matches); size.current = window.matchMedia("(max-width: 639px)").matches ? 12 : 16; try { const saved = Number.parseInt(window.localStorage.getItem(scoreKey(userKey)) || "0", 10); setHighScore(Number.isFinite(saved) ? saved : 0); } catch { setHighScore(0); } reset(); }, [reset, userKey]);
  useEffect(() => {
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => paint()); if (surfaceRef.current) observer?.observe(surfaceRef.current); const themeObserver = new MutationObserver(() => paint()); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    const tick = (time: number) => { const delta = lastFrame.current ? Math.min(80, time - lastFrame.current) : 0; lastFrame.current = time;
      if (running && !gameOver) { accumulator.current += delta; const step = Math.max(90, 190 - score * 2.2); while (accumulator.current >= step) { accumulator.current -= step; const parts = snake.current; direction.current = queued.current; const vector = VECTORS[direction.current]; const head = { x: parts[0].x + vector.x, y: parts[0].y + vector.y }; const collision = head.x < 0 || head.y < 0 || head.x >= size.current || head.y >= size.current || parts.some((part, index) => index > 0 && part.x === head.x && part.y === head.y); if (collision) { setRunning(false); setGameOver(true); saveBest(score); break; } parts.unshift(head); if (head.x === food.current.x && head.y === food.current.y) { const next = score + 1; setScore(next); saveBest(next); food.current = makeFood(size.current, parts); } else parts.pop(); turnLocked.current = false; } }
      paint(); frameRef.current = requestAnimationFrame(tick);
    }; frameRef.current = requestAnimationFrame(tick); return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); observer?.disconnect(); themeObserver.disconnect(); saveBest(score); };
  }, [gameOver, paint, running, saveBest, score]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { const target = event.target as HTMLElement | null; if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return; if (!cardRef.current?.contains(target) && document.activeElement !== cardRef.current) return; const keys: Record<string, Direction | undefined> = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" }; const next = keys[event.key]; if (next) { event.preventDefault(); steer(next); } else if (event.code === "Space") { event.preventDefault(); toggle(); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [steer, toggle]);
  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => { cardRef.current?.focus(); if (event.pointerType === "touch") swipe.current = { x: event.clientX, y: event.clientY }; };
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => { const start = swipe.current; swipe.current = null; if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) toggle(); else if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? "right" : "left"); else steer(dy > 0 ? "down" : "up"); };
  const status = generationComplete ? "Ready" : gameOver ? "Game over" : running ? "Playing" : "Paused";

  return <section ref={cardRef} tabIndex={0} className={cn("w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[22px] border border-[var(--hyd-200)] bg-[var(--app-canvas)] p-3 text-[var(--hyd-ink)] shadow-[var(--shadow-stage-md)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--hyd-400)] sm:p-3.5", className)} aria-label="Play while you wait: Snake">
    <div className="flex items-start justify-between gap-3 px-0.5"><div><h2 className="text-[14px] font-semibold tracking-[var(--tracking-display)] sm:text-[15px]"><Sparkles className="mr-1 inline h-4 w-4 text-[var(--hyd-400)]" aria-hidden /> Play while you wait: Snake</h2><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] opacity-55">Hydrilla generation lounge</p></div><div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--hyd-50)] px-2 py-1 text-[11px] font-semibold"><Trophy className="h-3.5 w-3.5 text-[var(--hyd-400)]" />{highScore}</div></div>
    <div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-[13px] border border-[var(--hyd-200)] bg-[var(--card-bg)] px-2.5 py-1.5"><div className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-55">Score</div><div className="mt-0.5 text-[16px] font-semibold">{score}</div></div><div className="rounded-[13px] border border-[var(--hyd-200)] bg-[var(--card-bg)] px-2.5 py-1.5 text-right"><div className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-55">Best</div><div className="mt-0.5 text-[16px] font-semibold">{highScore}</div></div></div>
    <div className="mt-2 overflow-hidden rounded-[17px] border border-[var(--hyd-200)] bg-[var(--hyd-mist)] shadow-[var(--shadow-stage)]"><div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-medium opacity-65"><span>PIXEL GRID · {size.current}×{size.current}</span><span className="rounded-full bg-[var(--hyd-50)] px-1.5 py-0.5 text-[9px] font-semibold">{status}</span></div><div ref={surfaceRef} onPointerDown={pointerDown} onPointerUp={pointerUp} className="relative mx-auto aspect-square w-full max-w-[360px] touch-none overflow-hidden"><canvas ref={canvasRef} className="block h-full w-full" aria-label="Snake game board" />{!running && !gameOver && !generationComplete ? <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="bg-[var(--app-canvas)]/80 px-3 py-2 text-center backdrop-blur-[2px]"><p className="text-[12px] font-semibold">Ready when you are</p><p className="mt-0.5 text-[10px] opacity-65">{touch ? "Swipe to turn · tap to pause" : "Arrow keys / WASD · Space to pause"}</p></div></div> : null}{gameOver && !generationComplete ? <div className="absolute inset-0 flex items-center justify-center bg-[var(--app-canvas)]/80 p-4 text-center backdrop-blur-[2px]"><div><p className="text-[12px] font-semibold">Run complete</p><p className="mt-1 text-[10px] opacity-65">Score {score} · Best {highScore}</p><button type="button" onClick={() => reset(true)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--hyd-ink)] px-3.5 text-[11px] font-semibold text-[var(--app-canvas)]"><RotateCcw className="h-3.5 w-3.5" /> Play again</button></div></div> : null}{generationComplete ? <div className="absolute inset-0 flex items-center justify-center bg-[var(--app-canvas)]/85 p-4 text-center backdrop-blur-[2px]"><div><p className="text-[12px] font-semibold">Your model is ready</p><p className="mt-1 text-[10px] opacity-65">Open it in the workspace viewer.</p><button type="button" onClick={onViewGeneratedModel} className="mt-2 min-h-11 rounded-lg bg-[var(--hyd-ink)] px-3.5 text-[11px] font-semibold text-[var(--app-canvas)]">View generated model</button></div></div> : null}</div></div>
    <div className="mt-2 flex items-center justify-between gap-2"><div className="grid grid-cols-3 gap-1 sm:hidden"><span /><button type="button" aria-label="Move up" onClick={() => steer("up")} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--hyd-200)] bg-[var(--hyd-50)]"><ChevronUp className="h-4 w-4" /></button><span /><button type="button" aria-label="Move left" onClick={() => steer("left")} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--hyd-200)] bg-[var(--hyd-50)]"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label={running ? "Pause game" : "Play game"} onClick={toggle} className="grid min-h-11 min-w-11 place-items-center rounded-lg bg-[var(--hyd-ink)] text-[var(--app-canvas)]">{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button type="button" aria-label="Move right" onClick={() => steer("right")} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--hyd-200)] bg-[var(--hyd-50)]"><ChevronRight className="h-4 w-4" /></button><span /><button type="button" aria-label="Move down" onClick={() => steer("down")} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--hyd-200)] bg-[var(--hyd-50)]"><ChevronDown className="h-4 w-4" /></button><span /></div><div className="hidden min-w-0 text-[10px] opacity-60 sm:block">Arrow keys / WASD to steer</div><button type="button" onClick={toggle} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--hyd-ink)] px-3.5 text-[11px] font-semibold text-[var(--app-canvas)] sm:min-h-9">{running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{running ? "Pause" : gameOver ? "Play again" : "Play"}</button></div>
  </section>;
}
