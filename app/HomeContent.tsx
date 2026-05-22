"use client";

import { useEffect, useState } from "react";
import { Evento, Categoria, formattaData } from "@/lib/events";
import { getEventiApprovati, type EventoDinamico } from "@/lib/eventi-dinamici";
import { EventiList } from "./components/EventiList";
import {
  IcoMapPin, IcoClock,
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura, IcoSalute,
} from "./components/icons";

// ── Colori e icone per categoria ─────────────────────────────────────────────

const gradientCategoria: Record<string, string> = {
  Sagra:     "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:    "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:   "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:     "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso: "linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:   "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:    "linear-gradient(135deg, #059669, #14b8a6)",
  Salute:    "linear-gradient(135deg, #ec4899, #f43f5e)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura, Salute: IcoSalute,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function oggiISO() {
  return new Date().toISOString().split("T")[0];
}

function eventiDiOggi(eventi: Evento[]): Evento[] {
  const oggi = oggiISO();
  return eventi.filter((e) => oggi >= e.data && oggi <= (e.dataFine ?? e.data));
}

// ── Mini card: evento di oggi ─────────────────────────────────────────────────
function MiniCard({ evento }: { evento: Evento }) {
  const gradient = gradientCategoria[evento.categoria] ?? "linear-gradient(135deg, #059669, #14b8a6)";
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
      {/* Copertina — gradiente categoria + icona centrata */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 88, background: gradient }}
      >
        {/* Icona grande centrata */}
        {Ico && (
          <Ico size={32} strokeWidth={1.2} className="text-white opacity-30" />
        )}
        {/* Overlay in basso */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.30) 100%)" }}
        />
        {/* Tag categoria */}
        <span
          className="absolute top-2 left-2 z-10 text-[9px] font-black px-2 py-0.5 rounded-full text-white"
          style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)" }}
        >
          {evento.categoria}
        </span>
        {/* Icona rotonda in basso a destra */}
        {Ico && (
          <div
            className="absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
          >
            <Ico size={13} strokeWidth={1.8} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
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

// ── Componente principale ─────────────────────────────────────────────────────
export function HomeContent({ eventi }: { eventi: Evento[] }) {
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
      immagine: d.immagine,
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
    const locali = getEventiApprovati().map(convertiDinamico);
    setEventiExtra(locali);
    fetch("/api/eventi-live")
      .then((r) => r.json())
      .then((kvEventi: EventoDinamico[]) => {
        if (kvEventi.length > 0) {
          const idLocali = new Set(locali.map((e) => e.id));
          const nuovi = kvEventi.filter((e) => !idLocali.has(e.id)).map(convertiDinamico);
          setEventiExtra((prev) => [...prev, ...nuovi]);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tutti gli eventi uniti e ordinati per data ────────────────────────────
  const tuttiGliEventi = [...eventiExtra, ...eventi].sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  const oggi = eventiDiOggi(tuttiGliEventi);

  // Se oggi non ci sono eventi, mostra i prossimi 8 in programma
  const oggiISOfixed = oggiISO();
  const prossimi = oggi.length > 0
    ? oggi
    : tuttiGliEventi.filter((e) => e.data >= oggiISOfixed).slice(0, 8);
  const sezioneLabel = oggi.length > 0 ? "oggi" : "in programma";
  const sezioneCount = prossimi.length;

  // ── Comuni coinvolti ─────────────────────────────────────────────────────
  const comuniSet = [...new Set(prossimi.map((e) => e.comune))];
  const comuniLabel = comuniSet.slice(0, 3).join(" · ") + (comuniSet.length > 3 ? ` +${comuniSet.length - 3}` : "");

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── 01 HEAD ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pt-14 pb-6">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] font-black uppercase tracking-[0.2em] mb-5"
            style={{ color: "#16a34a" }}
          >
            Cilento &amp; Vallo di Diano
          </p>
          {/* ── 02 SUBHEAD ── */}
          <h1
            className="font-black leading-[0.9] tracking-tight text-stone-900 mb-3"
            style={{ fontSize: "clamp(42px, 7.5vw, 84px)" }}
          >
            Scopri gli<br />
            <span style={{ color: "#65a30d" }}>eventi</span><br />
            del Cilento.
          </h1>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "#78716c" }}
          >
            Sagre, concerti, mostre, sport e natura.
          </p>
        </div>
      </div>

      {/* ── 03 EVENTI IN PRIMO PIANO (oggi o prossimi) ── */}
      {sezioneCount > 0 && (
        <div style={{ background: "#f5f3ef" }} className="px-5 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Label + data + comuni */}
            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: "#16a34a",
                  animation: oggi.length > 0 ? "pulse 2s infinite" : "none",
                }}
              />
              <span className="text-sm font-black" style={{ color: "#16a34a" }}>
                {sezioneCount} {sezioneCount === 1 ? "evento" : "eventi"} {sezioneLabel}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                {formattaData(oggiISOfixed)}
              </span>
              {comuniSet.length > 0 && (
                <span
                  className="text-[11px] font-medium hidden sm:inline truncate max-w-xs"
                  style={{ color: "#78716c" }}
                >
                  {comuniLabel}
                </span>
              )}
            </div>

            {/* Scroll orizzontale card piccole */}
            <div
              className="flex gap-3 overflow-x-auto pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {prossimi.map((e) => <MiniCard key={e.id} evento={e} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── 04 EVENTI LIST ── */}
      <div style={{ background: "#f5f3ef" }} className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <EventiList eventi={tuttiGliEventi} categoriaEsterna={null} />
        </div>
      </div>
    </>
  );
}
