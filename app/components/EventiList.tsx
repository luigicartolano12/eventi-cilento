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
      {/* ── Intestazione ── */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-0.5">
            Tutti gli eventi
          </p>
          <p className="text-sm font-semibold text-stone-700">
            <span className="font-black">{eventiFiltrati.length}</span>{" "}
            {eventiFiltrati.length === 1 ? "risultato" : "risultati"}
          </p>
        </div>

        {/* Toggle vista — più prominente */}
        <div
          className="flex items-center p-1 rounded-xl gap-1"
          style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)" }}
        >
          <button
            onClick={() => setVistaCalendario(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-all"
            style={!vistaCalendario
              ? { background: "#f0fdf4", color: "#16a34a" }
              : { background: "transparent", color: "#9ca3af" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Lista
          </button>
          <button
            onClick={() => setVistaCalendario(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-all"
            style={vistaCalendario
              ? { background: "#f0fdf4", color: "#16a34a" }
              : { background: "transparent", color: "#9ca3af" }}
          >
            <IcoCalendar size={12} />
            Calendario
          </button>
        </div>
      </div>

      {/* ── Filtri ── */}
      <div
        className="bg-white rounded-2xl mb-5 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.07)" }}
      >
        {/* Ricerca */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100">
          <IcoSearch size={15} className="text-stone-300 shrink-0" />
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca eventi, luoghi, categorie…"
            className="flex-1 bg-transparent text-stone-800 placeholder:text-stone-300 focus:outline-none font-medium"
            style={{ fontSize: 16 }}
          />
          {cerca && (
            <button
              onClick={() => setCerca("")}
              className="text-stone-300 hover:text-stone-500 border-0 bg-transparent cursor-pointer text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Categorie */}
        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setCategoria(null)}
              className="shrink-0 flex items-center gap-1.5 rounded-full border-0 cursor-pointer transition-all px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
              style={!categoria
                ? { background: "#16a34a", color: "white" }
                : { background: "#f5f3ef", color: "#78716c" }}
            >
              🌿 Tutte
            </button>
            {CATEGORIE.map((cat) => {
              const Ico = IconeCategoria[cat];
              const attivo = categoria === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoria(attivo ? null : cat)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full border-0 cursor-pointer transition-all px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
                  style={attivo
                    ? { background: "#16a34a", color: "white" }
                    : { background: "#f5f3ef", color: "#78716c" }}
                >
                  <Ico size={11} strokeWidth={2} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Area geografica */}
        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex gap-2 flex-wrap">
            {AREE.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setArea(id)}
                className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all whitespace-nowrap"
                style={area === id
                  ? { background: "#111827", color: "white" }
                  : { background: "#f5f3ef", color: "#78716c" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date + Posizione */}
        <div className="px-4 py-3 flex flex-col gap-2 border-b border-stone-100">
          <div className="flex gap-2 items-center">
            <IcoCalendar size={13} className="text-stone-300 shrink-0" />
            <div className="flex-1 flex items-center gap-1 rounded-xl px-3 py-2" style={{ background: "#f5f3ef" }}>
              <span className="text-[11px] font-semibold text-stone-400 shrink-0">Dal</span>
              <input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="flex-1 bg-transparent font-medium text-stone-700 focus:outline-none min-w-0 text-[13px]"
                style={{ colorScheme: "light" }}
              />
            </div>
            <span className="text-stone-300 shrink-0">–</span>
            <div className="flex-1 flex items-center gap-1 rounded-xl px-3 py-2" style={{ background: "#f5f3ef" }}>
              <span className="text-[11px] font-semibold text-stone-400 shrink-0">Al</span>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="flex-1 bg-transparent font-medium text-stone-700 focus:outline-none min-w-0 text-[13px]"
                style={{ colorScheme: "light" }}
              />
            </div>
            {(dataInizio || dataFine) && (
              <button
                onClick={() => { setDataInizio(""); setDataFine(""); }}
                className="text-stone-300 border-0 bg-transparent cursor-pointer text-lg leading-none hover:text-stone-500 transition-colors shrink-0"
              >×</button>
            )}
          </div>

          <button
            onClick={locationLabel ? () => setLocationLabel("") : rilevaPosizione}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-0 cursor-pointer transition-all font-semibold text-[13px] disabled:opacity-50 w-full justify-center"
            style={locationLabel
              ? { background: "#f0fdf4", color: "#16a34a" }
              : { background: "#f5f3ef", color: "#78716c" }}
          >
            <IcoLocate size={13} />
            <span className="truncate max-w-[200px]">
              {locationLoading ? "Rilevamento…" : locationLabel || "Vicino a me"}
            </span>
          </button>
        </div>

        {/* Toggles + reset */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Toggle label="Solo gratuiti" value={soloGratuiti} onChange={setSoloGratuiti} />
          <Toggle label="Solo accessibili" value={soloAccessibili} onChange={setSoloAccessibili} />
          {filtriAttivi && (
            <button
              onClick={resetFiltri}
              className="ml-auto text-[12px] font-semibold px-3 py-1.5 rounded-full cursor-pointer border-0 transition-colors"
              style={{ background: "#fef2f2", color: "#dc2626" }}
            >
              Azzera filtri
            </button>
          )}
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
