import Link from "next/link";

export function Footer() {
  const anno = new Date().getFullYear();
  return (
    <footer style={{ background: "#f5f3ef", borderTop: "1px solid rgba(0,0,0,0.06)" }} className="text-stone-500 mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: "#16a34a", color: "white" }}
              >
                EC
              </div>
              <span className="text-stone-900 font-bold text-base tracking-tight">
                Eventi Cilento
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-500">
              La guida agli eventi del Parco Nazionale del Cilento e Vallo di Diano.
            </p>
          </div>

          {/* Esplora */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#166534" }}>
              Esplora
            </p>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Eventi
              </Link>
              <Link href="/esperienze" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Esperienze
              </Link>
              <Link href="/locali" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Locali &amp; Serate
              </Link>
              <Link href="/proponi" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Proponi un evento
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#166534" }}>
              Account
            </p>
            <div className="flex flex-col gap-2.5">
              <Link href="/registrati" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Registrati
              </Link>
              <Link href="/profilo" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Il tuo profilo
              </Link>
            </div>
          </div>

        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <p className="text-stone-400">
            © {anno} Eventi Cilento — Cilento e Vallo di Diano
          </p>
          <p className="text-stone-400">
            Fatto con cura per il territorio
          </p>
        </div>
      </div>
    </footer>
  );
}
