import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: 56,
            fontFamily: "sans-serif",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          EC
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            fontWeight: 700,
            fontSize: 18,
            fontFamily: "sans-serif",
            letterSpacing: "2px",
          }}
        >
          CILENTO
        </div>
      </div>
    ),
    { ...size }
  );
}
