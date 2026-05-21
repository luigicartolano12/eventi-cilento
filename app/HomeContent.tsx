"use client";

import { useRef, useState } from "react";
import { Evento, Categoria, CATEGORIE, formattaData } from "@/lib/events";
import { EventiList } from "./components/EventiList";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoCalendar, IcoMapPin,
} from "./components/icons";
import Link from "next/link";

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
  Sagra:     "Gusto locale",
  Musica:    "Concerti",
  Cultura:   "Arte e mostre",
  Sport:     "Competizioni",
  Religioso: "Fede e storia",
  Mercato:   "Artigianato",
  Natura:    "Trekking",
};

export function HomeContent({ eventi }: { eventi: Evento[] }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  const comuniCount = new Set(eventi.map((e) => e.comune)).size;
  const prossimoEvento = [...eventi].sort((a, b) => a.data.localeCompare(b.data))[0];

  function selezionaCategoria(cat: Categoria | null) {
    setCategoriaAttiva(cat);
    setTimeout(() => {
      listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  return (
    <>
      {/* Hero */}
      <div style={{ background: "#1a3529" }} className="px-5 pt-10 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* Headline + stat */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">
            <div className="flex-1">
              <p
                className="text-xs font-black uppercase tracking-widest mb-4"
                style={{ color: "#86efac" }}
              >
                Cilento &amp; Vallo di Diano
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                Scopri gli eventi<br />del territorio
              </h1>
              <p className="text-base max-w-md leading-relaxed mb-6" style={{ color: "#a7f3d0" }}>
                Sagre, concerti, mostre, sport e molto altro nel Parco Nazionale del Cilento.
              </p>
              {/* Stat bar */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <IcoCalendar size={14} className="text-green-400" />
                  <span className="text-sm font-black text-white">{eventi.length}</span>
                  <span className="text-sm" style={{ color: "#86efac" }}>eventi</span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoMapPin size={14} className="text-green-400" />
                  <span className="text-sm font-black text-white">{comuniCount}</span>
                  <span className="text-sm" style={{ color: "#86efac" }}>comuni</span>
                </div>
              </div>
            </div>

            {/* Prossimo evento in evidenza (solo desktop) */}
            {prossimoEvento && (
              <Link
                href={`/events/${prossimoEvento.id}`}
                className="hidden lg:flex flex-col w-72 rounded-2xl overflow-hidden shadow-xl transition-transform hover:-translate-y-1"
                style={{ background: "#0f2318" }}
              >
                <div
                  className="h-28 flex items-center justify-center relative"
                  style={{ background: gradientCategoria[prossimoEvento.categoria] }}
                >
                  {(() => {
                    const Ico = IconeCategoria[prossimoEvento.categoria];
                    return <Ico size={40} strokeWidth={1.2} className="text-white opacity-70" />;
                  })()}
                  <span
                    className="absolute top-3 left-3 text-[10px] font-black px-2 py-1 rounded-full"
                    style={{ background: "#a3e635", color: "#14532d" }}
                  >
                    In arrivo
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <p className="text-white font-bold text-sm leading-snug">
                    {prossimoEvento.titolo}
                  </p>
                  <p className="text-xs capitalize" style={{ color: "#86efac" }}>
                    {formattaData(prossimoEvento.data)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>
                    {prossimoEvento.comune}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Tile categorie */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ color: "#4ade80" }}
            >
              Cosa cerchi?
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {CATEGORIE.map((cat) => {
                const Ico = IconeCategoria[cat];
                const attivo = categoriaAttiva === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => selezionaCategoria(attivo ? null : cat)}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-0 cursor-pointer transition-all"
                    style={
                      attivo
                        ? { background: "#a3e635", color: "#14532d" }
                        : { background: "rgba(255,255,255,0.08)", color: "white" }
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: attivo
                          ? "rgba(20,83,45,0.15)"
                          : gradientCategoria[cat],
                      }}
                    >
                      <Ico
                        size={22}
                        strokeWidth={1.5}
                        className={attivo ? "text-green-900" : "text-white"}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-center leading-tight">
                      {cat}
                    </span>
                    <span
                      className="text-[9px] text-center leading-tight hidden sm:block"
                      style={{ opacity: 0.65 }}
                    >
                      {descCategoria[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lista eventi */}
      <div ref={listaRef} className="max-w-6xl mx-auto px-4 -mt-20 pb-16">
        <EventiList eventi={eventi} categoriaEsterna={categoriaAttiva} />
      </div>
    </>
  );
}
