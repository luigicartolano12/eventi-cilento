import Link from "next/link";

export function Header() {
  return (
    <header style={{ background: "#1a3529" }}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: "#4ade80", color: "#0f2318" }}
          >
            EC
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Eventi Cilento
          </span>
        </Link>
        <span
          className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)", color: "#86efac" }}
        >
          BETA
        </span>
      </div>
    </header>
  );
}
