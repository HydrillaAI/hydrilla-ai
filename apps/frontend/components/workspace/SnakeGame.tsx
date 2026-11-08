"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type SnakeProps = {
  readonly userKey?: string | null;
  readonly className?: string;
};

type Point = {
  readonly x: number;
  readonly y: number;
};

type Direction = "up" | "down" | "left" | "right";

type Palette = {
  readonly canvas: string;
  readonly boardBg: string;
  readonly grid: string;
  readonly snakeHead: string;
  readonly snakeBody: string;
  readonly snakeNeck: string;
  readonly food: string;
  readonly foodGlow: string;
  readonly ink: string;
};

const HIGH_SCORE_PREFIX = "hydrilla:snake:highscore:";

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const ARROW_KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const scoreKey = (userKey?: string | null): string => {
  return `${HIGH_SCORE_PREFIX}${userKey || "anonymous"}`;
};

const isOpposite = (a: Direction, b: Direction): boolean => {
  if (a === "up" && b === "down") {
    return true;
  }
  if (a === "down" && b === "up") {
    return true;
  }
  if (a === "left" && b === "right") {
    return true;
  }
  if (a === "right" && b === "left") {
    return true;
  }
  return false;
};

const getThemePalette = (): Palette => {
  if (typeof document === "undefined") {
    return {
      canvas: "#ffffff",
      boardBg: "#f4f7fb",
      grid: "rgba(180, 202, 228, 0.4)",
      snakeHead: "#0a0a0b",
      snakeNeck: "#3b82f6",
      snakeBody: "#7eb1e3",
      food: "#ef4444",
      foodGlow: "rgba(239, 68, 68, 0.32)",
      ink: "#0a0a0b",
    };
  }

  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) {
    return {
      canvas: "#141417",
      boardBg: "#0c0c0e",
      grid: "rgba(255, 255, 255, 0.06)",
      snakeHead: "#ffffff",
      snakeNeck: "#60a5fa",
      snakeBody: "#7eb1e3",
      food: "#ef4444",
      foodGlow: "rgba(239, 68, 68, 0.38)",
      ink: "#fafafa",
    };
  }

  return {
    canvas: "#ffffff",
    boardBg: "#f4f7fb",
    grid: "rgba(180, 202, 228, 0.4)",
    snakeHead: "#0a0a0b",
    snakeNeck: "#3b82f6",
    snakeBody: "#7eb1e3",
    food: "#ef4444",
    foodGlow: "rgba(239, 68, 68, 0.32)",
    ink: "#0a0a0b",
  };
};

const makeInitialSnake = (gridSize: number): Point[] => {
  const center = Math.floor(gridSize / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
};

const generateFood = (gridSize: number, snakeBody: readonly Point[]): Point => {
  const availableSlots: Point[] = [];
  Array.from({ length: gridSize }).forEach((_, y) => {
    Array.from({ length: gridSize }).forEach((_, x) => {
      const isOccupied = snakeBody.some((segment) => {
        return segment.x === x && segment.y === y;
      });
      if (!isOccupied) {
        availableSlots.push({ x, y });
      }
    });
  });

  if (availableSlots.length === 0) {
    return { x: 0, y: 0 };
  }

  const randomIndex = Math.floor(Math.random() * availableSlots.length);
  return availableSlots[randomIndex];
};

const getEyeOffsets = (
  direction: Direction,
  cell: number
): { eye1: Point; eye2: Point } => {
  const lateral = cell * 0.22;
  const center = cell * 0.5;
  const forward = cell * 0.24;

  if (direction === "right") {
    return {
      eye1: { x: center + forward, y: center - lateral },
      eye2: { x: center + forward, y: center + lateral },
    };
  }
  if (direction === "left") {
    return {
      eye1: { x: center - forward, y: center - lateral },
      eye2: { x: center - forward, y: center + lateral },
    };
  }
  if (direction === "up") {
    return {
      eye1: { x: center - lateral, y: center - forward },
      eye2: { x: center + lateral, y: center - forward },
    };
  }

  return {
    eye1: { x: center - lateral, y: center + forward },
    eye2: { x: center + lateral, y: center + forward },
  };
};

function renderBoard(
  context: CanvasRenderingContext2D,
  width: number,
  gridSize: number,
  snake: readonly Point[],
  food: Point,
  direction: Direction,
  colors: Palette
): void {
  const cell = width / gridSize;
  context.clearRect(0, 0, width, width);

  // Background arena
  context.fillStyle = colors.boardBg;
  context.fillRect(0, 0, width, width);

  // Soft grid lines
  context.strokeStyle = colors.grid;
  context.lineWidth = 1;
  Array.from({ length: gridSize - 1 }).forEach((_, index) => {
    const position = Math.round((index + 1) * cell) + 0.5;

    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, width);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(width, position);
    context.stroke();
  });

  // Food: bright, vivid ruby red dot with luminous halo and reflection
  const foodX = food.x * cell + cell / 2;
  const foodY = food.y * cell + cell / 2;
  const foodRadius = Math.max(3.8, cell * 0.32);

  context.save();
  // Outer soft pulse glow
  context.fillStyle = colors.foodGlow;
  context.beginPath();
  context.arc(foodX, foodY, foodRadius + 4.5, 0, Math.PI * 2);
  context.fill();

  // Core red dot
  context.fillStyle = colors.food;
  context.beginPath();
  context.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
  context.fill();

  // Cute little green leaf sprout on the food
  context.fillStyle = "#22c55e";
  context.beginPath();
  context.ellipse(
    foodX + foodRadius * 0.35,
    foodY - foodRadius * 0.82,
    foodRadius * 0.38,
    foodRadius * 0.22,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  context.fill();

  // Specular gleam highlight
  context.fillStyle = "rgba(255, 255, 255, 0.85)";
  context.beginPath();
  context.arc(
    foodX - foodRadius * 0.3,
    foodY - foodRadius * 0.3,
    foodRadius * 0.32,
    0,
    Math.PI * 2
  );
  context.fill();
  context.restore();

  // Snake body and head
  snake.forEach((part, index) => {
    const isHead = index === 0;
    const isNeck = index === 1;
    const padding = Math.max(1.5, cell * 0.1);
    const partX = part.x * cell + padding;
    const partY = part.y * cell + padding;
    const partSize = Math.max(1, cell - padding * 2);
    const cornerRadius = isHead
      ? Math.max(4, cell * 0.38)
      : Math.max(2.5, cell * 0.26);

    const fillColor = isHead
      ? colors.snakeHead
      : isNeck
        ? colors.snakeNeck
        : colors.snakeBody;

    context.fillStyle = fillColor;
    context.beginPath();
    if (typeof context.roundRect === "function") {
      context.roundRect(partX, partY, partSize, partSize, cornerRadius);
    } else {
      context.rect(partX, partY, partSize, partSize);
    }
    context.fill();

    // Direction-aware eyes on the head
    if (isHead) {
      const offsets = getEyeOffsets(direction, cell);
      const eyeRadius = Math.max(2.1, cell * 0.13);
      const pupilRadius = Math.max(1.1, eyeRadius * 0.55);
      const catchlightRadius = Math.max(0.6, eyeRadius * 0.28);

      context.save();
      // Eye 1
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye1.x,
        part.y * cell + offsets.eye1.y,
        eyeRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle = "#002664";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye1.x,
        part.y * cell + offsets.eye1.y,
        pupilRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye1.x - pupilRadius * 0.35,
        part.y * cell + offsets.eye1.y - pupilRadius * 0.35,
        catchlightRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      // Eye 2
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye2.x,
        part.y * cell + offsets.eye2.y,
        eyeRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle = "#002664";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye2.x,
        part.y * cell + offsets.eye2.y,
        pupilRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(
        part.x * cell + offsets.eye2.x - pupilRadius * 0.35,
        part.y * cell + offsets.eye2.y - pupilRadius * 0.35,
        catchlightRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.restore();
    }
  });
}

export function SnakeCard({ userKey, className }: SnakeProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  const gridSizeRef = useRef<number>(16);
  const snakeRef = useRef<Point[]>([]);
  const foodRef = useRef<Point>({ x: 0, y: 0 });
  const directionRef = useRef<Direction>("right");
  const inputQueueRef = useRef<Direction[]>([]);
  const paletteRef = useRef<Palette>(getThemePalette());

  const swipeStartRef = useRef<Point | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  const scoreRef = useRef<number>(0);
  scoreRef.current = score;
  const runningRef = useRef<boolean>(false);
  runningRef.current = running;
  const gameOverRef = useRef<boolean>(false);
  gameOverRef.current = gameOver;

  const saveHighScore = useCallback(
    (nextScore: number): void => {
      setHighScore((currentBest) => {
        if (nextScore <= currentBest) {
          return currentBest;
        }
        try {
          window.localStorage.setItem(scoreKey(userKey), String(nextScore));
        } catch {
          // LocalStorage fallback
        }
        return nextScore;
      });
    },
    [userKey]
  );

  const redrawCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) {
      return;
    }

    const clientWidth = Math.max(1, Math.floor(surface.clientWidth));
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    canvas.width = Math.round(clientWidth * dpr);
    canvas.height = Math.round(clientWidth * dpr);
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientWidth}px`;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderBoard(
      context,
      clientWidth,
      gridSizeRef.current,
      snakeRef.current,
      foodRef.current,
      directionRef.current,
      paletteRef.current
    );
  }, []);

  const resetGameState = useCallback((): void => {
    snakeRef.current = makeInitialSnake(gridSizeRef.current);
    foodRef.current = generateFood(gridSizeRef.current, snakeRef.current);
    directionRef.current = "right";
    inputQueueRef.current = [];
    accumulatorRef.current = 0;
    setScore(0);
    setGameOver(false);
  }, []);

  const handleStartGame = useCallback((): void => {
    resetGameState();
    setHasStarted(true);
    setRunning(true);
    redrawCanvas();
    requestAnimationFrame(() => {
      cardRef.current?.focus();
    });
  }, [redrawCanvas, resetGameState]);

  const togglePause = useCallback((): void => {
    if (!hasStarted || gameOverRef.current) {
      return;
    }
    setRunning((prev) => {
      return !prev;
    });
    requestAnimationFrame(() => {
      cardRef.current?.focus();
    });
  }, [hasStarted]);

  const queueDirection = useCallback((nextDirection: Direction): void => {
    if (!runningRef.current || gameOverRef.current) {
      return;
    }

    const queue = inputQueueRef.current;
    const latestDirection =
      queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

    if (
      queue.length < 2 &&
      !isOpposite(latestDirection, nextDirection) &&
      latestDirection !== nextDirection
    ) {
      inputQueueRef.current = [...queue, nextDirection];
    }
  }, []);

  // Initialize scores, responsive board size, and touch detection
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    gridSizeRef.current = isMobile ? 14 : 16;
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);

    try {
      const stored = Number.parseInt(
        window.localStorage.getItem(scoreKey(userKey)) || "0",
        10
      );
      setHighScore(Number.isFinite(stored) ? stored : 0);
    } catch {
      setHighScore(0);
    }

    resetGameState();
    paletteRef.current = getThemePalette();
    redrawCanvas();
  }, [redrawCanvas, resetGameState, userKey]);

  // Main game tick and observer loop
  useEffect(() => {
    const handleThemeChange = (): void => {
      paletteRef.current = getThemePalette();
      redrawCanvas();
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            redrawCanvas();
          })
        : null;

    if (surfaceRef.current && resizeObserver) {
      resizeObserver.observe(surfaceRef.current);
    }

    const themeObserver = new MutationObserver(() => {
      handleThemeChange();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const stepTick = (time: number): void => {
      const delta = lastTimestampRef.current
        ? Math.min(80, time - lastTimestampRef.current)
        : 0;
      lastTimestampRef.current = time;

      if (runningRef.current && !gameOverRef.current) {
        accumulatorRef.current += delta;
        const currentSpeed = Math.max(85, 180 - scoreRef.current * 2.2);

        while (accumulatorRef.current >= currentSpeed) {
          accumulatorRef.current -= currentSpeed;

          if (inputQueueRef.current.length > 0) {
            const nextDir = inputQueueRef.current[0];
            inputQueueRef.current = inputQueueRef.current.slice(1);
            directionRef.current = nextDir;
          }

          const currentSnake = snakeRef.current;
          const vector = VECTORS[directionRef.current];
          const head = currentSnake[0];
          const size = gridSizeRef.current;

          // Wrap-around edges
          const wrappedX = (head.x + vector.x + size) % size;
          const wrappedY = (head.y + vector.y + size) % size;
          const newHead: Point = { x: wrappedX, y: wrappedY };

          // Self-collision only
          const selfCollision = currentSnake.some((segment, segmentIndex) => {
            return (
              segmentIndex > 0 &&
              segment.x === newHead.x &&
              segment.y === newHead.y
            );
          });

          if (selfCollision) {
            setRunning(false);
            setGameOver(true);
            saveHighScore(scoreRef.current);
            break;
          }

          const updatedSnake = [newHead, ...currentSnake];
          if (
            newHead.x === foodRef.current.x &&
            newHead.y === foodRef.current.y
          ) {
            const updatedScore = scoreRef.current + 1;
            setScore(updatedScore);
            saveHighScore(updatedScore);
            foodRef.current = generateFood(size, updatedSnake);
          } else {
            updatedSnake.pop();
          }

          snakeRef.current = updatedSnake;
        }

        redrawCanvas();
      }

      animationFrameRef.current = requestAnimationFrame(stepTick);
    };

    animationFrameRef.current = requestAnimationFrame(stepTick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      themeObserver.disconnect();
    };
  }, [redrawCanvas, saveHighScore]);

  // Arrow keys for steering + Spacebar to pause / unpause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }

      // Spacebar toggles pause
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        togglePause();
        return;
      }

      // Arrow keys only
      const arrowDirection = ARROW_KEY_DIRECTIONS[event.key];
      if (!arrowDirection) {
        return;
      }

      event.preventDefault();

      if (runningRef.current && !gameOverRef.current) {
        queueDirection(arrowDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [queueDirection, togglePause]);

  // Mobile touch gestures: swipe on canvas to steer, tap to pause/resume
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    cardRef.current?.focus();
    if (event.pointerType === "touch") {
      swipeStartRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < 16) {
      togglePause();
      return;
    }

    if (absX > absY) {
      queueDirection(deltaX > 0 ? "right" : "left");
    } else {
      queueDirection(deltaY > 0 ? "down" : "up");
    }
  };

  const handlePointerCancel = (): void => {
    swipeStartRef.current = null;
  };

  return (
    <section
      ref={cardRef}
      tabIndex={0}
      className={cn(
        "studio-float w-[min(340px,calc(100vw-2rem))] sm:w-[350px] overflow-hidden rounded-[26px] sm:rounded-[28px] border border-neutral-200/80 bg-white/95 p-3.5 sm:p-4 text-neutral-900 shadow-[0_16px_48px_-12px_rgba(1,14,36,0.12),0_2px_8px_rgba(1,14,36,0.04)] backdrop-blur-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/[0.08] dark:bg-[#141417]/95 dark:text-neutral-100 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_56px_-24px_rgba(0,0,0,0.85)]",
        className
      )}
      aria-label="Snake Game"
    >
      {/* Pickle-style Balanced Metric Capsules */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <div className="relative overflow-hidden rounded-[18px] sm:rounded-[20px] border border-neutral-200/70 bg-[#f4f7fb] px-3.5 py-2 sm:py-2.5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
            Score
          </div>
          <div className="mt-0.5 text-[18px] sm:text-[20px] font-semibold tabular-nums tracking-tight text-neutral-950 dark:text-white">
            {score}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] sm:rounded-[20px] border border-neutral-200/70 bg-[#f4f7fb] px-3.5 py-2 sm:py-2.5 text-right transition-colors dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
            Best Score
          </div>
          <div className="mt-0.5 text-[18px] sm:text-[20px] font-semibold tabular-nums tracking-tight text-neutral-950 dark:text-white">
            {highScore}
          </div>
        </div>
      </div>

      {/* Game Board Canvas with Hydrilla Mist Tint */}
      <div className="mt-2.5 sm:mt-3 overflow-hidden rounded-[20px] sm:rounded-[22px] border border-neutral-200/80 bg-[#f4f7fb] p-1 shadow-inner dark:border-white/[0.08] dark:bg-[#0c0c0e]">
        <div
          ref={surfaceRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="relative mx-auto aspect-square w-full max-w-[275px] sm:max-w-[305px] touch-none overflow-hidden rounded-[16px] sm:rounded-[18px]"
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            aria-label="Snake game board"
          />

          {/* Start Game Overlay */}
          {!hasStarted ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 p-4 sm:p-5 text-center backdrop-blur-[3px] dark:bg-[#141417]/85">
              <button
                type="button"
                onClick={handleStartGame}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 text-[13px] font-medium tracking-tight text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.25)] transition-all hover:bg-neutral-850 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.3)] active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Game
              </button>
              <p className="mt-2.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                {isTouchDevice ? "Swipe to steer · tap to pause" : "Arrow keys to steer · Space to pause"}
              </p>
            </div>
          ) : null}

          {/* Paused State Overlay */}
          {hasStarted && !running && !gameOver ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-4 text-center backdrop-blur-[2px] dark:bg-[#141417]/70">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/95 px-4 py-1.5 text-[12px] font-medium text-neutral-900 shadow-sm dark:border-white/[0.08] dark:bg-[#1f1f23]/95 dark:text-neutral-100">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Paused
              </div>
              <p className="mt-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                {isTouchDevice ? "Tap board to resume" : "Press Space to resume"}
              </p>
            </div>
          ) : null}

          {/* Game Over State Overlay */}
          {gameOver ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-4 sm:p-5 text-center backdrop-blur-[3px] dark:bg-[#141417]/90 animate-in fade-in-0 duration-200">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                Game Over
              </span>
              <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-300">
                Score <span className="font-semibold text-neutral-950 dark:text-white">{score}</span> · Best <span className="font-semibold text-neutral-950 dark:text-white">{highScore}</span>
              </p>
              <button
                type="button"
                onClick={handleStartGame}
                className="mt-3.5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-[12px] font-medium tracking-tight text-white shadow-sm transition hover:bg-neutral-850 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Play Again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
