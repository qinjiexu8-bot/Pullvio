import { ImageResponse } from "next/og";

export const alt = "Pullvio private beta — a cleaner online media tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", color: "#f2f7f5", background: "radial-gradient(circle at 78% 28%, #153a31 0%, #071012 42%, #050b0d 100%)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 800 }}><div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, color: "#07120e", background: "#7cf3c5", fontSize: 28 }}>▶</div>pullvio</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}><div style={{ color: "#7cf3c5", fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>PRIVATE BETA · BUILDING IN PUBLIC</div><div style={{ maxWidth: 880, fontSize: 72, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>A cleaner online media tool.</div><div style={{ maxWidth: 760, color: "#9aaba7", fontSize: 25, lineHeight: 1.45 }}>Product principles, delivery roadmap, and practical guides—before media processing goes live.</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#70817d", fontSize: 17 }}><span>pullvio.com</span><span>No fake downloads · No payment yet</span></div>
    </div>, size,
  );
}
