import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Enterprise AI 3D Workspace, Agent & Plugins | Hydrilla AI",
  description:
    "Hydrilla Enterprise gives studios BlueFox, Water Agent, native 3D plugins for Blender, Unity, Unreal, and Godot, MCP server, and REST API concurrency. Book a demo.",
  ogTitle: "Hydrilla for Enterprise: AI 3D Workspace, Agent & Plugins for Studios",
  path: "/enterprise",
  absoluteTitle: true,
  keywords: [
    "Enterprise AI 3D generator",
    "Enterprise AI 3D workspace",
    "AI 3D agent for studios",
    "Water Agent AI 3D",
    "BlueFox 3D model",
    "Blender AI 3D plugin",
    "Unity AI 3D plugin",
    "Unreal Engine AI 3D plugin",
    "Godot 4 AI 3D plugin",
    "MCP server 3D generation",
    "Enterprise 3D REST API",
    "Commercial AI 3D platform",
  ],
});

export default function EnterpriseLayout({ children }: { children: ReactNode }) {
  return children;
}
