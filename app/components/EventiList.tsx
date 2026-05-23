"use client";

import { useEffect, useMemo, useState } from "react";
import { Evento, Categoria, CATEGORIE } from "@/lib/events";
import { EventCard } from "./EventCard";
import { CalendarioEventi } from "./CalendarioEventi";
import {
  IcoMapPin, IcoSearch, IcoCalendar, IcoLocate,
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura, IcoSalute,
} from "./icons";

// ── Gradiente e icone per le categorie ───────────────────────────────────────
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

const descCategoria: Record<string, string> = {
  Sagra: "Gusto locale", Musica: "Concerti", Cultura: "Arte e mostre",
  Sport: "Competizioni", Religioso: "Fede e storia", Mercato: "Artigianato", Natura: "Trekking", Salute: "Benessere",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura, Salute: IcoSalute,
};

// ── Definizioni aree geografiche ──────────────────────────────────────────────
const COMUNI_VALLO = new Set([
  "Atena Lucana", "Buonabitacolo", "Casalbuono", "Monte San Giacomo",
  "Montesano sulla Marcellana", "Padula", "Pertosa", "Polla",
  "Sala Consilina", "San Pietro al Tanagro", "San Rufo", "Sant'Arsenio",
  "Sassano", "Sanza", "Teggiano",
]);
const COMUNI_GOLFO = new Set([
  "Ispani", "Sapri", "Vibonati", "Scario", "Santa Marina",
  "Santa Marina di Camerota", "San Giovanni a Piro", "Torre Orsaia", "Torraca",
]);

type Area = "tutti" | "cilento" | "vallo" | "golfo";

const AREE: { id: Area; label: string }[] = [
  { id: "tutti",   label: "Tutti" },
  { id: "cilento", label: "Cilento" },
  { id: "vallo",   label: "Vallo di Diano" },
  { id: "golfo",   label: "Golfo di Policastro" },
];

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

export function EventiList({
  eventi,
  categoriaEsterna,
}: {
  eventi: Evento[];
  categoriaEsterna?: Categoria | null;
}) {
  const [categoria, setCategoria] = useState<Categoria | null>(categoriaEsterna ?? null);
  const [area, setArea] = useState<Area>("tutti");
  const [cerca, setCerca] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [soloGratuiti, setSoloGratuiti] = useState(false);
  const [soloAccessibili, setSoloAccessibili] = useState(false);

  useEffect(() => {
    if (categoriaEsterna !== undefined) setCategoria(categoriaEsterna ?? null);
  }, [categoriaEsterna]);

  function rilevaPosizione() {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const citta = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocationLabel(citta || "Posizione rilevata");
        } catch {
          /* ignore */
        } finally {
          setLocationLoading(false);
        }
      },
      () => setLocationLoading(false),
      { timeout: 10000 }
    );
  }

  const eventiFiltrati = useMemo(() => {
    return eventi.filter((e) => {
      if (area === "vallo" && !COMUNI_VALLO.has(e.comune)) return false;
      if (area === "golfo" && !COMUNI_GOLFO.has(e.comune)) return false;
      if (area === "cilento" && (COMUNI_VALLO.has(e.comune) || COMUNI_GOLFO.has(e.comune))) return false;
      if (categoria && e.categoria !== categoria) return false;
      // Range date: da → a (entrambi opzionali)
      if (dataInizio && (e.dataFine ?? e.data) < dataInizio) return false;
      if (dataFine && e.data > dataFine) return false;
      if (soloGratuiti && !e.servizi.ingressoGratuito) return false;
      if (soloAccessibili && !e.servizi.accessibileDisabili) return false;
      if (locationLabel) {
        const lf = locationLabel.toLowerCase();
        const comune = e.comune.toLowerCase();
        if (!comune.includes(lf) && !lf.includes(comune.split(/[-\s]/)[0])) return false;
      }
      if (cerca) {
        const q = cerca.toLowerCase();
        const haystack = [e.titolo, e.comune, e.categoria, e.descrizioneBreve, e.luogo]
          .join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [eventi, area, categoria, dataInizio, dataFine, locationLabel, cerca, soloGratuiti, soloAccessibili]);

  const filtriAttivi = categoria || cerca || soloGratuiti || soloAccessibili || dataInizio || dataFine || locationLabel || area !== "tutti";

  function resetFiltri() {
    setCategoria(null);
    setArea("tutti");
    setCerca("");
    setDataInizio("");
    setDataFine("");
    setLocationLabel("");
    setSoloGratuiti(false);
    setSoloAccessibili(false);
  }

  const [vistaCalendario, setVistaCalendario] = useState(false);

  return (
    <div>
      {/* ── Intestazione lista ── */}
      <div className="flex items-center justify-between mb-5 pt-2">
        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "#78716c" }}>
          Tutti gli eventi
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-400">
            <span className="font-black text-stone-700">{eventiFiltrati.length}</span>{" "}
            {eventiFiltrati.length === 1 ? "risultato" : "risultati"}
          </span>
          {/* Toggle vista lista / calendario */}
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "1.5px solid rgba(0,0,0,0.08)", background: "#f5f3ef" }}
          >
            <button
              onClick={() => setVistaCalendario(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold border-0 cursor-pointer transition-all"
              style={!vistaCalendario
                ? { background: "white", color: "#1a1a1a", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { background: "transparent", color: "#78716c" }}
              title="Vista lista"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              Lista
            </button>
            <button
              onClick={() => setVistaCalendario(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold border-0 cursor-pointer transition-all"
              style={vistaCalendario
                ? { background: "white", color: "#16a34a", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { background: "transparent", color: "#78716c" }}
              title="Vista calendario"
            >
              <IcoCalendar size={12} />
              Calendario
            </button>
          </div>
        </div>
      </div>

      {/* ── Barra filtri ── */}
      <div
        className="bg-white rounded-3xl p-5 mb-5"
        style={{
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* Ricerca */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4"
          style={{ background: "#f5f3ef" }}
        >
          <IcoSearch size={16} className="text-stone-400 shrink-0" />
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca eventi, luoghi, categorie…"
            className="flex-1 bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none font-medium"
            /* fontSize >= 16 previene lo zoom automatico su iOS */
            style={{ fontSize: 16 }}
          />
          {cerca && (
            <button
              onClick={() => setCerca("")}
              className="text-stone-400 hover:text-stone-600 border-0 bg-transparent cursor-pointer text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Pills area geografica */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {AREE.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setArea(id)}
              className="shrink-0 text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer transition-all whitespace-nowrap"
              style={
                area === id
                  ? { background: "#16a34a", color: "white" }
                  : { background: "#f5f3ef", color: "#78716c" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Calendario range + Posizione */}
        <div className="flex flex-col gap-2 mb-4">
          {/* Range date */}
          <div className="flex gap-2 items-center">
            <IcoCalendar size={14} className="text-stone-400 shrink-0" />
            <div
              className="flex-1 flex items-center gap-1.5 rounded-2xl px-3 py-2.5"
              style={{ background: "#f5f3ef" }}
            >
              <span className="text-[11px] font-bold text-stone-400 shrink-0">Dal</span>
              <input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="flex-1 bg-transparent font-medium text-stone-700 focus:outline-none min-w-0"
                style={{ colorScheme: "light", fontSize: 15 }}
              />
            </div>
            <span className="text-stone-300 text-sm shrink-0">→</span>
            <div
              className="flex-1 flex items-center gap-1.5 rounded-2xl px-3 py-2.5"
              style={{ background: "#f5f3ef" }}
            >
              <span className="text-[11px] font-bold text-stone-400 shrink-0">Al</span>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="flex-1 bg-transparent font-medium text-stone-700 focus:outline-none min-w-0"
                style={{ colorScheme: "light", fontSize: 15 }}
              />
            </div>
            {(dataInizio || dataFine) && (
              <button
                onClick={() => { setDataInizio(""); setDataFine(""); }}
                className="text-stone-400 border-0 bg-transparent cursor-pointer text-xl leading-none hover:text-stone-600 transition-colors shrink-0"
              >×</button>
            )}
          </div>
          {/* Posizione */}
          <button
            onClick={locationLabel ? () => setLocationLabel("") : rilevaPosizione}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-0 cursor-pointer transition-all font-semibold text-sm disabled:opacity-50 w-full justify-center"
            style={
              locationLabel
                ? { background: "#dcfce7", color: "#166534" }
                : { background: "#f5f3ef", color: "#78716c" }
            }
          >
            <IcoLocate size={14} />
            <span className="truncate max-w-[200px]">
              {locationLoading ? "Rilevamento…" : locationLabel || "Vicino a me"}
            </span>
          </button>
        </div>

        {/* Toggles + azzera */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Toggle label="Solo gratuiti" value={soloGratuiti} onChange={setSoloGratuiti} />
          <Toggle label="Solo accessibili" value={soloAccessibili} onChange={setSoloAccessibili} />

          {filtriAttivi && (
            <button
              onClick={resetFiltri}
              className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer border-0 transition-colors"
              style={{ background: "#fef2f2", color: "#dc2626" }}
            >
              × Azzera filtri
            </button>
          )}
        </div>
      </div>

      {/* ── Categorie — pills compatti ── */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5" style={{ color: "#78716c" }}>
          Filtra per categoria
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {/* Tutte */}
          <button
            onClick={() => setCategoria(null)}
            className="shrink-0 flex items-center gap-2 rounded-2xl border-0 cursor-pointer transition-all duration-200 px-3.5 py-2"
            style={{
              background: !categoria ? "#a3e635" : "white",
              boxShadow: !categoria
                ? "0 0 0 2px #65a30d"
                : "0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06)",
              color: !categoria ? "#14532d" : "#44403c",
            }}
          >
            <span style={{ fontSize: 15 }}>🌿</span>
            <span className="text-[12px] font-black whitespace-nowrap">Tutte</span>
          </button>

          {CATEGORIE.map((cat) => {
            const Ico = IconeCategoria[cat];
            const attivo = categoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoria(attivo ? null : cat)}
                className="shrink-0 flex items-center gap-2 rounded-2xl border-0 cursor-pointer transition-all duration-200 px-3.5 py-2"
                style={{
                  background: attivo ? "#a3e635" : "white",
                  boxShadow: attivo
                    ? "0 0 0 2px #65a30d"
                    : "0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Cerchio icona colorata */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: attivo ? "rgba(20,83,45,0.15)" : gradientCategoria[cat] }}
                >
                  <Ico size={12} strokeWidth={2} className={attivo ? "text-green-800" : "text-white"} />
                </div>
                <span
                  className="text-[12px] font-black whitespace-nowrap"
                  style={{ color: attivo ? "#14532d" : "#44403c" }}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Vista Calendario ── */}
      {vistaCalendario && (
        <div
          className="bg-white rounded-3xl p-5 mb-8"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.04)" }}
        >
          <CalendarioEventi eventi={eventiFiltrati} />
        </div>
      )}

      {/* ── Griglia lista ── */}
      {!vistaCalendario && (
        eventiFiltrati.length === 0 ? (
          <div
            className="text-center py-28 bg-white rounded-3xl"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#f5f3ef" }}
            >
              <IcoMapPin size={28} className="text-stone-300" />
            </div>
            <p className="text-stone-700 font-bold mb-1">Nessun evento trovato</p>
            <p className="text-stone-400 text-sm">Prova a modificare i filtri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventiFiltrati.map((evento) => (
              <EventCard key={evento.id} evento={evento} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        className="relative transition-colors duration-200"
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? "#a3e635" : "#e5e7eb",
        }}
      >
        <div
          className="absolute bg-white rounded-full shadow transition-transform duration-200"
          style={{
            width: 14,
            height: 14,
            top: 3,
            transform: value ? "translateX(19px)" : "translateX(3px)",
          }}
        />
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span className="text-sm font-medium text-stone-600">{label}</span>
    </label>
  );
}
