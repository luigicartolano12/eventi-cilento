"use client";

import { useMemo, useState } from "react";
import { Evento, Categoria, CATEGORIE } from "@/lib/events";
import { EventCard } from "./EventCard";

const coloriBottone: Record<string, string> = {
  Sagra: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  Musica: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  Cultura: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  Sport: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  Religioso: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  Mercato: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  Natura: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
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
      {/* Pannello filtri */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8 flex flex-col gap-5">
        {/* Riga 1: categoria */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
            Categoria
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoria(null)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                !categoria
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-600 border-stone-300 hover:bg-stone-100"
              }`}
            >
              Tutti
            </button>
            {CATEGORIE.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria((prev) => (prev === cat ? null : cat))}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  categoria === cat
                    ? "bg-stone-800 text-white border-stone-800"
                    : coloriBottone[cat]
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Riga 2: data e comune */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="filtro-data"
              className="text-xs font-semibold text-stone-400 uppercase tracking-wider"
            >
              Mostra eventi dal
            </label>
            <input
              id="filtro-data"
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="filtro-comune"
              className="text-xs font-semibold text-stone-400 uppercase tracking-wider"
            >
              Comune
            </label>
            <select
              id="filtro-comune"
              value={comuneFiltro}
              onChange={(e) => setComuneFiltro(e.target.value)}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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

        {/* Riga 3: toggle rapidi e reset */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloGratuiti}
              onChange={(e) => setSoloGratuiti(e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-stone-700">Solo gratuiti</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloAccessibili}
              onChange={(e) => setSoloAccessibili(e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-stone-700">♿ Solo accessibili</span>
          </label>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {eventiFiltrati.length}{" "}
              {eventiFiltrati.length === 1 ? "evento trovato" : "eventi trovati"}
            </span>
            {filtriAttivi && (
              <button
                onClick={resetFiltri}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                × Azzera filtri
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Griglia eventi */}
      {eventiFiltrati.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 text-lg mb-2">Nessun evento trovato</p>
          <p className="text-stone-400 text-sm">
            Prova a modificare i filtri di ricerca.
          </p>
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
