"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { Play, Pause } from "lucide-react";
import SeeWorkspaceButton from "../SeeWorkspaceButton";
import { BlurReveal } from "@/components/ui/BlurReveal";
import { WORKFLOW_DEMO } from "@/lib/cloudinary";
import { SANS_FONT, SECTION_WEIGHT } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function AppShowcase() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // IntersectionObserver: Only stream/play video when in view (conserves Cloudinary free tier bandwidth)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: "150px 0px", threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sync video play/pause with inView and user state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    if (inView && !userPaused) {
      video.muted = true;
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [inView, userPaused, reduceMotion]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => undefined);
    } else {
      setUserPaused(true);
      video.pause();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        togglePlay();
      }
    },
    [togglePlay]
  );

  return (
    <section className="relative w-full bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <BlurReveal
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-medium text-[#111] tracking-tight leading-[1.12]"
            style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
          >
            Workflow for you
          </BlurReveal>
        </div>

        {/* Video showcase container in natural aspect ratio (3736/2160) showing full video with no cards or gif */}
        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? "Pause workflow demo video" : "Play workflow demo video"}
          onClick={togglePlay}
          onKeyDown={handleKeyDown}
          className="group relative w-full aspect-[3736/2160] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          {/* WebP Poster loads instantly like a lightweight image (<35KB), avoiding layout shift */}
          <Image
            src={WORKFLOW_DEMO.poster}
            alt="Hydrilla workflow demo preview"
            fill
            sizes="(max-width: 1280px) 100vw, 1152px"
            className={cn(
              "object-cover transition-opacity duration-700 ease-out",
              isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            priority={false}
            unoptimized
          />

          {/* Full workflow video optimized for Cloudinary free tier (WebM VP9 + MP4 H264 fallback) */}
          {!reduceMotion && (
            <video
              ref={videoRef}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              playsInline
              muted
              loop
              preload={inView ? "metadata" : "none"}
              poster={WORKFLOW_DEMO.poster}
              onPlaying={() => {
                setIsPlaying(true);
                setIsLoaded(true);
              }}
              onPause={() => setIsPlaying(false)}
            >
              <source src={WORKFLOW_DEMO.webm} type="video/webm" />
              <source src={WORKFLOW_DEMO.mp4} type="video/mp4" />
            </video>
          )}

          {/* Subtle play/pause badge on hover/focus */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 text-white text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <SeeWorkspaceButton />
        </div>
      </div>
    </section>
  );
}
