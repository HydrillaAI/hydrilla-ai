"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Gamepad2, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Point = {
  readonly x: number;
  readonly y: number;
};

type Direction = "up" | "down" | "left" | "right";

type Phase = "idle" | "running" | "paused" | "over" | "won";

type Palette = {
  readonly boardBg: string;
  readonly grid: string;
  readonly snakeHead: string;
  readonly snakeNeck: string;
  readonly snakeBody: string;
  readonly food: string;
  readonly foodGlow: string;
};

/** Per-round state. Mutated by the game loop so a tick never re-renders React. */
type Game = {
  snake: Point[];
  food: Point | null;
  direction: Direction;
  queue: Direction[];
  elapsedMs: number;
  score: number;
};

/** Screens that get the full-screen game instead of the floating card. */
export const SNAKE_PHONE_QUERY = "(max-width: 767px), (max-height: 32rem)";

const GRID_SIZE = 16;
const SLOWEST_STEP_MS = 180;
const FASTEST_STEP_MS = 85;
const STEP_MS_SAVED_PER_POINT = 2.2;
/** Longest frame the loop will count, so a stalled phone never jumps the snake. */
const MAX_FRAME_MS = 80;
const MAX_QUEUED_TURNS = 2;
const SWIPE_THRESHOLD_PX = 18;
/** Phones report 3x, but the extra canvas memory buys nothing at this cell size. */
const MAX_PIXEL_RATIO = 2;
const HIGH_SCORE_PREFIX = "hydrilla:snake:highscore:";

const LIGHT_PALETTE: Palette = {
  boardBg: "#f4f7fb",
  grid: "rgba(180, 202, 228, 0.4)",
  snakeHead: "#0a0a0b",
  snakeNeck: "#3b82f6",
  snakeBody: "#7eb1e3",
  food: "#3b82f6",
  foodGlow: "rgba(59, 130, 246, 0.28)",
};

const DARK_PALETTE: Palette = {
  boardBg: "#0c0c0e",
  grid: "rgba(255, 255, 255, 0.06)",
  snakeHead: "#ffffff",
  snakeNeck: "#60a5fa",
  snakeBody: "#7eb1e3",
  food: "#60a5fa",
  foodGlow: "rgba(96, 165, 250, 0.35)",
};

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

const scoreKey = (userKey?: string | null): string => {
  return `${HIGH_SCORE_PREFIX}${userKey || "anonymous"}`;
};

const readPalette = (): Palette => {
  return document.documentElement.classList.contains("dark") ? DARK_PALETTE : LIGHT_PALETTE;
};

const isOpposite = (a: Direction, b: Direction): boolean => {
  return VECTORS[a].x === -VECTORS[b].x && VECTORS[a].y === -VECTORS[b].y;
};

const isSamePoint = (a: Point, b: Point | null): boolean => {
  return b !== null && a.x === b.x && a.y === b.y;
};

const placeFood = (snake: readonly Point[]): Point | null => {
  const occupied = new Set(snake.map((part) => part.y * GRID_SIZE + part.x));
  const free = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index).filter(
    (index) => !occupied.has(index)
  );
  const picked = free[Math.floor(Math.random() * free.length)];
  if (picked === undefined) {
    return null;
  }
  return { x: picked % GRID_SIZE, y: Math.floor(picked / GRID_SIZE) };
};

const createGame = (): Game => {
  const center = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
  return { snake, food: placeFood(snake), direction: "right", queue: [], elapsedMs: 0, score: 0 };
};

/** Moves the snake one cell. Edges wrap around, so only the snake's own body ends a round. */
const stepGame = (game: Game): Extract<Phase, "running" | "over" | "won"> => {
  const [nextDirection, ...remainingTurns] = game.queue;
  if (nextDirection) {
    game.direction = nextDirection;
    game.queue = remainingTurns;
  }

  const head = game.snake[0];
  if (!head) {
    return "over";
  }

  const vector = VECTORS[game.direction];
  const newHead: Point = {
    x: (head.x + vector.x + GRID_SIZE) % GRID_SIZE,
    y: (head.y + vector.y + GRID_SIZE) % GRID_SIZE,
  };
  const ateFood = isSamePoint(newHead, game.food);
  // The tail moves out of its cell this step unless the snake is growing.
  const body = ateFood ? game.snake : game.snake.slice(0, -1);
  if (body.some((part) => isSamePoint(newHead, part))) {
    return "over";
  }

  game.snake = [newHead, ...body];
  if (!ateFood) {
    return "running";
  }

  game.score += 1;
  game.food = placeFood(game.snake);
  return game.food === null ? "won" : "running";
};

const fillCircle = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void => {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
};

const drawGrid = (context: CanvasRenderingContext2D, size: number, colors: Palette): void => {
  const cell = size / GRID_SIZE;
  context.fillStyle = colors.boardBg;
  context.fillRect(0, 0, size, size);

  context.strokeStyle = colors.grid;
  context.lineWidth = 1;
  context.beginPath();
  Array.from({ length: GRID_SIZE - 1 }).forEach((_, index) => {
    const position = Math.round((index + 1) * cell) + 0.5;
    context.moveTo(position, 0);
    context.lineTo(position, size);
    context.moveTo(0, position);
    context.lineTo(size, position);
  });
  context.stroke();
};

const drawFood = (
  context: CanvasRenderingContext2D,
  food: Point,
  cell: number,
  colors: Palette
): void => {
  const x = food.x * cell + cell / 2;
  const y = food.y * cell + cell / 2;
  const radius = Math.max(3.8, cell * 0.32);
  fillCircle(context, x, y, radius + 4, colors.foodGlow);
  fillCircle(context, x, y, radius, colors.food);
  fillCircle(context, x - radius * 0.28, y - radius * 0.28, radius * 0.28, "rgba(255, 255, 255, 0.75)");
};

const drawEyes = (
  context: CanvasRenderingContext2D,
  head: Point,
  direction: Direction,
  cell: number
): void => {
  const vector = VECTORS[direction];
  const centerX = (head.x + 0.5) * cell + vector.x * cell * 0.24;
  const centerY = (head.y + 0.5) * cell + vector.y * cell * 0.24;
  const lateral = cell * 0.22;
  const eyeRadius = Math.max(2.1, cell * 0.13);
  const pupilRadius = Math.max(1.1, eyeRadius * 0.55);

  [-1, 1].forEach((side) => {
    const x = centerX + vector.y * lateral * side;
    const y = centerY + vector.x * lateral * side;
    fillCircle(context, x, y, eyeRadius, "#ffffff");
    fillCircle(context, x, y, pupilRadius, "#002664");
  });
};

const drawSnake = (
  context: CanvasRenderingContext2D,
  game: Game,
  cell: number,
  colors: Palette
): void => {
  const padding = Math.max(1.5, cell * 0.1);
  const partSize = Math.max(1, cell - padding * 2);

  game.snake.forEach((part, index) => {
    const partColors = [colors.snakeHead, colors.snakeNeck];
    context.fillStyle = partColors[index] ?? colors.snakeBody;
    context.beginPath();
    // Canvas roundRect is missing before iOS 16.
    if (typeof context.roundRect === "function") {
      const radius = index === 0 ? Math.max(4, cell * 0.38) : Math.max(2.5, cell * 0.26);
      context.roundRect(part.x * cell + padding, part.y * cell + padding, partSize, partSize, radius);
    } else {
      context.rect(part.x * cell + padding, part.y * cell + padding, partSize, partSize);
    }
    context.fill();
  });

  const head = game.snake[0];
  if (head) {
    drawEyes(context, head, game.direction, cell);
  }
};

const drawBoard = (
  context: CanvasRenderingContext2D,
  size: number,
  game: Game,
  colors: Palette
): void => {
  const cell = size / GRID_SIZE;
  drawGrid(context, size, colors);
  if (game.food) {
    drawFood(context, game.food, cell, colors);
  }
  drawSnake(context, game, cell, colors);
};

function Stat({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-neutral-200/70 bg-[var(--hyd-50)] px-3 py-1.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
        {label}
      </div>
      <div className="text-lg font-semibold leading-6 tabular-nums tracking-tight text-neutral-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full border border-neutral-200/80 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]",
        className
      )}
    >
      {children}
    </button>
  );
}

function OverlayButton({
  onClick,
  children,
}: {
  readonly onClick?: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-medium tracking-tight text-white transition hover:bg-neutral-900 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
    >
      {children}
    </button>
  );
}

function BoardOverlay({
  title,
  detail,
  passThrough,
  children,
}: {
  readonly title: string;
  readonly detail?: ReactNode;
  readonly passThrough?: boolean;
  readonly children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-white/85 p-4 text-center motion-safe:animate-[studioFade_200ms_ease-out] dark:bg-[#141417]/85",
        passThrough && "pointer-events-none"
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        {title}
      </span>
      {detail ? (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{detail}</p>
      ) : null}
      {children}
    </div>
  );
}

/** Touch and keyboard wording, chosen in CSS so it is right on the first paint. */
function InputHint({ touch, keyboard }: { readonly touch: string; readonly keyboard: string }) {
  return (
    <>
      <span className="hidden pointer-coarse:inline">{touch}</span>
      <span className="pointer-coarse:hidden">{keyboard}</span>
    </>
  );
}

/** Sits above the composer on phones after the full-screen game is minimized. */
export function SnakeResumePill({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="studio-float pointer-events-auto mx-auto mb-2 flex h-11 items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-4 text-sm font-medium text-neutral-900 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.28)] active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#141417] dark:text-neutral-100"
    >
      <Gamepad2 className="size-4 text-[var(--hyd-400)]" aria-hidden />
      Back to Snake
    </button>
  );
}

type SnakeCardProps = {
  readonly userKey?: string | null;
  readonly className?: string;
  readonly generationComplete?: boolean;
  /** Fills the canvas and shows generation status, instead of floating as a card. */
  readonly fullScreen?: boolean;
  /** Hides the full-screen game while keeping the round in memory. */
  readonly minimized?: boolean;
  /** Generation status for the full-screen phone layout, which replaces the canvas loader there. */
  readonly statusMessage?: string;
  readonly progress?: number;
  readonly onCancel?: (() => void) | null;
  readonly onMinimize?: () => void;
  readonly onViewGeneratedModel?: () => void;
};

export function SnakeCard({
  userKey,
  className,
  generationComplete = false,
  fullScreen = false,
  minimized = false,
  statusMessage,
  progress = 0,
  onCancel,
  onMinimize,
  onViewGeneratedModel,
}: SnakeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const boardSizeRef = useRef(0);
  const paletteRef = useRef<Palette>(LIGHT_PALETTE);
  const phaseRef = useRef<Phase>("idle");
  const bestRef = useRef(0);
  const swipeRef = useRef<(Point & { readonly turned: boolean }) | null>(null);

  const [game] = useState(createGame);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const setPhase = useCallback((next: Phase): void => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const draw = useCallback((): void => {
    const context = canvasRef.current?.getContext("2d", { alpha: false });
    if (context && boardSizeRef.current > 0) {
      drawBoard(context, boardSizeRef.current, game, paletteRef.current);
    }
  }, [game]);

  const pause = useCallback((): void => {
    if (phaseRef.current === "running") {
      setPhase("paused");
    }
  }, [setPhase]);

  const togglePause = useCallback((): void => {
    if (generationComplete) {
      return;
    }
    if (phaseRef.current === "running") {
      setPhase("paused");
    } else if (phaseRef.current === "paused") {
      setPhase("running");
    }
  }, [generationComplete, setPhase]);

  const startRound = (): void => {
    Object.assign(game, createGame());
    setScore(0);
    setPhase("running");
    draw();
  };

  const steer = useCallback(
    (next: Direction): void => {
      if (phaseRef.current !== "running") {
        return;
      }
      const latest = game.queue.at(-1) ?? game.direction;
      if (game.queue.length < MAX_QUEUED_TURNS && next !== latest && !isOpposite(latest, next)) {
        game.queue.push(next);
      }
    },
    [game]
  );

  useEffect(() => {
    try {
      const stored = Number.parseInt(window.localStorage.getItem(scoreKey(userKey)) ?? "0", 10);
      bestRef.current = Number.isFinite(stored) ? stored : 0;
    } catch {
      // Private browsing can block storage; the best score then lasts for this session.
      bestRef.current = 0;
    }
    setBest(bestRef.current);
  }, [userKey]);

  // Sizing the backing store clears the canvas, so it only happens when the board really resizes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const size = Math.floor(entry?.contentRect.width ?? 0);
      if (size === 0 || size === boardSizeRef.current) {
        return;
      }
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      canvas.getContext("2d", { alpha: false })?.setTransform(ratio, 0, 0, ratio, 0, 0);
      boardSizeRef.current = size;
      draw();
    });
    observer.observe(surface);
    return () => {
      observer.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    const applyTheme = (): void => {
      paletteRef.current = readPalette();
      draw();
    };
    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, [draw]);

  // Runs only during play: an idle or paused board costs no frames while the model generates.
  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    const loop = { frame: 0, last: performance.now() };
    const tick = (now: number): void => {
      game.elapsedMs += Math.min(MAX_FRAME_MS, now - loop.last);
      loop.last = now;

      const stepMs = Math.max(FASTEST_STEP_MS, SLOWEST_STEP_MS - game.score * STEP_MS_SAVED_PER_POINT);
      if (game.elapsedMs >= stepMs) {
        game.elapsedMs -= stepMs;
        const outcome = stepGame(game);
        draw();
        setScore(game.score);
        if (game.score > bestRef.current) {
          bestRef.current = game.score;
          setBest(game.score);
          try {
            window.localStorage.setItem(scoreKey(userKey), String(game.score));
          } catch {
            // Private browsing can block storage; the best score then lasts for this session.
          }
        }
        if (outcome !== "running") {
          setPhase(outcome);
          return;
        }
      }
      loop.frame = requestAnimationFrame(tick);
    };

    loop.frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(loop.frame);
    };
  }, [draw, game, phase, setPhase, userKey]);

  useEffect(() => {
    if (generationComplete) {
      pause();
    }
  }, [generationComplete, pause]);

  // Switching apps must not leave the snake running into itself.
  useEffect(() => {
    const pauseWhenHidden = (): void => {
      if (document.hidden) {
        pause();
      }
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, [pause]);

  useEffect(() => {
    if (generationComplete || minimized) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      if (phaseRef.current !== "running" && phaseRef.current !== "paused") {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
        return;
      }

      const direction = KEY_DIRECTIONS[event.key];
      if (direction) {
        event.preventDefault();
        steer(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [generationComplete, minimized, steer, togglePause]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "mouse") {
      swipeRef.current = { x: event.clientX, y: event.clientY, turned: false };
    }
  };

  // Turns as soon as the finger has travelled far enough, and keeps tracking so one drag can turn twice.
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const swipe = swipeRef.current;
    if (!swipe) {
      return;
    }

    const deltaX = event.clientX - swipe.x;
    const deltaY = event.clientY - swipe.y;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      steer(deltaX > 0 ? "right" : "left");
    } else {
      steer(deltaY > 0 ? "down" : "up");
    }
    swipeRef.current = { x: event.clientX, y: event.clientY, turned: true };
  };

  const handlePointerUp = (): void => {
    if (swipeRef.current && !swipeRef.current.turned) {
      togglePause();
    }
    swipeRef.current = null;
  };

  const handlePointerCancel = (): void => {
    swipeRef.current = null;
  };

  const handleMinimize = (): void => {
    pause();
    onMinimize?.();
  };

  const canPause = !generationComplete && (phase === "running" || phase === "paused");
  const playAgain = (
    <OverlayButton onClick={startRound}>
      <RotateCcw className="size-4" aria-hidden />
      Play again
    </OverlayButton>
  );
  const phaseOverlays: Record<Phase, ReactNode> = {
    idle: (
      <BoardOverlay
        title="Play while you wait"
        detail={<InputHint touch="Swipe to steer" keyboard="Arrow keys or WASD" />}
      >
        <OverlayButton onClick={startRound}>
          <Play className="size-4 fill-current" aria-hidden />
          Start
        </OverlayButton>
      </BoardOverlay>
    ),
    running: null,
    paused: (
      <BoardOverlay
        title="Paused"
        detail={<InputHint touch="Tap to resume" keyboard="Space to resume" />}
        passThrough
      />
    ),
    over: (
      <BoardOverlay title="Game over" detail={`Score ${score} · Best ${best}`}>
        {playAgain}
      </BoardOverlay>
    ),
    won: (
      <BoardOverlay title="Board cleared" detail={`Perfect · ${score}`}>
        {playAgain}
      </BoardOverlay>
    ),
  };
  const overlay = generationComplete ? (
    <BoardOverlay title="Generation ready" detail="Your model is ready.">
      <OverlayButton onClick={onViewGeneratedModel}>
        <Sparkles className="size-4" aria-hidden />
        View model
      </OverlayButton>
    </BoardOverlay>
  ) : (
    phaseOverlays[phase]
  );

  return (
    <section
      aria-label="Snake game"
      className={cn(
        "studio-float flex flex-col gap-3 overflow-hidden text-neutral-900 dark:text-neutral-100",
        fullScreen
          ? // Short landscape phones: the board takes the height and the controls move beside it.
            "h-full w-full bg-white px-3 pt-16 pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-safe:animate-[studioSheet_300ms_ease-out] dark:bg-[#141417] [@media(max-height:32rem)]:flex-row [@media(max-height:32rem)]:items-center"
          : "w-72 rounded-3xl border border-neutral-200/80 bg-white/95 p-3 shadow-[0_16px_48px_-12px_rgba(1,14,36,0.12),0_2px_8px_rgba(1,14,36,0.04)] backdrop-blur-xl lg:w-87.5 lg:p-4 dark:border-white/[0.08] dark:bg-[#141417]/95",
        fullScreen && minimized && "hidden",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3",
          fullScreen && "mx-auto min-h-0 w-full max-w-lg flex-1 justify-end"
        )}
      >
        {fullScreen && statusMessage && !generationComplete ? (
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
            role="status"
            aria-live="polite"
          >
            {/* Only when the screen has height to spare above the board. */}
            <div className="mb-3 hidden [@media(min-height:50rem)]:block">
              <ThinkingOrb state="solving" size={64} theme="auto" />
            </div>
            <p className="line-clamp-2 max-w-sm text-sm font-medium tracking-tight">{statusMessage}</p>
            <div className="mt-2 flex w-48 items-center gap-2">
              <Progress className="h-1 min-w-0 flex-1" value={progress} />
              <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                {Math.round(progress)}%
              </span>
            </div>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-3 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Stat label="Score" value={score} />
          <Stat label="Best" value={best} />
          <IconButton label={phase === "running" ? "Pause" : "Resume"} onClick={togglePause} disabled={!canPause}>
            {phase === "running" ? (
              <Pause className="size-4" aria-hidden />
            ) : (
              <Play className="size-4 fill-current" aria-hidden />
            )}
          </IconButton>
          {fullScreen ? (
            <IconButton label="Close Snake game" onClick={handleMinimize}>
              <X className="size-4" aria-hidden />
            </IconButton>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-white/[0.08]",
          fullScreen
            ? "mx-auto w-[min(100%,32rem,calc(100dvh_-_17.75rem_-_env(safe-area-inset-bottom)))] [@media(max-height:32rem)]:w-[calc(100dvh_-_5rem_-_env(safe-area-inset-bottom))]"
            : "w-full"
        )}
      >
        <div
          ref={surfaceRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="relative aspect-square w-full touch-none select-none"
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-label="Snake game board" />
          {overlay}
        </div>
      </div>

      <p className="text-center text-xs font-medium text-neutral-400 [@media(max-height:32rem)]:hidden dark:text-neutral-500">
        <InputHint touch="Swipe to steer · tap to pause" keyboard="Arrow keys or WASD · Space to pause" />
      </p>
    </section>
  );
}
