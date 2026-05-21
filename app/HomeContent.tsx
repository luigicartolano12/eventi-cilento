"use client";

import { useRef, useState } from "react";
import { Evento, Categoria, CATEGORIE, formattaData } from "@/lib/events";
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
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
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
          className="text-[12px] font-bold leading-snug text-white"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#86efac" }}>
          <IcoMapPin size={9} />
          {evento.comune}
        </span>
        {evento.orario && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#4ade80" }}>
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
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  const comuniCount = new Set(eventi.map((e) => e.comune)).size;
  const oggi = eventiDiOggi(eventi);

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
        style={{ background: "linear-gradient(175deg, #0a1f12 0%, #1a3529 60%, #0f2318 100%)" }}
        className="px-5 pt-14 pb-16"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-10">

          {/* Headline block */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p
                className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
                style={{ color: "#4ade80" }}
              >
                Cilento &amp; Vallo di Diano
              </p>
              <h1
                className="font-black leading-[0.88] tracking-tight text-white mb-6"
                style={{ fontSize: "clamp(52px, 9vw, 96px)" }}
              >
                Scopri gli<br />
                <span style={{ color: "#a3e635" }}>eventi</span><br />
                del Cilento.
              </h1>
              <p
                className="text-base sm:text-lg leading-relaxed max-w-sm"
                style={{ color: "#86efac" }}
              >
                Sagre, concerti, mostre, sport e natura nel Parco Nazionale del Cilento.
              </p>
            </div>

            {/* Stat chips — desktop allineate a destra */}
            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <IcoCalendar size={16} style={{ color: "#4ade80" }} />
                <div>
                  <p className="text-2xl font-black text-white leading-none">{eventi.length}</p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#86efac" }}>eventi in programma</p>
                </div>
              </div>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <IcoMapPin size={16} style={{ color: "#4ade80" }} />
                <div>
                  <p className="text-2xl font-black text-white leading-none">{comuniCount}</p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#86efac" }}>comuni del territorio</p>
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
                  style={{ color: "#4ade80" }}
                >
                  Oggi
                </span>
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                  style={{ background: "rgba(163,230,53,0.15)", color: "#a3e635" }}
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

      {/* ── LISTA EVENTI ── */}
      <div ref={listaRef} style={{ background: "#f5f3ef" }} className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <EventiList eventi={eventi} categoriaEsterna={categoriaAttiva} />
        </div>
      </div>
    </>
  );
}
