"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "./Footer";
import { NavIcon } from "./NavIcons";
import type { NavIconName } from "@/lib/nav";
import { WHY_HYDRILLA_MEDIA } from "@/lib/cloudinary";

export type PickleRelatedItem = {
  title: string;
  subtitle?: string;
  href: string;
  date?: string;
  author?: string;
  thumbVariant?: PickleThumbVariant;
  imageSrc?: string | null;
  videoSrc?: string | null;
};

export type PickleThumbVariant =
  | "privacy-enclave"
  | "critter-rig"
  | "pipeline-arch"
  | "compare-meshy"
  | "compare-tripo"
  | "compare-luma"
  | "compare-field"
  | "docs-flow"
  | "api-stream"
  | "blender-bridge"
  | "unity-engine"
  | "unreal-engine"
  | "godot-engine"
  | "mcp-agent"
  | "security-trust"
  | "enterprise-scale"
  | "about-lab"
  | "careers-studio"
  | "brand-kit"
  | "changelog-release"
  | "legal-terms"
  | "legal-cookies";

/**
 * High-craft architectural diagrams & 3D rig/mesh cards modeled directly after
 * the two card archetypes on https://pickle.com/research:
 * 1) Light #f5f5f7 architectural system diagram with rounded columns, white node boxes, and labeled arrows
 * 2) Pure black #000000 3D character/mesh viewport with yellow/cyan control rig cages & telemetry
 */
export function PickleVisualThumb({
  variant = "pipeline-arch",
  imageSrc,
  videoSrc,
  alt = "",
}: {
  variant?: PickleThumbVariant;
  imageSrc?: string | null;
  videoSrc?: string | null;
  alt?: string;
}) {
  if (videoSrc) {
    return (
      <div className="pickle-thumb-inner relative h-full w-full bg-black">
        <video
          src={videoSrc}
          poster={imageSrc || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (imageSrc) {
    return (
      <div className="pickle-thumb-inner relative h-full w-full bg-[#f5f5f7]">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(max-width: 700px) 100vw, 480px"
          className="object-cover"
        />
      </div>
    );
  }

  // Dark 3D Rig / Viewport variants (like "How we make Critter act in real time")
  if (
    variant === "critter-rig" ||
    variant === "compare-tripo" ||
    variant === "compare-field" ||
    variant === "unity-engine" ||
    variant === "unreal-engine" ||
    variant === "godot-engine" ||
    variant === "about-lab"
  ) {
    const labelMap: Record<string, { badge: string; rigName: string; channels: string; fps: string }> = {
      "critter-rig": {
        badge: "BlueFox 1 · Real-Time Mesh & Rig",
        rigName: "Segmented Topology + PBR",
        channels: "4 PBR Maps · Clean Quads",
        fps: "GLB · FBX · OBJ · USDZ",
      },
      "compare-tripo": {
        badge: "Hydrilla vs Tripo",
        rigName: "Segmented Parts vs Single Shell",
        channels: "BaseColor · Roughness · Normal",
        fps: "Studio Preview → Engine",
      },
      "compare-field": {
        badge: "2026 Production Benchmark",
        rigName: "AI 3D Field Guide",
        channels: "Hydrilla · Meshy · Luma · Tripo",
        fps: "Engine Handoff Evaluation",
      },
      "unity-engine": {
        badge: "Unity Editor · Local Bridge",
        rigName: "Assets/Hydrilla/Import.glb",
        channels: "URP / HDRP Material Bind",
        fps: "127.0.0.1:7345",
      },
      "unreal-engine": {
        badge: "Unreal Engine 5 · Python Bridge",
        rigName: "/Game/Hydrilla/StaticMesh",
        channels: "Nanite & Substrate Ready",
        fps: "127.0.0.1:7345",
      },
      "godot-engine": {
        badge: "Godot 4 · Editor Dock",
        rigName: "res://hydrilla/scene.glb",
        channels: "StandardMaterial3D PBR",
        fps: "127.0.0.1:7345",
      },
      "about-lab": {
        badge: "Hawan Research Labs",
        rigName: "BlueFox Model Family",
        channels: "Geometry · Segmentation · PBR",
        fps: "Hydrilla Studio Runtime",
      },
    };
    const meta = labelMap[variant] ?? labelMap["critter-rig"];

    return (
      <div className="pickle-thumb-inner relative flex h-full w-full items-center justify-center overflow-hidden bg-[#000000]">
        <svg
          viewBox="0 0 800 500"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="800" height="500" fill="#000000" />
          {/* Subtle studio floor grid */}
          <ellipse cx="400" cy="410" rx="220" ry="38" fill="url(#rigFloorGlow)" opacity="0.55" />
          <ellipse
            cx="400"
            cy="410"
            rx="165"
            ry="24"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeDasharray="4 6"
          />

          {/* Sculpted 3D character/mesh form in center with yellow/orange/cyan rig control cages */}
          <g transform="translate(400, 245)">
            {/* Outer 3D bounding rig cage (orange/amber wireframes like Pickle Critter) */}
            <rect
              x="-96"
              y="-148"
              width="192"
              height="296"
              rx="18"
              stroke="#f59e0b"
              strokeOpacity="0.42"
              strokeWidth="1.25"
            />
            <ellipse
              cx="0"
              cy="-76"
              rx="88"
              ry="62"
              stroke="#fbbf24"
              strokeOpacity="0.65"
              strokeWidth="1.4"
            />
            <ellipse
              cx="0"
              cy="34"
              rx="74"
              ry="88"
              stroke="#38bdf8"
              strokeOpacity="0.45"
              strokeWidth="1.25"
            />

            {/* Sculpted matte gray 3D mesh body */}
            <path
              d="M-56 -32 C-66 -92, -48 -132, 0 -132 C48 -132, 66 -92, 56 -32 C68 18, 64 88, 42 126 C24 142, -24 142, -42 126 C-64 88, -68 18, -56 -32 Z"
              fill="url(#meshBodyGrad)"
            />

            {/* Expressive yellow visor/eyes inspired by Critter */}
            <rect x="-46" y="-102" width="42" height="36" rx="16" fill="#facc15" />
            <rect x="4" y="-102" width="42" height="36" rx="16" fill="#facc15" />
            <circle cx="-22" cy="-84" r="9" fill="#09090b" />
            <circle cx="22" cy="-84" r="9" fill="#09090b" />

            {/* Rig control rings & spline handles */}
            <ellipse
              cx="0"
              cy="-84"
              rx="78"
              ry="22"
              stroke="#fde047"
              strokeOpacity="0.8"
              strokeWidth="1.5"
            />
            <ellipse
              cx="0"
              cy="-18"
              rx="66"
              ry="16"
              stroke="#fde047"
              strokeOpacity="0.65"
              strokeWidth="1.3"
            />
            <ellipse
              cx="0"
              cy="46"
              rx="72"
              ry="18"
              stroke="#fde047"
              strokeOpacity="0.7"
              strokeWidth="1.3"
            />
            <ellipse
              cx="0"
              cy="104"
              rx="58"
              ry="14"
              stroke="#38bdf8"
              strokeOpacity="0.7"
              strokeWidth="1.3"
            />

            {/* Joint nodes */}
            <circle cx="0" cy="-84" r="3.5" fill="#fde047" />
            <circle cx="0" cy="-18" r="3.5" fill="#fde047" />
            <circle cx="0" cy="46" r="3.5" fill="#38bdf8" />
            <circle cx="0" cy="104" r="3.5" fill="#38bdf8" />
            <line
              x1="0"
              y1="-84"
              x2="0"
              y2="104"
              stroke="#fde047"
              strokeOpacity="0.5"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </g>

          {/* Left & Right subtle viewport labels */}
          <text
            x="42"
            y="52"
            fill="#ffffff"
            fillOpacity="0.48"
            fontSize="13"
            fontWeight="500"
            fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
          >
            {meta.badge}
          </text>
          <text
            x="42"
            y="340"
            fill="#f59e0b"
            fillOpacity="0.65"
            fontSize="13"
            fontWeight="500"
            fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
          >
            {meta.rigName}
          </text>
          <text
            x="42"
            y="456"
            fill="#ffffff"
            fillOpacity="0.38"
            fontSize="12.5"
            fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
          >
            {meta.channels}
          </text>
          <text
            x="758"
            y="456"
            textAnchor="end"
            fill="#ffffff"
            fillOpacity="0.38"
            fontSize="12.5"
            fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
          >
            {meta.fps}
          </text>

          <defs>
            <radialGradient id="rigFloorGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="meshBodyGrad" x1="0" y1="-132" x2="0" y2="142" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="55%" stopColor="#52525b" />
              <stop offset="100%" stopColor="#27272a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Light #f5f5f7 Architectural Flowchart diagram (like "How your Pickle protects your privacy" in screenshot)
  const diagramMap: Record<
    string,
    {
      col1Title: string;
      col1Sub: string;
      col1Box: string;
      col1BoxSub: string;
      col2Title: string;
      col2Sub: string;
      col2Box: string;
      col2BoxSub: string;
      col3Title: string;
      col3Sub: string;
      col3Box1: string;
      col3Box1Sub: string;
      col3Box2: string;
      col3Box2Sub: string;
      col4Title: string;
      col4Sub: string;
      col4Box: string;
    }
  > = {
    "privacy-enclave": {
      col1Title: "Your Browser",
      col1Sub: "Hydrilla Studio",
      col1Box: "Clerk Session Key",
      col1BoxSub: "user-scoped JWT",
      col2Title: "Hydrilla Cloud",
      col2Sub: "isolated workspace",
      col2Box: "Your Workspace",
      col2BoxSub: "private meshes & maps",
      col3Title: "BlueFox Enclave",
      col3Sub: "Hawan Research Labs",
      col3Box1: "Ephemeral Job",
      col3Box1Sub: "erased when run ends",
      col3Box2: "Signed Asset URL",
      col3Box2Sub: "scoped to account",
      col4Title: "Your Engine",
      col4Sub: "local pipeline",
      col4Box: "GLB / FBX / USDZ",
    },
    "pipeline-arch": {
      col1Title: "Input Prompt",
      col1Sub: "Text or Reference",
      col1Box: "Concept Frame",
      col1BoxSub: "silhouette & material lock",
      col2Title: "BlueFox 1",
      col2Sub: "Hawan Research Labs",
      col2Box: "Part Segmentation",
      col2BoxSub: "logical mesh sub-parts",
      col3Title: "PBR Synthesis",
      col3Sub: "4-channel bake",
      col3Box1: "Geometry & UVs",
      col3Box1Sub: "clean surface normals",
      col3Box2: "Material Maps",
      col3Box2Sub: "albedo · rough · metal",
      col4Title: "DCC & Engine",
      col4Sub: "production handoff",
      col4Box: "Unity · Unreal · Blender",
    },
    "compare-meshy": {
      col1Title: "Prompt / Image",
      col1Sub: "studio input",
      col1Box: "Reference Lock",
      col1BoxSub: "controlled framing",
      col2Title: "Hydrilla Studio",
      col2Sub: "BlueFox 1 runtime",
      col2Box: "Segmented Mesh",
      col2BoxSub: "separated logical parts",
      col3Title: "Production Export",
      col3Sub: "PBR + UV unwrap",
      col3Box1: "In-Browser Inspect",
      col3Box1Sub: "wireframe & matcap",
      col3Box2: "Multi-Format File",
      col3Box2Sub: "GLB · FBX · OBJ · USDZ",
      col4Title: "Target Scene",
      col4Sub: "zero rebuild",
      col4Box: "Engine Handoff",
    },
    "compare-luma": {
      col1Title: "Source Input",
      col1Sub: "prompt or photo",
      col1Box: " Asset Brief",
      col1BoxSub: "prop or character",
      col2Title: "Representation",
      col2Sub: "mesh vs splat",
      col2Box: "Polygonal Mesh",
      col2BoxSub: "editable vertices & UVs",
      col3Title: "Material Pipeline",
      col3Sub: "relit in any engine",
      col3Box1: "PBR Channels",
      col3Box1Sub: "reacts to scene lights",
      col3Box2: "Part Hierarchy",
      col3Box2Sub: "rig & animate ready",
      col4Title: "Game / VFX",
      col4Sub: "standard DCC",
      col4Box: "Unreal · Blender",
    },
    "docs-flow": {
      col1Title: "1. Workspace",
      col1Sub: "account setup",
      col1Box: "Prompt or Image",
      col1BoxSub: "describe subject & style",
      col2Title: "2. Generate",
      col2Sub: "BlueFox 1 job",
      col2Box: "3D Synthesis",
      col2BoxSub: "30–45 credits default",
      col3Title: "3. Preview",
      col3Sub: "browser viewport",
      col3Box1: "Inspect Topology",
      col3Box1Sub: "parts & silhouette",
      col3Box2: "Verify PBR Maps",
      col3Box2Sub: "under studio lighting",
      col4Title: "4. Export",
      col4Sub: "direct download",
      col4Box: "GLB · FBX · USDZ",
    },
    "api-stream": {
      col1Title: "Your Backend",
      col1Sub: "hyd_live_ key",
      col1Box: "POST /v1/3d/tasks",
      col1BoxSub: "Bearer authentication",
      col2Title: "Job Queue",
      col2Sub: "async worker pool",
      col2Box: "Task Status",
      col2BoxSub: "WAIT → RUN → DONE",
      col3Title: "BlueFox 1 Worker",
      col3Sub: "GPU synthesis",
      col3Box1: "Mesh Compiler",
      col3Box1Sub: "segmented geometry",
      col3Box2: "Texture Baker",
      col3Box2Sub: "PBR map bundle",
      col4Title: "Webhook / Poll",
      col4Sub: "result payload",
      col4Box: "result.mesh_url",
    },
  };

  const d = diagramMap[variant] ?? diagramMap["pipeline-arch"];

  return (
    <div className="pickle-thumb-inner relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f6f6f6]">
      <svg
        viewBox="0 0 800 500"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="800" height="500" fill="#f6f6f6" />

        {/* Column 1 */}
        <rect x="24" y="38" width="160" height="424" rx="22" fill="#ebebee" />
        <text
          x="104"
          y="74"
          textAnchor="middle"
          fill="#111111"
          fontSize="13.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col1Title}
        </text>
        <text
          x="104"
          y="93"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11.5"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col1Sub}
        </text>
        <rect
          x="38"
          y="165"
          width="132"
          height="78"
          rx="14"
          fill="#ffffff"
          stroke="#e4e4e7"
        />
        <text
          x="104"
          y="198"
          textAnchor="middle"
          fill="#111111"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col1Box}
        </text>
        <text
          x="104"
          y="218"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col1BoxSub}
        </text>

        {/* Column 2 */}
        <rect x="212" y="38" width="176" height="424" rx="22" fill="#ebebee" />
        <text
          x="300"
          y="74"
          textAnchor="middle"
          fill="#111111"
          fontSize="13.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col2Title}
        </text>
        <text
          x="300"
          y="93"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11.5"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col2Sub}
        </text>
        <rect
          x="228"
          y="290"
          width="144"
          height="78"
          rx="14"
          fill="#ffffff"
          stroke="#e4e4e7"
        />
        <text
          x="300"
          y="324"
          textAnchor="middle"
          fill="#111111"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col2Box}
        </text>
        <text
          x="300"
          y="344"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col2BoxSub}
        </text>

        {/* Column 3 (Highlighted Enclave / Synthesis column) */}
        <rect x="416" y="38" width="184" height="424" rx="22" fill="#e2e2e6" />
        <text
          x="508"
          y="74"
          textAnchor="middle"
          fill="#111111"
          fontSize="13.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Title}
        </text>
        <text
          x="508"
          y="93"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11.5"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Sub}
        </text>
        <rect
          x="432"
          y="165"
          width="152"
          height="78"
          rx="14"
          fill="#ffffff"
          stroke="#d4d4d8"
        />
        <text
          x="508"
          y="198"
          textAnchor="middle"
          fill="#111111"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Box1}
        </text>
        <text
          x="508"
          y="218"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Box1Sub}
        </text>

        <rect
          x="432"
          y="290"
          width="152"
          height="78"
          rx="14"
          fill="#ffffff"
          stroke="#d4d4d8"
        />
        <text
          x="508"
          y="324"
          textAnchor="middle"
          fill="#111111"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Box2}
        </text>
        <text
          x="508"
          y="344"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col3Box2Sub}
        </text>

        {/* Column 4 */}
        <rect x="626" y="38" width="150" height="424" rx="22" fill="#ebebee" />
        <text
          x="701"
          y="74"
          textAnchor="middle"
          fill="#111111"
          fontSize="13.5"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col4Title}
        </text>
        <text
          x="701"
          y="93"
          textAnchor="middle"
          fill="#71717a"
          fontSize="11.5"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col4Sub}
        </text>
        <rect
          x="640"
          y="290"
          width="122"
          height="78"
          rx="14"
          fill="#ffffff"
          stroke="#e4e4e7"
        />
        <text
          x="701"
          y="333"
          textAnchor="middle"
          fill="#111111"
          fontSize="12"
          fontWeight="600"
          fontFamily="ABC Diatype Unlicensed Trial, Suisse Intl, sans-serif"
        >
          {d.col4Box}
        </text>

        {/* Connector Arrows */}
        <line
          x1="170"
          y1="204"
          x2="430"
          y2="204"
          stroke="#52525b"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        <line x1="508" y1="243" x2="508" y2="288" stroke="#52525b" strokeWidth="1.4" />
        <line x1="372" y1="329" x2="430" y2="329" stroke="#52525b" strokeWidth="1.4" />
        <line x1="584" y1="329" x2="638" y2="329" stroke="#111111" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * Pickle Whitepaper Video Player (`WhitepaperPlayer-BL3bqXE8.css`)
 * Replicates the exact 58px-rounded (or 42px inline) video player from
 * https://pickle.com/how-we-make-critter-act-in-real-time
 */
export function PickleVideoPlayer({
  src,
  poster,
  variant = "hero",
}: {
  src: string;
  poster?: string;
  variant?: "hero" | "inline";
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:12");

  const formatSec = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      v.parentElement?.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      className="pickle-player-frame group"
      data-variant={variant === "inline" ? "inline" : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(formatSec(v.currentTime));
          if (v.duration > 0) {
            setDuration(formatSec(v.duration));
            setProgress((v.currentTime / v.duration) * 100);
          }
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration > 0) {
            setDuration(formatSec(e.currentTarget.duration));
          }
        }}
        className="pickle-player-media"
      />
      <div className="pickle-player-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="pickle-player-bar opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="pickle-player-btn"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                fill="currentColor"
                d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712"
              />
            </svg>
          )}
        </button>

        <div className="pickle-player-progress-group">
          <span className="pickle-player-time">{currentTime}</span>
          <div
            className="pickle-player-track"
            onClick={(e) => {
              const v = videoRef.current;
              if (!v || !v.duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
              v.currentTime = ratio * v.duration;
            }}
          >
            <div className="pickle-player-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="pickle-player-time pickle-player-duration">{duration}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="pickle-player-btn"
          >
            {muted ? (
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  <polygon points="1.75 5.75 1.75 10.25 4.25 10.25 8.25 13.25 8.25 2.75 4.25 5.75" />
                  <path d="m14.25 5.75-3.5 4.5m0-4.5 3.5 4.5" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  <polygon points="1.75 5.75 1.75 10.25 4.25 10.25 8.25 13.25 8.25 2.75 4.25 5.75" />
                  <path d="m10.75 6.25s1 .5 1 1.75-1 1.75-1 1.75m1-6.5c2 1 3 2.5 3 4.75s-1 3.75-3 4.75" />
                </g>
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Enter fullscreen mode"
            className="pickle-player-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.5 5.5H16a1.5 1.5 0 0 1 0-3h3A2.5 2.5 0 0 1 21.5 5v3a1.5 1.5 0 0 1-3 0zM8 5.5H5.5V8a1.5 1.5 0 1 1-3 0V5A2.5 2.5 0 0 1 5 2.5h3a1.5 1.5 0 1 1 0 3m0 13H5.5V16a1.5 1.5 0 0 0-3 0v3A2.5 2.5 0 0 0 5 21.5h3a1.5 1.5 0 0 0 0-3m8 0h2.5V16a1.5 1.5 0 0 1 3 0v3a2.5 2.5 0 0 1-2.5 2.5h-3a1.5 1.5 0 0 1 0-3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pickle Research Card (`_card_o215o_48`)
 * Used in 2-column grids on Research, Compare, Blog, Integrations, etc.
 */
export function PickleResearchCard({ item }: { item: PickleRelatedItem }) {
  return (
    <li>
      <Link href={item.href} className="pickle-research-card">
        <span className="pickle-research-thumbnail">
          <PickleVisualThumb
            variant={item.thumbVariant}
            imageSrc={item.imageSrc}
            videoSrc={item.videoSrc}
            alt={item.title}
          />
        </span>
        <h2 className="pickle-research-card-title">{item.title}</h2>
        {item.subtitle ? (
          <p className="pickle-research-card-subtitle">{item.subtitle}</p>
        ) : null}
        <div className="pickle-research-card-meta">
          <span>{item.date || "Oct 2026"}</span>
          <span className="pickle-research-card-divider" aria-hidden="true" />
          <span>{item.author || "Hydrilla Team"}</span>
        </div>
      </Link>
    </li>
  );
}

/**
 * Pickle Research Index Layout (`https://pickle.com/research`)
 * Left-aligned header in `min(980px, 100% - 80px)` + 2-column grid (`repeat(2, minmax(0, 1fr))`, `gap: 56px 24px`).
 */
export function PickleResearchPage({
  title,
  description,
  items,
  children,
  footer = true,
}: {
  title: string;
  description: string | string[];
  items?: PickleRelatedItem[];
  children?: ReactNode;
  footer?: boolean;
}) {
  return (
    <>
      <div className="pickle-research-page">
        <header className="pickle-research-hero">
          <h1 className="pickle-research-title">{title}</h1>
          {(Array.isArray(description) ? description : [description]).map((line) => (
            <p key={line} className="pickle-research-description">
              {line}
            </p>
          ))}
        </header>

        {items && items.length > 0 ? (
          <ul className="pickle-research-grid">
            {items.map((item) => (
              <PickleResearchCard key={item.href + item.title} item={item} />
            ))}
          </ul>
        ) : null}

        {children}
      </div>
      {footer ? <Footer /> : null}
    </>
  );
}

/**
 * Pickle Article / Whitepaper Layout (`https://pickle.com/how-we-make-critter-act-in-real-time`)
 * Centered header (`clamp(600px, 100% - 80px, 980px)`, `margin: 105px auto 0`, `gap: 18px`)
 * + Main column (`clamp(600px, 100% - 80px, 980px)`, `margin: 61px auto 0`, `gap: 72px`).
 */
export function PickleArticlePage({
  kicker,
  kickerHref,
  title,
  subtitle,
  date = "Oct 2026",
  author = "Hydrilla Team",
  wideTitle = false,
  heroVideoSrc,
  heroPosterSrc,
  heroThumbVariant,
  children,
  relatedItems,
  relatedHeading = "Continue reading",
  ctaLabel,
  ctaHref,
  footnote,
  footer = true,
}: {
  kicker?: string;
  kickerHref?: string;
  title: string;
  subtitle?: string;
  date?: string;
  author?: string;
  wideTitle?: boolean;
  heroVideoSrc?: string;
  heroPosterSrc?: string;
  heroThumbVariant?: PickleThumbVariant;
  children: ReactNode;
  relatedItems?: PickleRelatedItem[];
  relatedHeading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  footnote?: ReactNode;
  footer?: boolean;
}) {
  return (
    <>
      <article className="pickle-article">
        <header className="pickle-article-header">
          {kicker ? (
            <p className="pickle-article-kicker">
              {kickerHref ? <Link href={kickerHref}>{kicker}</Link> : kicker}
            </p>
          ) : null}
          <h1
            className="pickle-article-title"
            data-wide={wideTitle ? "true" : undefined}
          >
            {title}
          </h1>
          {subtitle ? <p className="pickle-article-subtitle">{subtitle}</p> : null}
          <div className="pickle-article-meta">
            <span>{date}</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>{author}</span>
          </div>
        </header>

        <div className="pickle-article-column">
          {heroVideoSrc ? (
            <div className="pickle-hero-group">
              <PickleVideoPlayer src={heroVideoSrc} poster={heroPosterSrc} variant="hero" />
            </div>
          ) : heroThumbVariant || heroPosterSrc ? (
            <div className="pickle-hero-group">
              <div
                className="pickle-player-frame"
                data-variant={
                  heroThumbVariant &&
                  ![
                    "critter-rig",
                    "compare-tripo",
                    "compare-field",
                    "unity-engine",
                    "unreal-engine",
                    "godot-engine",
                    "about-lab",
                  ].includes(heroThumbVariant)
                    ? "light"
                    : undefined
                }
              >
                <div className="pickle-player-media">
                  <PickleVisualThumb
                    variant={heroThumbVariant}
                    imageSrc={heroPosterSrc}
                    alt={title}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {children}

          {ctaLabel && ctaHref ? (
            <div className="pickle-closing">
              <Link href={ctaHref} className="pickle-glass-pill">
                {ctaLabel}
              </Link>
              {footnote ? <p className="pickle-license">{footnote}</p> : null}
            </div>
          ) : footnote ? (
            <div className="pickle-closing">
              <p className="pickle-license">{footnote}</p>
            </div>
          ) : null}

          {relatedItems && relatedItems.length > 0 ? (
            <section className="pickle-section" style={{ width: "100%", marginTop: "12px" }}>
              <div className="w-full">
                <h2
                  className="pickle-h2"
                  style={{ width: "100%", marginBottom: "36px" }}
                >
                  {relatedHeading}
                </h2>
                <ul
                  className="pickle-research-grid"
                  style={{ width: "100%", marginTop: 0 }}
                >
                  {relatedItems.map((item) => (
                    <PickleResearchCard key={item.href + item.title} item={item} />
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      </article>
      {footer ? <Footer /> : null}
    </>
  );
}

/**
 * Rounded media frame for real product imagery. `hero` gets the larger radius
 * and lifted shadow used directly under a page header.
 */
export function PickleMedia({
  src,
  alt,
  caption,
  ratio = "16 / 10",
  fit = "cover",
  tone,
  hero = false,
  videoSrc,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  ratio?: string;
  fit?: "cover" | "contain";
  tone?: "white" | "dark";
  hero?: boolean;
  videoSrc?: string;
}) {
  return (
    <figure className="pickle-figure" style={hero ? undefined : { maxWidth: 760, marginInline: "auto" }}>
      <div
        className="pickle-media"
        data-hero={hero ? "true" : undefined}
        data-fit={fit}
        data-tone={tone}
        style={{ aspectRatio: ratio }}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            poster={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 700px) 100vw, 980px"
            loading={hero ? "eager" : "lazy"}
            fetchPriority={hero ? "high" : undefined}
          />
        )}
      </div>
      {caption ? <figcaption className="pickle-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export type PickleMediaItem = {
  src: string;
  alt: string;
  label?: ReactNode;
  fit?: "cover" | "contain";
  tone?: "white" | "dark";
};

/** Two- or three-up row of media frames, each with an optional label under it. */
export function PickleMediaGrid({
  items,
  ratio = "4 / 3",
}: {
  items: PickleMediaItem[];
  ratio?: string;
}) {
  return (
    <figure
      className="pickle-media-grid"
      style={{ "--cols": items.length } as React.CSSProperties}
    >
      {items.map((item) => (
        <div key={item.src}>
          <div
            className="pickle-media"
            data-fit={item.fit ?? "cover"}
            data-tone={item.tone}
            style={{ aspectRatio: ratio }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes={`(max-width: 700px) 100vw, ${Math.round(980 / items.length)}px`}
            />
          </div>
          {item.label ? <p className="pickle-media-label">{item.label}</p> : null}
        </div>
      ))}
    </figure>
  );
}

export type PickleCardItem = {
  title: ReactNode;
  body: ReactNode;
  icon?: NavIconName;
  imageSrc?: string;
  imageAlt?: string;
};

/** Soft grey feature cards. Title heading level follows the page outline via `titleAs`. */
export function PickleCards({
  cards,
  columns = 2,
  titleAs: TitleTag = "h3",
}: {
  cards: readonly PickleCardItem[];
  columns?: 2 | 3;
  titleAs?: "h3" | "p";
}) {
  return (
    <ul className="pickle-cards" style={{ "--cols": columns } as React.CSSProperties}>
      {cards.map((card, i) => (
        <li key={i}>
          <div className="pickle-card">
            {card.imageSrc ? (
              <div className="pickle-card-media">
                <Image
                  src={card.imageSrc}
                  alt={card.imageAlt ?? ""}
                  fill
                  sizes={`(max-width: 700px) 100vw, ${Math.round(980 / columns)}px`}
                />
              </div>
            ) : card.icon ? (
              <span className="pickle-card-icon">
                <NavIcon name={card.icon} className="h-11 w-11" />
              </span>
            ) : null}
            <TitleTag className="pickle-card-title">{card.title}</TitleTag>
            <div className="pickle-card-body">{card.body}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export type PickleLinkItem = {
  title: string;
  href: string;
  line?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  imageTone?: "dark" | "white";
  icon?: NavIconName;
  /** Large type set inside the thumbnail when there is no image. */
  tileLabel?: string;
  tileDetail?: string;
  external?: boolean;
};

/** Research-style link cards (16:10 thumbnail, title, one line) for hub pages. */
export function PickleLinkCards({
  items,
  columns = 2,
}: {
  items: readonly PickleLinkItem[];
  columns?: 2 | 3;
}) {
  return (
    <ul className="pickle-link-cards" style={{ "--cols": columns } as React.CSSProperties}>
      {items.map((item) => {
        const inner = (
          <>
            <span
              className="pickle-research-thumbnail"
              data-fit={item.imageFit}
              data-tone={item.imageTone}
            >
              {item.imageSrc ? (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt ?? ""}
                  fill
                  sizes={`(max-width: 700px) 100vw, ${Math.round(980 / columns)}px`}
                />
              ) : (
                <span className="pickle-thumb-inner pickle-icon-tile">
                  {item.tileLabel ? (
                    <span className="pickle-tile-type">
                      <span className="pickle-tile-label">{item.tileLabel}</span>
                      {item.tileDetail ? (
                        <span className="pickle-tile-detail">{item.tileDetail}</span>
                      ) : null}
                    </span>
                  ) : item.icon ? (
                    <NavIcon name={item.icon} className="h-[72px] w-[72px]" />
                  ) : null}
                </span>
              )}
            </span>
            <span className="pickle-link-card-title">{item.title}</span>
            {item.line ? <span className="pickle-link-card-line">{item.line}</span> : null}
          </>
        );
        return (
          <li key={item.href}>
            {item.external ? (
              <a href={item.href} className="pickle-research-card">
                {inner}
              </a>
            ) : (
              <Link href={item.href} className="pickle-research-card">
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FlowArrow() {
  return (
    <span className="pickle-flow-arrow" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export type PickleFlowStep = { title: string; detail?: string; emphasis?: boolean };

/** Node-and-arrow diagram drawn in HTML, so its labels stay real text. */
export function PickleFlow({
  steps,
  direction = "row",
  label,
}: {
  steps: readonly PickleFlowStep[];
  direction?: "row" | "column";
  label: string;
}) {
  return (
    <figure className="pickle-flow" data-direction={direction} role="img" aria-label={label}>
      {steps.map((step, i) => (
        <React.Fragment key={step.title}>
          {i > 0 ? <FlowArrow /> : null}
          <div className="pickle-flow-node" data-emphasis={step.emphasis ? "true" : undefined}>
            <span className="pickle-flow-title">{step.title}</span>
            {step.detail ? <span className="pickle-flow-detail">{step.detail}</span> : null}
          </div>
        </React.Fragment>
      ))}
    </figure>
  );
}

/** Divided question-and-answer list. */
export function PickleQA({ items }: { items: readonly { q: ReactNode; a: ReactNode }[] }) {
  return (
    <dl className="pickle-qa">
      {items.map((item, i) => (
        <div key={i} className="pickle-qa-item">
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}

export type PickleAction = { label: string; href: string; download?: boolean };

/** Solid primary + outlined secondary pill pair. Plain anchors for files and downloads. */
export function PickleActions({
  primary,
  secondary,
  align = "center",
}: {
  primary?: PickleAction;
  secondary?: PickleAction;
  align?: "center" | "start";
}) {
  const render = (action: PickleAction, className: string) =>
    action.download || /^(https?:|mailto:|#)|\.zip$/.test(action.href) ? (
      <a href={action.href} className={className} download={action.download || undefined}>
        {action.label}
      </a>
    ) : (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  return (
    <div className="pickle-actions" data-align={align === "start" ? "start" : undefined}>
      {primary ? render(primary, "pickle-pill-solid") : null}
      {secondary ? render(secondary, "pickle-pill-ghost") : null}
    </div>
  );
}

/** Closing call-to-action panel at the end of a page column. */
export function PickleCta({
  title,
  line,
  primary,
  secondary,
  id,
}: {
  title?: ReactNode;
  line?: ReactNode;
  primary?: PickleAction;
  secondary?: PickleAction;
  id?: string;
}) {
  return (
    <section id={id} className={`pickle-cta${id ? " scroll-mt-28" : ""}`}>
      {title ? <h2 className="pickle-cta-title">{title}</h2> : null}
      {line ? <p className="pickle-cta-line">{line}</p> : null}
      {primary || secondary ? <PickleActions primary={primary} secondary={secondary} /> : null}
    </section>
  );
}

/** Dark code panel: one or more labelled panes (request, response). */
export function PickleCode({
  panes,
  label,
}: {
  panes: readonly { title: string; code: string }[];
  label: string;
}) {
  return (
    <figure className="pickle-code" aria-label={label}>
      {panes.map((pane) => (
        <div key={pane.title} className="pickle-code-pane">
          <div className="pickle-code-bar">
            <span className="pickle-code-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{pane.title}</span>
          </div>
          <pre>
            <code>{pane.code}</code>
          </pre>
        </div>
      ))}
    </figure>
  );
}

/** Reserved slot for a capture that doesn't exist yet. `alt` is the kit's alt text. */
export function PicklePlaceholder(_props: { alt: string; ratio?: string }) {
  // Intentionally renders nothing until the real capture exists, so no empty box leaves a gap.
  return null;
}

/** The BlueFox video in the original 16:9 Pickle player frame, used as the page hero. */
export function PickleHeroVideo() {
  return (
    <div className="pickle-hero-group">
      <PickleVideoPlayer
        src={WHY_HYDRILLA_MEDIA.bluefox.video}
        poster={WHY_HYDRILLA_MEDIA.bluefox.poster}
        variant="hero"
      />
    </div>
  );
}
