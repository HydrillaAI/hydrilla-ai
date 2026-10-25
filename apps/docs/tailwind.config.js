const path = require("node:path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    path.join(__dirname, "./app/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./components/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./lib/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--bg)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        ink: "var(--text)",
        "ink-2": "var(--text-2)",
        "ink-3": "var(--text-3)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
        },
        aqua: {
          DEFAULT: "var(--aqua)",
          soft: "var(--aqua-soft)",
          fg: "var(--aqua-fg)",
        },
        code: "var(--surface-code)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0" }],
        small: ["14px", { lineHeight: "22px", letterSpacing: "-0.006em" }],
        code: ["13px", { lineHeight: "22px", letterSpacing: "0" }],
        body: ["16px", { lineHeight: "26px", letterSpacing: "-0.011em" }],
        h3: ["16px", { lineHeight: "24px", letterSpacing: "-0.015em" }],
        h2: ["20px", { lineHeight: "28px", letterSpacing: "-0.02em" }],
        h1: ["32px", { lineHeight: "40px", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      maxWidth: {
        prose: "720px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,.04), 0 8px 24px -16px rgba(10,10,10,.18)",
      },
    },
  },
  plugins: [],
};
