import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f5f3ef",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            EC
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#16a34a", letterSpacing: "0.15em" }}>
            CILENTO &amp; VALLO DI DIANO
          </span>
        </div>

        {/* Titolo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#1c1917", lineHeight: 1, letterSpacing: "-3px" }}>
            Scopri gli
          </span>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#65a30d", lineHeight: 1, letterSpacing: "-3px" }}>
            eventi
          </span>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#1c1917", lineHeight: 1, letterSpacing: "-3px" }}>
            del Cilento.
          </span>
        </div>

        {/* Sottotitolo */}
        <div style={{ display: "flex", marginBottom: 48 }}>
          <span style={{ fontSize: 24, color: "#78716c", fontWeight: 600 }}>
            Sagre · Concerti · Mostre · Sport · Natura
          </span>
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["🎶 Musica", "🌊 Mare", "🍽️ Cibo", "🏛️ Cultura", "🌿 Natura"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 100,
                background: "white",
                color: "#44403c",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
