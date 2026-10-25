import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title") || "Hydrilla API Docs";
  const method = (searchParams.get("method") || "").toUpperCase();
  const title = rawTitle.slice(0, 90);

  const badgeColors: Record<string, { bg: string; fg: string; border: string }> = {
    GET: { bg: "#F4F4F5", fg: "#0A0A0A", border: "#D4D4D8" },
    POST: { bg: "#0A0A0A", fg: "#FFFFFF", border: "#0A0A0A" },
  };
  const badge = badgeColors[method] ?? { bg: "#F4F4F5", fg: "#0A0A0A", border: "#D4D4D8" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          padding: "72px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, background: "#0A0A0A", display: "flex" }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0A0A0A", display: "flex" }}>
            Hydrilla API Docs
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {method ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: badge.bg,
                color: badge.fg,
                border: `1px solid ${badge.border}`,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 1,
                padding: "8px 16px",
                borderRadius: 6,
              }}
            >
              {method}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#0A0A0A", lineHeight: 1.1 }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#5F6775" }}>docs.hydrilla.ai</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
