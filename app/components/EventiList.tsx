"use client";

import { useEffect, useMemo, useState } from "react";
import { Evento, Categoria, CATEGORIE } from "@/lib/events";
import { EventCard } from "./EventCard";
import { IcoMapPin } from "./icons";

const coloriBottone: Record<string, { bg: string; text: string }> = {
  Sagra:    { bg: "#fff7ed", text: "#9a3412" },
  Musica:   { bg: "#faf5ff", text: "#6b21a8" },
  Cultura:  { bg: "#eff6ff", text: "#1e40af" },
  Sport:    { bg: "#f0fdf4", text: "#166534" },
  Religioso:{ bg: "#fffbeb", text: "#92400e" },
  Mercato:  { bg: "#fdf2f8", text: "#9d174d" },
  Natura:   { bg: "#ecfdf5", text: "#065f46" },
};

const ACTIVE_BG   = "#a3e635";
const ACTIVE_TEXT = "#14532d";

export function EventiList({
  eventi,
  categoriaEsterna,
  dataEsterna,
}: {
  eventi: Evento[];
  categoriaEsterna?: Categoria | null;
  dataEsterna?: string;
}) {
  const [categoria, setCategoria] = useState<Categoria | null>(categoriaEsterna ?? null);
  const [comuneFiltro, setComuneFiltro] = useState("");
  const [soloGratuiti, setSoloGratuiti] = useState(false);
  const [soloAccessibili, setSoloAccessibili] = useState(false);

  useEffect(() => {
    if (categoriaEsterna !== undefined) setCategoria(categoriaEsterna ?? null);
  }, [categoriaEsterna]);

  const comuni = useMemo(
    () => [...new Set(eventi.map((e) => e.comune))].sort(),
    [eventi]
  );

  const eventiFiltrati = useMemo(() => {
    return eventi.filter((e) => {
      if (categoria && e.categoria !== categoria) return false;
      if (comuneFiltro && e.comune !== comuneFiltro) return false;
      if (dataEsterna && e.data < dataEsterna) return false;
      if (soloGratuiti && !e.servizi.ingressoGratuito) return false;
      if (soloAccessibili && !e.servizi.accessibileDisabili) return false;
      return true;
    });
  }, [eventi, categoria, comuneFiltro, dataEsterna, soloGratuiti, soloAccessibili]);

  const filtriAttivi = categoria || comuneFiltro || soloGratuiti || soloAccessibili;

  function resetFiltri() {
    setCategoria(null);
    setComuneFiltro("");
    setSoloGratuiti(false);
    setSoloAccessibili(false);
  }

  return (
    <div>
      {/* Pannello filtri */}
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5 mb-8 flex flex-col gap-4">

        {/* Categoria */}
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2.5">
            Categoria
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoria(null)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border-0 transition-all cursor-pointer"
              style={!categoria
                ? { background: ACTIVE_BG, color: ACTIVE_TEXT }
                : { background: "#f5f5f4", color: "#78716c" }}
            >
              Tutti
            </button>
            {CATEGORIE.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria((prev) => (prev === cat ? null : cat))}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border-0 transition-all cursor-pointer"
                style={categoria === cat
                  ? { background: ACTIVE_BG, color: ACTIVE_TEXT }
                  : { background: coloriBottone[cat].bg, color: coloriBottone[cat].text }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comune */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-comune" className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <IcoMapPin size={11} />
            Comune
          </label>
          <select
            id="filtro-comune"
            value={comuneFiltro}
            onChange={(e) => setComuneFiltro(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:border-transparent appearance-none transition"
          >
            <option value="">Tutti i comuni</option>
            {comuni.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Toggle + contatore */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1 border-t border-stone-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className="w-8 h-4 rounded-full relative transition-colors"
              style={{ background: soloGratuiti ? ACTIVE_BG : "#e5e7eb" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                style={{ transform: soloGratuiti ? "translateX(18px)" : "translateX(2px)" }}
              />
              <input
                type="checkbox"
                checked={soloGratuiti}
                onChange={(e) => setSoloGratuiti(e.target.checked)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <span className="text-sm text-stone-700 font-medium">Solo gratuiti</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className="w-8 h-4 rounded-full relative transition-colors"
              style={{ background: soloAccessibili ? ACTIVE_BG : "#e5e7eb" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                style={{ transform: soloAccessibili ? "translateX(18px)" : "translateX(2px)" }}
              />
              <input
                type="checkbox"
                checked={soloAccessibili}
                onChange={(e) => setSoloAccessibili(e.target.checked)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <span className="text-sm text-stone-700 font-medium">Solo accessibili</span>
          </label>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-stone-400">
              <span className="font-black text-stone-700">{eventiFiltrati.length}</span>{" "}
              {eventiFiltrati.length === 1 ? "evento" : "eventi"}
            </span>
            {filtriAttivi && (
              <button
                onClick={resetFiltri}
                className="text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors border border-red-200 text-red-500 hover:bg-red-50"
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
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IcoMapPin size={28} className="text-stone-300" />
          </div>
          <p className="text-stone-600 font-bold mb-1">Nessun evento trovato</p>
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
