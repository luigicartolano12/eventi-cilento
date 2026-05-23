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

// ── Hero stagionale ───────────────────────────────────────────────────────────
const STAGIONI: Record<string, {
  label: string;
  emoji: string;
  gradient: string;
  tag: string;
  desc: string;
}> = {
  primavera: {
    label: "È primavera",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #86efac 0%, #bbf7d0 50%, #fde68a 100%)",
    tag: "Natura & Sagre",
    desc: "Fioritura, trekking e prime sagre. Il Cilento si risveglia.",
  },
  estate: {
    label: "È estate",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 40%, #34d399 100%)",
    tag: "Mare & Concerti",
    desc: "Serate sul mare, sagre e festival. La stagione più viva del Cilento.",
  },
  autunno: {
    label: "È autunno",
    emoji: "🍂",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #b45309 100%)",
    tag: "Sagre & Cultura",
    desc: "Vendemmia, sagre del fungo e castagne. I sapori del Cilento.",
  },
  inverno: {
    label: "È inverno",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #1a3529 0%, #166534 50%, #15803d 100%)",
    tag: "Cultura & Mercati",
    desc: "Mercatini, presepi e tradizioni. Il Cilento autentico.",
  },
};

function getStagione(): keyof typeof STAGIONI {
  const m = new Date().getMonth(); // 0–11
  if (m >= 2 && m <= 4) return "primavera";
  if (m >= 5 && m <= 8) return "estate";
  if (m >= 9 && m <= 10) return "autunno";
  return "inverno";
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

  const stagione = getStagione();
  const s = STAGIONI[stagione];

  return (
    <>
      {/* ── 01 HERO ── */}
      <div
        className="relative overflow-hidden px-5 pt-14 pb-12"
        style={{ background: "#111827" }}
      >
        {/* Blob di luce verde — decorativo */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20%", right: "-10%",
            width: 480, height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.14) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Stagione pill — compatta e chiara */}
          <div className="flex items-center gap-2 mb-7">
            <span style={{ fontSize: 18 }}>{s.emoji}</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {s.tag} · {s.label}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight text-white mb-5"
            style={{ fontSize: "clamp(40px, 7.5vw, 84px)", lineHeight: 0.93 }}
          >
            Scopri gli<br />
            <span style={{ color: "#4ade80" }}>eventi</span><br />
            del Cilento.
          </h1>

          {/* Sottotitolo */}
          <p
            className="text-[15px] leading-relaxed max-w-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {s.desc}
          </p>
        </div>
      </div>

      {/* ── 03 EVENTI IN PRIMO PIANO ── */}
      {sezioneCount > 0 && (
        <div style={{ background: "#f5f3ef" }} className="px-5 pt-8 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Label sezione */}
            <div className="flex items-baseline gap-2.5 mb-4">
              <span
                className="w-2 h-2 rounded-full shrink-0 self-center"
                style={{
                  background: "#16a34a",
                  animation: oggi.length > 0 ? "pulse 2s infinite" : "none",
                }}
              />
              <span className="text-[13px] font-bold text-stone-900">
                {oggi.length > 0 ? "Oggi" : "In programma"}
              </span>
              <span className="text-[11px] text-stone-400 capitalize">
                {formattaData(oggiISOfixed)}
              </span>
            </div>

            {/* Scroll orizzontale card piccole */}
            <div
              className="flex gap-3 overflow-x-auto pb-2"
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
