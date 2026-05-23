import Link from "next/link";
import { eventi } from "@/lib/events";
import { IcoArrowLeft } from "@/app/components/icons";
import { MappaWrapper } from "./MappaWrapper";

export const metadata = {
  title: "Mappa eventi — Cilento e Vallo di Diano",
  description: "Esplora tutti gli eventi del Cilento su mappa interattiva. Sagre, concerti, mostre e sport vicino a te.",
};

export default function PaginaMappa() {
  return (
    <main className="flex-1 flex flex-col" style={{ background: "#f5f3ef" }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4 flex items-center gap-4"
        style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: "#16a34a" }}
        >
          <IcoArrowLeft size={14} />
          <span className="hidden sm:inline">Torna agli eventi</span>
        </Link>
        <div className="flex-1 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "#f0fdf4" }}
          >
            🗺️
          </div>
          <div>
            <h1 className="text-base font-black text-stone-900 leading-none">Mappa eventi</h1>
            <p className="text-[11px] text-stone-400 mt-0.5">Cilento &amp; Vallo di Diano</p>
          </div>
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          {eventi.length} eventi
        </span>
      </div>

      {/* Leaflet CSS — necessario per il rendering della mappa */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}

      {/* Mappa */}
      <MappaWrapper eventi={eventi} />
    </main>
  );
}
