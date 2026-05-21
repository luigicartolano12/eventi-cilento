import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex-1 flex flex-col items-center justify-center px-5 py-24 text-center"
      style={{ background: "#f5f3ef" }}
    >
      <p
        className="font-black leading-none mb-6 select-none"
        style={{ fontSize: "clamp(96px, 20vw, 180px)", color: "#e7e5e4" }}
      >
        404
      </p>
      <h1 className="text-2xl font-black text-stone-900 mb-3">
        Pagina non trovata
      </h1>
      <p className="text-base text-stone-500 max-w-xs leading-relaxed mb-8">
        Questa pagina non esiste o è stata spostata. Torna alla home per scoprire gli eventi del Cilento.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-opacity hover:opacity-90"
        style={{ background: "#a3e635", color: "#14532d" }}
      >
        Torna agli eventi →
      </Link>
    </main>
  );
}
