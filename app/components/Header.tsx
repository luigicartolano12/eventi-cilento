import Link from "next/link";
import { IcoSend } from "./icons";
import { UserButton } from "./UserButton";

export function Header() {
  return (
    <header style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      {/* Banner beta */}
      <div
        className="w-full text-center py-1.5 text-[11px] font-bold tracking-wide"
        style={{ background: "#fef3c7", color: "#92400e" }}
      >
        🌿 Versione Beta — stiamo aggiungendo nuovi contenuti ogni giorno
      </div>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: "#16a34a", color: "white" }}
          >
            EC
          </div>
          <span className="text-stone-900 font-bold text-lg tracking-tight">
            Eventi Cilento
          </span>
        </Link>

        {/* Nav centrale — solo desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/esperienze"
            className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-stone-100"
            style={{ color: "#166534" }}
          >
            Esperienze
          </Link>
          <Link
            href="/notte"
            className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-stone-100"
            style={{ color: "#166534" }}
          >
            Notte
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/proponi"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: "rgba(22,101,52,0.08)", color: "#166534" }}
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
