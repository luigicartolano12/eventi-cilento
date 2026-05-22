"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Evento, Categoria, CATEGORIE, formattaData } from "@/lib/events";
import { getEventiApprovati, type EventoDinamico } from "@/lib/eventi-dinamici";
import { getInEvidenza, STILE_CATEGORIA, type Esperienza } from "@/lib/esperienze";
import { getLocaliInEvidenza, STILE_LOCALE, type Locale } from "@/lib/locali";
import { EventiList } from "./components/EventiList";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoCalendar, IcoMapPin, IcoClock,
} from "./components/icons";

const gradientCategoria: Record<string, string> = {
  Sagra:     "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:    "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:   "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:     "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso: "linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:   "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:    "linear-gradient(135deg, #059669, #14b8a6)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura,
};

const descCategoria: Record<string, string> = {
  Sagra: "Gusto locale", Musica: "Concerti", Cultura: "Arte e mostre",
  Sport: "Competizioni", Religioso: "Fede e storia", Mercato: "Artigianato", Natura: "Trekking",
};

function oggiISO() {
  return new Date().toISOString().split("T")[0];
}

function eventiDiOggi(eventi: Evento[]): Evento[] {
  const oggi = oggiISO();
  return eventi.filter((e) => oggi >= e.data && oggi <= (e.dataFine ?? e.data));
}

// ── Mini card per la sezione "Oggi" ───────────────────────────────────────────
function MiniCard({ evento }: { evento: Evento }) {
  const Ico = IconeCategoria[evento.categoria];
  return (
    <a
      href={`/events/${evento.id}`}
      className="shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 152,
        background: "white",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex items-center justify-center relative"
        style={{ height: 88, background: gradientCategoria[evento.categoria] }}
      >
        <Ico size={36} strokeWidth={1.2} className="text-white opacity-80" />
        <span
          className="absolute top-2.5 left-2.5 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.28)", color: "white", backdropFilter: "blur(8px)" }}
        >
          {evento.categoria}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p
          className="text-[12px] font-bold leading-snug text-stone-900"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#78716c" }}>
          <IcoMapPin size={9} />
          {evento.comune}
        </span>
        {evento.orario && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#16a34a" }}>
            <IcoClock size={9} />
            {evento.orario}
          </span>
        )}
      </div>
    </a>
  );
}

// ── Mini card esperienza per la home ─────────────────────────────────────────
function EsperienzaMiniCard({ esp }: { esp: Esperienza }) {
  const stile = STILE_CATEGORIA[esp.categoria];
  return (
    <Link
      href="/esperienze"
      className="shrink-0 relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end"
      style={{ width: 176, height: 200, background: stile.gradient }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/exp-${esp.id}/400/300`}
        alt={esp.titolo}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.70) 100%)" }}
      />
      <div className="relative p-3.5 flex flex-col gap-1.5">
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full w-fit"
          style={{ background: stile.bg, color: stile.color }}
        >
          {esp.categoria}
        </span>
        <p
          className="text-[12px] font-bold text-white leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {esp.titolo}
        </p>
        {esp.durata && (
          <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            {esp.durata} · {esp.prezzo}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Mini card locale per la home ─────────────────────────────────────────────
function LocaleMiniCard({ locale }: { locale: Locale }) {
  const stile = STILE_LOCALE[locale.categoria];
  return (
    <Link
      href="/locali"
      className="shrink-0 relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end"
      style={{ width: 160, height: 200, background: stile.gradient }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/locale-${locale.id}/400/300`}
        alt={locale.nome}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.75) 100%)" }}
      />
      <div className="relative p-3.5 flex flex-col gap-1">
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full w-fit"
          style={{ background: stile.bg, color: stile.color }}
        >
          {locale.categoria}
        </span>
        <p
          className="text-[13px] font-bold text-white leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {locale.nome}
        </p>
        <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
          {locale.comune}
        </span>
      </div>
    </Link>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export function HomeContent({ eventi }: { eventi: Evento[] }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  const [eventiExtra, setEventiExtra] = useState<Evento[]>([]);

  function convertiDinamico(d: EventoDinamico): Evento {
    return {
      id: d.id,
      titolo: d.titolo,
      data: d.data,
      dataFine: d.dataFine,
      orario: d.orario,
      luogo: d.luogo ?? d.comune,
      comune: d.comune,
      categoria: d.categoria,
      descrizioneBreve: d.descrizione.slice(0, 120),
      descrizione: d.descrizione,
      pubblico: "Tutti",
      servizi: {
        accessibileDisabili: false,
        parcheggio: false,
        ingressoGratuito: d.gratuito ?? false,
        prenotazioneRichiesta: false,
        petFriendly: false,
      },
    };
  }

  useEffect(() => {
    // 1. Legge dal localStorage (admin panel manuale)
    const locali = getEventiApprovati().map(convertiDinamico);
    setEventiExtra(locali);

    // 2. Legge dal database KV (cron automatico) — sovrascrive se ci sono
    fetch("/api/eventi-live")
      .then((r) => r.json())
      .then((kvEventi: EventoDinamico[]) => {
        if (kvEventi.length > 0) {
          // Unisce KV + localStorage evitando duplicati per ID
          const idLocali = new Set(locali.map((e) => e.id));
          const nuovi = kvEventi
            .filter((e) => !idLocali.has(e.id))
            .map(convertiDinamico);
          setEventiExtra((prev) => [...prev, ...nuovi]);
        }
      })
      .catch(() => {/* ignora errori di rete */});
  }, []);

  const tuttiGliEventi = [...eventiExtra, ...eventi].sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  const comuniCount = new Set(tuttiGliEventi.map((e) => e.comune)).size;
  const oggi = eventiDiOggi(tuttiGliEventi);
  const localiEvidenza = getLocaliInEvidenza();

  function selezionaCategoria(cat: Categoria | null) {
    setCategoriaAttiva(cat);
    setTimeout(() => {
      listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  return (
    <>
      {/* ── HERO ── */}
      <div
        style={{ background: "#f5f3ef" }}
        className="px-5 pt-14 pb-16"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-10">

          {/* Headline block */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p
                className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
                style={{ color: "#16a34a" }}
              >
                Cilento &amp; Vallo di Diano
              </p>
              <h1
                className="font-black leading-[0.88] tracking-tight text-stone-900 mb-6"
                style={{ fontSize: "clamp(52px, 9vw, 96px)" }}
              >
                Scopri gli<br />
                <span style={{ color: "#65a30d" }}>eventi</span><br />
                del Cilento.
              </h1>
              <p
                className="text-base sm:text-lg leading-relaxed max-w-sm"
                style={{ color: "#78716c" }}
              >
                Sagre, concerti, mostre, sport e natura nel Parco Nazionale del Cilento.
              </p>
            </div>

            {/* Stat chips — desktop allineate a destra */}
            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <IcoCalendar size={16} style={{ color: "#16a34a" }} />
                <div>
                  <p className="text-2xl font-black text-stone-900 leading-none">{tuttiGliEventi.length}</p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#78716c" }}>eventi in programma</p>
                </div>
              </div>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <IcoMapPin size={16} style={{ color: "#16a34a" }} />
                <div>
                  <p className="text-2xl font-black text-stone-900 leading-none">{comuniCount}</p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#78716c" }}>comuni del territorio</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sezione Oggi ── */}
          {oggi.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[11px] font-black uppercase tracking-[0.15em]"
                  style={{ color: "#16a34a" }}
                >
                  Oggi
                </span>
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                  style={{ background: "#dcfce7", color: "#166534" }}
                >
                  {formattaData(oggiISO())}
                </span>
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {oggi.map((e) => <MiniCard key={e.id} evento={e} />)}

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── CATEGORIE ── */}
      <div style={{ background: "#f5f3ef" }}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em] mb-5"
            style={{ color: "#78716c" }}
          >
            Esplora per categoria
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIE.map((cat) => {
              const Ico = IconeCategoria[cat];
              const attivo = categoriaAttiva === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selezionaCategoria(attivo ? null : cat)}
                  className="shrink-0 flex flex-col rounded-2xl border-0 cursor-pointer transition-all duration-200 overflow-hidden"
                  style={{
                    width: 108,
                    background: attivo ? "#a3e635" : "white",
                    boxShadow: attivo
                      ? "0 0 0 2.5px #65a30d, 0 4px 12px rgba(101,163,13,0.25)"
                      : "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
                    transform: attivo ? "translateY(-2px)" : "translateY(0)",
                  }}
                >
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      height: 68,
                      background: attivo ? "rgba(20,83,45,0.12)" : gradientCategoria[cat],
                    }}
                  >
                    <Ico
                      size={30}
                      strokeWidth={1.4}
                      className={attivo ? "text-green-800" : "text-white"}
                    />
                  </div>
                  <div className="py-3 flex flex-col items-center gap-0.5">
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: attivo ? "#14532d" : "#1c1c1e" }}
                    >
                      {cat}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: attivo ? "#166534" : "#8e8e93" }}
                    >
                      {descCategoria[cat]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ESPERIENZE IN EVIDENZA ── */}
      <div style={{ background: "#f5f3ef" }}>
        <div className="max-w-6xl mx-auto px-5 pb-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#78716c" }}>
                Esperienze
              </p>
              <h2 className="text-xl font-black text-stone-900">Vivi il Cilento</h2>
            </div>
            <Link
              href="/esperienze"
              className="text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: "#16a34a" }}
            >
              Tutte le esperienze →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {getInEvidenza().map((esp) => (
              <EsperienzaMiniCard key={esp.id} esp={esp} />
            ))}
          </div>
        </div>
      </div>

      {/* ── LOCALI & SERATE ── */}
      <div style={{ background: "#f5f3ef" }}>
        <div className="max-w-6xl mx-auto px-5 pb-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#78716c" }}>
                Locali &amp; Serate
              </p>
              <h2 className="text-xl font-black text-stone-900">Dove uscire stanotte</h2>
            </div>
            <Link
              href="/locali"
              className="text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: "#16a34a" }}
            >
              Tutti i locali →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {localiEvidenza.map((l) => (
              <LocaleMiniCard key={l.id} locale={l} />
            ))}
          </div>
        </div>
      </div>

      {/* ── LISTA EVENTI ── */}
      <div ref={listaRef} style={{ background: "#f5f3ef" }} className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <EventiList eventi={tuttiGliEventi} categoriaEsterna={categoriaAttiva} />
        </div>
      </div>
    </>
  );
}
