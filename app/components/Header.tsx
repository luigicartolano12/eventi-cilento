import Link from "next/link";
import { IcoSend } from "./icons";
import { UserButton } from "./UserButton";

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

        {/* Nav centrale */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/esperienze"
            className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
            style={{ color: "#86efac" }}
          >
            Esperienze
          </Link>
          <Link
            href="/locali"
            className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
            style={{ color: "#86efac" }}
          >
            Locali
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/proponi"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.10)", color: "#86efac" }}
          >
            <IcoSend size={12} />
            Proponi
          </Link>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
