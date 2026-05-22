"use client";

import { useState } from "react";
import Link from "next/link";
import {
  esperienze,
  CATEGORIE_ESPERIENZA,
  STILE_CATEGORIA,
  IMG_KEYWORDS_CATEGORIA,
  type CategoriaEsperienza,
  type Esperienza,
} from "@/lib/esperienze";
import { IcoArrowLeft, IcoMapPin, IcoClock, IcoSearch } from "@/app/components/icons";

/** Numero stabile per lock loremflickr */
function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 9999 + 1;
}

/** loremflickr /all: richiede ENTRAMBE le keyword → immagini più pertinenti */
function espImgUrl(keywords: string, lockNum: number, w = 600, h = 300): string {
  const parts = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  const primary = parts.slice(0, 2).join(",");
  return `https://loremflickr.com/${w}/${h}/${primary}/all?lock=${lockNum}`;
}

function EsperienzaCard({ esp }: { esp: Esperienza }) {
  const stile = STILE_CATEGORIA[esp.categoria];
  const kw = esp.imgKeywords ?? IMG_KEYWORDS_CATEGORIA[esp.categoria];
  return (
    <Link
      href={`/esperienze/${esp.id}`}
      className="group flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#fff",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* Immagine */}
      <div
        className="relative overflow-hidden"
        style={{ height: 200, background: stile.gradient }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={espImgUrl(kw, hashId(esp.id))}
          alt={esp.titolo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.40) 100%)",
          }}
        />
        {/* Categoria badge */}
        <span
          className="absolute top-3.5 left-3.5 text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ background: stile.bg, color: stile.color }}
        >
          {esp.categoria}
        </span>
        {/* Prezzo badge */}
        <span
          className="absolute top-3.5 right-3.5 text-[11px] font-black px-2.5 py-1 rounded-full text-white"
          style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)" }}
        >
          {esp.prezzo}
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-5 flex-1">
        <h2 className="text-[16px] font-bold text-black leading-snug tracking-tight">
          {esp.titolo}
        </h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="inline-flex items-center gap-1 text-[12px] text-stone-400 font-medium">
            <IcoMapPin size={10} className="text-stone-300" />
            {esp.comune}
          </span>
          {esp.durata && (
            <span className="inline-flex items-center gap-1 text-[12px] text-stone-400 font-medium">
              <IcoClock size={10} className="text-stone-300" />
              {esp.durata}
            </span>
          )}
          {esp.difficolta && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={
                esp.difficolta === "Facile"
                  ? { background: "#dcfce7", color: "#166534" }
                  : esp.difficolta === "Media"
                  ? { background: "#fef3c7", color: "#92400e" }
                  : { background: "#fee2e2", color: "#991b1b" }
              }
            >
              {esp.difficolta}
            </span>
          )}
        </div>

        <p
          className="text-[13px] text-stone-500 leading-relaxed mt-0.5"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {esp.descrizione}
        </p>

        {/* Tags */}
        {esp.tags && esp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {esp.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#f5f3ef", color: "#78716c" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: "#16a34a" }}>
            Scopri e prenota
          </span>
          <span className="text-[18px] text-stone-300 font-light leading-none">›</span>
        </div>
      </div>
    </Link>
  );
}

export default function PaginaEsperienze() {
  const [categoriaAttiva, setCategoriaAttiva] = useState<CategoriaEsperienza | null>(null);
  const [cerca, setCerca] = useState("");

  const esperienzeFiltrate = esperienze.filter((e) => {
    if (categoriaAttiva && e.categoria !== categoriaAttiva) return false;
    if (cerca) {
      const q = cerca.toLowerCase();
      if (
        !e.titolo.toLowerCase().includes(q) &&
        !e.comune.toLowerCase().includes(q) &&
        !(e.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }
    return true;
  });

  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      {/* ── Hero ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pt-12 pb-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
            style={{ color: "#16a34a" }}
          >
            <IcoArrowLeft size={14} />
            Torna alla home
          </Link>

          <p
            className="text-[11px] font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: "#16a34a" }}
          >
            Cilento &amp; Vallo di Diano
          </p>
          <h1
            className="font-black leading-[0.9] tracking-tight text-stone-900 mb-5"
            style={{ fontSize: "clamp(40px, 7vw, 76px)" }}
          >
            Vivi il<br />
            <span style={{ color: "#65a30d" }}>Cilento</span>.
          </h1>
          <p className="text-base max-w-md leading-relaxed" style={{ color: "#44403c" }}>
            {esperienze.length} esperienze autentiche tra natura, mare, cultura, gastronomia e
            benessere nel Parco Nazionale del Cilento.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* ── Barra di ricerca ── */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-6"
          style={{
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <IcoSearch size={16} className="text-stone-400 shrink-0" />
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca esperienze, comuni, tag…"
            className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none font-medium"
            style={{ fontSize: 16 }}
          />
          {cerca && (
            <button
              onClick={() => setCerca("")}
              className="text-stone-400 hover:text-stone-600 border-0 bg-transparent cursor-pointer text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* ── Filtri categoria ── */}
        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#78716c" }}>
            Filtra per tipo
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setCategoriaAttiva(null)}
              className="shrink-0 text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer transition-all"
              style={
                !categoriaAttiva
                  ? { background: "#1a3529", color: "#a3e635" }
                  : { background: "#fff", color: "#78716c", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
              }
            >
              Tutte ({esperienze.length})
            </button>
            {CATEGORIE_ESPERIENZA.map((cat) => {
              const count = esperienze.filter((e) => e.categoria === cat).length;
              if (count === 0) return null;
              const attivo = categoriaAttiva === cat;
              const stile = STILE_CATEGORIA[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAttiva(attivo ? null : cat)}
                  className="shrink-0 text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer transition-all"
                  style={
                    attivo
                      ? { background: stile.color, color: "white" }
                      : { background: "#fff", color: "#78716c", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                  }
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Contatore ── */}
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-5" style={{ color: "#78716c" }}>
          {esperienzeFiltrate.length}{" "}
          {esperienzeFiltrate.length === 1 ? "esperienza" : "esperienze"}
          {categoriaAttiva ? ` · ${categoriaAttiva}` : ""}
          {cerca ? ` · "${cerca}"` : ""}
        </p>

        {/* ── Griglia ── */}
        {esperienzeFiltrate.length === 0 ? (
          <div
            className="text-center py-20 rounded-3xl"
            style={{ background: "white" }}
          >
            <p className="text-stone-500 font-semibold">Nessuna esperienza trovata</p>
            <button
              onClick={() => { setCerca(""); setCategoriaAttiva(null); }}
              className="mt-3 text-sm font-bold border-0 bg-transparent cursor-pointer"
              style={{ color: "#16a34a" }}
            >
              Azzera filtri
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {esperienzeFiltrate.map((esp) => (
              <EsperienzaCard key={esp.id} esp={esp} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
