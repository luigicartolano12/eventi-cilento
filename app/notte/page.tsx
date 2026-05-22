"use client";

import { useState } from "react";
import Link from "next/link";
import {
  locali,
  CATEGORIE_LOCALE,
  STILE_LOCALE,
  type CategoriaLocale,
  type Locale,
} from "@/lib/locali";
import { IcoArrowLeft, IcoMapPin, IcoClock, IcoInstagram, IcoPhone, IcoMail } from "@/app/components/icons";

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 9999 + 1;
}

const kwLocale: Record<string, string> = {
  "Bar & Aperitivo": "bar,aperitivo",
  "Ristorante":      "restaurant,food",
  "Discoteca":       "nightclub,dance",
  "Agriturismo":     "farmhouse,countryside",
  "Beach Club":      "beach,club",
};

function LocaleCard({ locale }: { locale: Locale }) {
  const stile = STILE_LOCALE[locale.categoria];
  const kw = kwLocale[locale.categoria] ?? "restaurant,food";
  const lock = hashId(locale.id);

  return (
    <Link
      href={`/locali/${locale.id}`}
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
        style={{ height: 180, background: stile.gradient }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://loremflickr.com/600/300/${kw}/all?lock=${lock}`}
          alt={locale.nome}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.45) 100%)" }}
        />
        {/* Categoria */}
        <span
          className="absolute top-3.5 left-3.5 text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ background: stile.bg, color: stile.color }}
        >
          {locale.categoria}
        </span>
        {/* Orario */}
        {locale.orario && (
          <span
            className="absolute top-3.5 right-3.5 text-[11px] font-black px-2.5 py-1 rounded-full text-white"
            style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)" }}
          >
            {locale.orario.split("/")[0].trim()}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-5 flex-1">
        <h2 className="text-[16px] font-bold text-black leading-snug tracking-tight">
          {locale.nome}
        </h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="inline-flex items-center gap-1 text-[12px] text-stone-400 font-medium">
            <IcoMapPin size={10} className="text-stone-300" />
            {locale.comune}
          </span>
          {locale.orario && (
            <span className="inline-flex items-center gap-1 text-[12px] text-stone-400 font-medium">
              <IcoClock size={10} className="text-stone-300" />
              {locale.orario}
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
          {locale.descrizione}
        </p>

        {/* Serate */}
        {locale.serate.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {locale.serate.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: stile.bg, color: stile.color }}
              >
                {s}
              </span>
            ))}
            {locale.serate.length > 2 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#f5f3ef", color: "#78716c" }}
              >
                +{locale.serate.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Badge contatti */}
        <div className="flex items-center gap-2 mt-auto pt-3">
          {locale.instagram && (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#fdf2f8", color: "#9d174d" }}
            >
              <IcoInstagram size={10} />
              Instagram
            </span>
          )}
          {locale.telefono && (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#f0fdf4", color: "#166534" }}
            >
              <IcoPhone size={10} />
              Chiama
            </span>
          )}
          <span className="ml-auto text-[18px] text-stone-300 font-light leading-none">›</span>
        </div>
      </div>
    </Link>
  );
}

export default function PaginaNotte() {
  const [categoriaAttiva, setCategoriaAttiva] = useState<CategoriaLocale | null>(null);

  const localiFiltrati = categoriaAttiva
    ? locali.filter((l) => l.categoria === categoriaAttiva)
    : locali;

  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      {/* Hero */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pt-12 pb-14">
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
            Vivi la<br />
            <span style={{ color: "#65a30d" }}>Notte</span>.
          </h1>
          <p className="text-base max-w-md leading-relaxed" style={{ color: "#44403c" }}>
            {locali.length} locali selezionati: bar, ristoranti, discoteche, agriturismi e
            beach club che animano le notti del Cilento.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filtri */}
        <div className="mb-8">
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
              Tutti ({locali.length})
            </button>
            {CATEGORIE_LOCALE.map((cat) => {
              const count = locali.filter((l) => l.categoria === cat).length;
              if (count === 0) return null;
              const attivo = categoriaAttiva === cat;
              const stile = STILE_LOCALE[cat];
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

        {/* Contatore */}
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-5" style={{ color: "#78716c" }}>
          {localiFiltrati.length}{" "}
          {localiFiltrati.length === 1 ? "locale" : "locali"}
          {categoriaAttiva ? ` · ${categoriaAttiva}` : ""}
        </p>

        {/* Griglia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
          {localiFiltrati.map((l) => (
            <LocaleCard key={l.id} locale={l} />
          ))}
        </div>

        {/* CTA proponi il tuo locale */}
        <div
          className="rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 mb-16"
          style={{ background: "#f0fdf4", border: "1px solid rgba(22,163,74,0.15)" }}
        >
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: "#16a34a" }}>
              Sei un gestore?
            </p>
            <h2 className="text-xl font-black text-stone-900 mb-2">
              Proponi il tuo locale
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#44403c" }}>
              Fai conoscere il tuo bar, ristorante o locale a migliaia di visitatori del Cilento.
              La pubblicazione è completamente gratuita.
            </p>
          </div>
          <a
            href="mailto:eventi@cilento.it?subject=Proposta%20locale%20Cilento"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-opacity hover:opacity-90"
            style={{ background: "#a3e635", color: "#14532d" }}
          >
            <IcoMail size={16} />
            Contattaci
          </a>
        </div>
      </div>
    </main>
  );
}
