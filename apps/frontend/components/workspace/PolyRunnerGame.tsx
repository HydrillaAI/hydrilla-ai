"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type PolyRunnerGameProps = {
  userKey?: string | null;
  className?: string;
};

type RunnerObstacle = {
  lane: -1 | 0 | 1;
  z: number;
  hue: number;
};

type RunnerState = {
  lane: -1 | 0 | 1;
  obstacles: RunnerObstacle[];
  score: number;
  running: boolean;
  gameOver: boolean;
  lastTime: number;
  spawnTime: number;
  lastScorePaint: number;
  lastScorePaintAt: number;
};

type CanvasSize = {
  width: number;
  height: number;
  pixelRatio: number;
};

const HIGH_SCORE_PREFIX = "hydrilla:polyrunner:highscore:";
const LANE_VALUES: Array<-1 | 0 | 1> = [-1, 0, 1];

function highScoreKey(userKey?: string | null) {
  return `${HIGH_SCORE_PREFIX}${userKey || "anonymous"}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeRunnerState(): RunnerState {
  return {
    lane: 0,
    obstacles: [],
    score: 0,
    running: false,
    gameOver: false,
    lastTime: 0,
    spawnTime: 0,
    lastScorePaint: -1,
    lastScorePaintAt: 0,
  };
}

function drawWireBox(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha: number,
  hue: number,
) {
  const backWidth = width * 0.68;
  const backHeight = height * 0.68;
  const offsetX = width * 0.18;
  const offsetY = height * 0.2;
  const frontLeft = x - width / 2;
  const frontTop = y - height;
  const backLeft = frontLeft + offsetX;
  const backTop = frontTop + offsetY;

  context.save();
  context.strokeStyle = `hsla(${hue}, 68%, 54%, ${alpha})`;
  context.lineWidth = Math.max(1, width / 26);
  context.shadowColor = `hsla(${hue}, 80%, 65%, ${alpha * 0.55})`;
  context.shadowBlur = 7;
  context.beginPath();
  context.rect(frontLeft, frontTop, width, height);
  context.rect(backLeft, backTop, backWidth, backHeight);
  context.moveTo(frontLeft, frontTop);
  context.lineTo(backLeft, backTop);
  context.moveTo(frontLeft + width, frontTop);
  context.lineTo(backLeft + backWidth, backTop);
  context.moveTo(frontLeft, frontTop + height);
  context.lineTo(backLeft, backTop + backHeight);
  context.moveTo(frontLeft + width, frontTop + height);
  context.lineTo(backLeft + backWidth, backTop + backHeight);
  context.stroke();
  context.restore();
}

function drawScene(
  context: CanvasRenderingContext2D,
  size: CanvasSize,
  state: RunnerState,
) {
  const { width, height } = size;
  const centerX = width / 2;
  const horizonY = height * 0.33;
  const floorBottom = height * 1.04;

  context.clearRect(0, 0, width, height);

  const sky = context.createLinearGradient(0, 0, 0, horizonY + 30);
  sky.addColorStop(0, "#e8f0ff");
  sky.addColorStop(0.62, "#f5ecf1");
  sky.addColorStop(1, "#fff8ed");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, horizonY + 30);

  const floor = context.createLinearGradient(0, horizonY, 0, height);
  floor.addColorStop(0, "#f3edf5");
  floor.addColorStop(0.5, "#e8edf8");
  floor.addColorStop(1, "#dce7f5");
  context.fillStyle = floor;
  context.fillRect(0, horizonY, width, height - horizonY);

  context.save();
  context.strokeStyle = "rgba(86, 92, 121, 0.3)";
  context.lineWidth = 1;
  for (let lane = -7; lane <= 7; lane += 1) {
    const farX = centerX + lane * 20;
    const nearX = centerX + lane * width * 0.19;
    context.beginPath();
    context.moveTo(farX, horizonY);
    context.lineTo(nearX, floorBottom);
    context.stroke();
  }
  for (let index = 0; index < 10; index += 1) {
    const progress = index / 10;
    const y = horizonY + Math.pow(progress, 1.75) * (floorBottom - horizonY);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();

  context.save();
  context.strokeStyle = "rgba(86, 92, 121, 0.42)";
  context.beginPath();
  context.moveTo(0, horizonY);
  context.lineTo(width, horizonY);
  context.stroke();
  context.restore();

  for (const obstacle of state.obstacles) {
    const progress = clamp(1 - obstacle.z, 0, 1);
    const perspective = 0.28 + progress * 0.94;
    const laneGap = width * (0.12 + progress * 0.17);
    const x = centerX + obstacle.lane * laneGap;
    const y = horizonY + Math.pow(progress, 1.08) * (floorBottom - horizonY) - 7;
    const boxWidth = 18 + perspective * 35;
    const boxHeight = 18 + perspective * 48;
    drawWireBox(context, x, y, boxWidth, boxHeight, boxWidth * 0.48, 0.35 + progress * 0.55, obstacle.hue);
  }

  const playerProgress = 0.9;
  const playerLaneGap = width * (0.12 + playerProgress * 0.17);
  const playerX = centerX + state.lane * playerLaneGap;
  const playerY = height * 0.82;
  const radius = Math.max(12, Math.min(21, width * 0.046));

  context.save();
  context.fillStyle = "rgba(40, 52, 89, 0.22)";
  context.filter = "blur(5px)";
  context.beginPath();
  context.ellipse(playerX, playerY + radius + 7, radius * 1.35, radius * 0.42, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const ball = context.createRadialGradient(playerX - radius * 0.36, playerY - radius * 0.42, 1, playerX, playerY, radius * 1.2);
  ball.addColorStop(0, "#ffffff");
  ball.addColorStop(0.28, "#b8d5ff");
  ball.addColorStop(0.68, "#718be6");
  ball.addColorStop(1, "#5767b5");
  context.save();
  context.fillStyle = ball;
  context.shadowColor = "rgba(91, 114, 222, 0.55)";
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(playerX, playerY, radius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.76)";
  context.lineWidth = 1.5;
  context.stroke();
  context.restore();
}

export function PolyRunnerCard({ userKey, className }: PolyRunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const stateRef = useRef<RunnerState>(makeRunnerState());
  const canvasSizeRef = useRef<CanvasSize>({ width: 360, height: 280, pixelRatio: 1 });
  const scoreKeyRef = useRef(highScoreKey(userKey));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const paintHighScore = useCallback((nextScore: number) => {
    setHighScore((previous) => {
      if (nextScore <= previous) return previous;
      try {
        window.localStorage.setItem(scoreKeyRef.current, String(nextScore));
      } catch {
        // Local persistence is best-effort only.
      }
      return nextScore;
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;
    const rect = surface.getBoundingClientRect();
    const width = Math.max(260, rect.width);
    const height = Math.max(220, rect.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvasSizeRef.current = { width, height, pixelRatio };
    const context = canvas.getContext("2d");
    if (context) {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawScene(context, canvasSizeRef.current, stateRef.current);
    }
  }, []);

  const resetGame = useCallback((start = false) => {
    const next = makeRunnerState();
    next.running = start;
    stateRef.current = next;
    setScore(0);
    setGameOver(false);
    setRunning(start);
  }, []);

  const togglePlay = useCallback(() => {
    const state = stateRef.current;
    if (state.gameOver) {
      resetGame(true);
      return;
    }
    state.running = !state.running;
    state.lastTime = 0;
    setRunning(state.running);
  }, [resetGame]);

  const movePlayer = useCallback((direction: -1 | 1) => {
    const state = stateRef.current;
    const index = LANE_VALUES.indexOf(state.lane);
    state.lane = LANE_VALUES[clamp(index + direction, 0, LANE_VALUES.length - 1)];
  }, []);

  useEffect(() => {
    scoreKeyRef.current = highScoreKey(userKey);
    stateRef.current = makeRunnerState();
    setScore(0);
    setRunning(false);
    setGameOver(false);
    try {
      const saved = Number.parseInt(window.localStorage.getItem(scoreKeyRef.current) || "0", 10);
      setHighScore(Number.isFinite(saved) ? saved : 0);
    } catch {
      setHighScore(0);
    }
  }, [userKey]);

  useEffect(() => {
    resizeCanvas();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
    if (observer && surfaceRef.current) observer.observe(surfaceRef.current);
    resizeObserverRef.current = observer;

    const tick = (time: number) => {
      const state = stateRef.current;
      const context = canvasRef.current?.getContext("2d");
      if (!context) return;
      const delta = state.lastTime ? Math.min(0.05, (time - state.lastTime) / 1000) : 0;
      state.lastTime = time;

      if (state.running && !state.gameOver) {
        state.spawnTime += delta;
        if (state.spawnTime > 0.8) {
          state.spawnTime = 0;
          const lane = LANE_VALUES[Math.floor(Math.random() * LANE_VALUES.length)];
          state.obstacles.push({ lane, z: 1.08, hue: 205 + Math.round(Math.random() * 45) });
        }
        const speed = 0.42 + Math.min(0.16, state.score / 12000);
        for (const obstacle of state.obstacles) obstacle.z -= delta * speed;
        state.obstacles = state.obstacles.filter((obstacle) => obstacle.z > 0.02);
        state.score += delta * 115;

        const collision = state.obstacles.some(
          (obstacle) => obstacle.z < 0.145 && obstacle.z > 0.02 && obstacle.lane === state.lane,
        );
        if (collision) {
          state.running = false;
          state.gameOver = true;
          const finalScore = Math.floor(state.score);
          setScore(finalScore);
          paintHighScore(finalScore);
          setRunning(false);
          setGameOver(true);
        }

        const paintedScore = Math.floor(state.score);
        if (paintedScore !== state.lastScorePaint && time - state.lastScorePaintAt > 80) {
          state.lastScorePaint = paintedScore;
          state.lastScorePaintAt = time;
          setScore(paintedScore);
        }
      }

      drawScene(context, canvasSizeRef.current, state);
      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, [paintHighScore, resizeCanvas]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePlayer(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        movePlayer(1);
      } else if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [movePlayer, togglePlay]);

  return (
    <section
      className={cn(
        "w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[22px] border border-neutral-200/90 bg-white p-3 text-neutral-950 shadow-[0_20px_55px_-28px_rgba(16,24,40,0.45)] sm:p-3.5",
        className,
      )}
      aria-label="Play while you wait: PolyRunner"
    >
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 sm:text-[15px]">
            <span aria-hidden>🎮</span> Play while you wait: PolyRunner
          </h2>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">3D generation lounge</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-500">
          <Trophy className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.2} />
          {highScore.toLocaleString()}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-[13px] border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Score</div>
          <div className="mt-0.5 text-[16px] font-semibold tracking-[-0.04em] text-neutral-900">{score.toLocaleString()}</div>
        </div>
        <div className="rounded-[13px] border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1.5 text-right">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">High score</div>
          <div className="mt-0.5 text-[16px] font-semibold tracking-[-0.04em] text-neutral-900">{highScore.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-[17px] border border-slate-200/90 bg-[#eef2fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-medium text-neutral-500">
          <span>Preview / Canvas</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", gameOver ? "bg-rose-100 text-rose-600" : running ? "bg-emerald-100 text-emerald-700" : "bg-white/75 text-neutral-500")}>
            {gameOver ? "Game over" : running ? "Running" : "Paused"}
          </span>
        </div>
        <div ref={surfaceRef} className="relative h-[218px] w-full overflow-hidden max-[720px]:h-[180px]">
          <canvas ref={canvasRef} className="block h-full w-full" aria-label="PolyRunner game canvas" />
          {!running && !gameOver ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-white/80 bg-white/80 px-3.5 py-2 text-[12px] font-semibold text-neutral-700 shadow-sm backdrop-blur-sm">
                Press Space or Play to start
              </div>
            </div>
          ) : null}
          {gameOver ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
              <button
                type="button"
                onClick={() => resetGame(true)}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} />
                Run again
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium text-neutral-500">
          Use <span className="font-semibold text-neutral-700">← →</span> or <span className="font-semibold text-neutral-700">Space</span> to play
        </p>
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
          aria-label={gameOver ? "Restart PolyRunner" : running ? "Pause PolyRunner" : "Play PolyRunner"}
        >
          {gameOver ? <RotateCcw className="h-3.5 w-3.5" /> : running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {gameOver ? "Restart" : running ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
