"use client";

import { useMemo, useState } from "react";
import { Evento, Categoria, CATEGORIE } from "@/lib/events";
import { EventCard } from "./EventCard";

const coloriBottone: Record<string, { bg: string; text: string }> = {
  Sagra:    { bg: "#fff7ed", text: "#9a3412" },
  Musica:   { bg: "#faf5ff", text: "#6b21a8" },
  Cultura:  { bg: "#eff6ff", text: "#1e40af" },
  Sport:    { bg: "#f0fdf4", text: "#166534" },
  Religioso:{ bg: "#fffbeb", text: "#92400e" },
  Mercato:  { bg: "#fdf2f8", text: "#9d174d" },
  Natura:   { bg: "#ecfdf5", text: "#065f46" },
};

export function EventiList({ eventi }: { eventi: Evento[] }) {
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [dataFiltro, setDataFiltro] = useState("");
  const [comuneFiltro, setComuneFiltro] = useState("");
  const [soloGratuiti, setSoloGratuiti] = useState(false);
  const [soloAccessibili, setSoloAccessibili] = useState(false);

  const comuni = useMemo(
    () => [...new Set(eventi.map((e) => e.comune))].sort(),
    [eventi]
  );

  const eventiFiltrati = useMemo(() => {
    return eventi.filter((e) => {
      if (categoria && e.categoria !== categoria) return false;
      if (comuneFiltro && e.comune !== comuneFiltro) return false;
      if (dataFiltro && e.data < dataFiltro) return false;
      if (soloGratuiti && !e.servizi.ingressoGratuito) return false;
      if (soloAccessibili && !e.servizi.accessibileDisabili) return false;
      return true;
    });
  }, [eventi, categoria, comuneFiltro, dataFiltro, soloGratuiti, soloAccessibili]);

  const filtriAttivi =
    categoria || comuneFiltro || dataFiltro || soloGratuiti || soloAccessibili;

  function resetFiltri() {
    setCategoria(null);
    setDataFiltro("");
    setComuneFiltro("");
    setSoloGratuiti(false);
    setSoloAccessibili(false);
  }

  return (
    <div>
      {/* Pannello filtri — appare "galleggiante" sull'hero */}
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5 mb-8 flex flex-col gap-4">
        {/* Categoria */}
        <div>
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">
            Categoria
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoria(null)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer"
              style={
                !categoria
                  ? { background: "#1a3529", color: "white", borderColor: "#1a3529" }
                  : { background: "white", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              Tutti
            </button>
            {CATEGORIE.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria((prev) => (prev === cat ? null : cat))}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer"
                style={
                  categoria === cat
                    ? { background: "#1a3529", color: "white", borderColor: "#1a3529" }
                    : {
                        background: coloriBottone[cat].bg,
                        color: coloriBottone[cat].text,
                        borderColor: "transparent",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Data e Comune */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="filtro-data"
              className="text-[11px] font-bold text-stone-400 uppercase tracking-widest"
            >
              Mostra eventi dal
            </label>
            <input
              id="filtro-data"
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "#16a34a" } as React.CSSProperties}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="filtro-comune"
              className="text-[11px] font-bold text-stone-400 uppercase tracking-widest"
            >
              Comune
            </label>
            <select
              id="filtro-comune"
              value={comuneFiltro}
              onChange={(e) => setComuneFiltro(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:border-transparent"
            >
              <option value="">Tutti i comuni</option>
              {comuni.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle rapidi + contatore */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloGratuiti}
              onChange={(e) => setSoloGratuiti(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: "#16a34a" }}
            />
            <span className="text-sm text-stone-700 font-medium">Solo gratuiti</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloAccessibili}
              onChange={(e) => setSoloAccessibili(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: "#16a34a" }}
            />
            <span className="text-sm text-stone-700 font-medium">♿ Solo accessibili</span>
          </label>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-stone-400">
              <span className="font-bold text-stone-700">{eventiFiltrati.length}</span>{" "}
              {eventiFiltrati.length === 1 ? "evento" : "eventi"}
            </span>
            {filtriAttivi && (
              <button
                onClick={resetFiltri}
                className="text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-colors"
                style={{ color: "#dc2626", borderColor: "#fecaca" }}
              >
                × Azzera
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Griglia */}
      {eventiFiltrati.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-stone-100">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-stone-500 font-semibold mb-1">Nessun evento trovato</p>
          <p className="text-stone-400 text-sm">Prova a modificare i filtri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventiFiltrati.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}
