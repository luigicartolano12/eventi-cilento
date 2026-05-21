"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Evento, Categoria, CATEGORIE, formattaData } from "@/lib/events";
import { EventiList } from "./components/EventiList";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoCalendar, IcoMapPin, IcoClock, IcoLocate,
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

const testoCategoriaColore: Record<string, string> = {
  Sagra: "#9a3412", Musica: "#6b21a8", Cultura: "#1e40af",
  Sport: "#166534", Religioso: "#92400e", Mercato: "#9d174d", Natura: "#065f46",
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

function oggiISO(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function eventiDiOggi(eventi: Evento[]): Evento[] {
  const oggi = oggiISO();
  return eventi.filter((e) => {
    if (e.dataFine) return e.data <= oggi && e.dataFine >= oggi;
    return e.data === oggi;
  });
}

// ── Mini card per la sezione "Oggi" ───────────────────────────────────────────
function MiniCard({ evento }: { evento: Evento }) {
  const Ico = IconeCategoria[evento.categoria];
  return (
    <Link
      href={`/events/${evento.id}`}
      className="shrink-0 flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ width: 136, background: "#0f2318" }}
    >
      {/* Gradient header */}
      <div
        className="flex items-center justify-center relative"
        style={{ height: 72, background: gradientCategoria[evento.categoria] }}
      >
        <Ico size={30} strokeWidth={1.3} className="text-white opacity-80" />
        <span
          className="absolute bottom-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/90"
          style={{ color: testoCategoriaColore[evento.categoria] }}
        >
          {evento.categoria}
        </span>
      </div>
      {/* Body */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p
          className="text-[11px] font-bold leading-snug text-white"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </p>
        {evento.orario && (
          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#86efac" }}>
            <IcoClock size={9} />
            {evento.orario}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#4ade80" }}>
          <IcoMapPin size={9} />
          {evento.comune}
        </span>
      </div>
    </Link>
  );
}

// ── Geolocalizzazione via Nominatim ───────────────────────────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=it`,
    { headers: { "User-Agent": "EventiCilento/1.0" } }
  );
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    data.address?.municipality ||
    ""
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export function HomeContent({ eventi }: { eventi: Evento[] }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria | null>(null);
  const [dataFiltro, setDataFiltro] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);

  const comuniCount = new Set(eventi.map((e) => e.comune)).size;
  const prossimoEvento = [...eventi]
    .filter((e) => e.data >= oggiISO())
    .sort((a, b) => a.data.localeCompare(b.data))[0];
  const oggi = eventiDiOggi(eventi);

  function rilevaPosizione() {
    if (!navigator.geolocation) {
      setLocationError("Geolocalizzazione non supportata dal browser");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    setLocationLabel("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const citta = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocationLabel(citta || "Posizione rilevata");
        } catch {
          setLocationError("Impossibile determinare la posizione");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Permesso negato o posizione non disponibile");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  }

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
        <div className="max-w-6xl mx-auto flex flex-col gap-8">

          {/* Headline + prossimo evento desktop */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#86efac" }}>
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
                  <p className="text-white font-bold text-sm leading-snug">{prossimoEvento.titolo}</p>
                  <p className="text-xs capitalize" style={{ color: "#86efac" }}>
                    {formattaData(prossimoEvento.data)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>{prossimoEvento.comune}</p>
                </div>
              </Link>
            )}
          </div>

          {/* ── Sezione Oggi ── */}
          {oggi.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#4ade80" }}>
                Oggi — {formattaData(oggiISO())}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {oggi.map((e) => (
                  <MiniCard key={e.id} evento={e} />
                ))}
              </div>
            </div>
          )}

          {/* ── Barre data + posizione ── */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Data */}
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#4ade80" }}>
                Mostra eventi dal
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-3 flex-1 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <IcoCalendar size={16} className="text-green-400 shrink-0" />
                  <input
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm font-semibold focus:outline-none"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                {dataFiltro && (
                  <button
                    onClick={() => setDataFiltro("")}
                    className="text-xs font-bold px-3 py-3 rounded-2xl border-0 cursor-pointer transition-opacity hover:opacity-70 shrink-0"
                    style={{ background: "rgba(255,255,255,0.10)", color: "#86efac" }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Posizione */}
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#4ade80" }}>
                Posizione
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-3 flex-1 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <IcoMapPin size={16} className="text-green-400 shrink-0" />
                  {locationLoading ? (
                    <span className="text-sm flex-1" style={{ color: "#86efac" }}>
                      Rilevamento…
                    </span>
                  ) : locationLabel ? (
                    <span className="text-sm font-semibold flex-1 text-white truncate">
                      {locationLabel}
                    </span>
                  ) : (
                    <span className="text-sm flex-1" style={{ color: "rgba(134,239,172,0.6)" }}>
                      Nessuna posizione
                    </span>
                  )}
                  <button
                    onClick={rilevaPosizione}
                    disabled={locationLoading}
                    title="Rileva la mia posizione"
                    className="w-7 h-7 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all shrink-0 hover:scale-110 disabled:opacity-50"
                    style={{ background: "#a3e635", color: "#14532d" }}
                  >
                    <IcoLocate size={13} />
                  </button>
                </div>
                {locationLabel && (
                  <button
                    onClick={() => { setLocationLabel(""); setLocationError(""); }}
                    className="text-xs font-bold px-3 py-3 rounded-2xl border-0 cursor-pointer transition-opacity hover:opacity-70 shrink-0"
                    style={{ background: "rgba(255,255,255,0.10)", color: "#86efac" }}
                  >
                    ×
                  </button>
                )}
              </div>
              {locationError && (
                <p className="text-[11px] mt-1.5 pl-1" style={{ color: "#fca5a5" }}>
                  {locationError}
                </p>
              )}
            </div>

          </div>

          {/* ── Tile categorie ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "#4ade80" }}>
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
                      style={{ background: attivo ? "rgba(20,83,45,0.15)" : gradientCategoria[cat] }}
                    >
                      <Ico size={22} strokeWidth={1.5} className={attivo ? "text-green-900" : "text-white"} />
                    </div>
                    <span className="text-[11px] font-bold text-center leading-tight">{cat}</span>
                    <span className="text-[9px] text-center leading-tight hidden sm:block" style={{ opacity: 0.65 }}>
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
        <EventiList
          eventi={eventi}
          categoriaEsterna={categoriaAttiva}
          dataEsterna={dataFiltro}
          locationFiltro={locationLabel}
        />
      </div>
    </>
  );
}
