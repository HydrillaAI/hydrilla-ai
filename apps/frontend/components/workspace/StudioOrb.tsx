"use client";

import { ThinkingOrb, type OrbState, type OrbTheme } from "thinking-orbs";

type Props = {
  state?: OrbState;
  size?: 64 | 32 | 20;
  theme?: OrbTheme;
};

/** "auto" follows the nearest `dark` class, so the orb inverts with the theme. */
export function StudioOrb({ state = "searching", size = 64, theme = "auto" }: Props) {
  return <ThinkingOrb state={state} size={size} theme={theme} />;
}
