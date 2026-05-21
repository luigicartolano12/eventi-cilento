"use client";

import { useState } from "react";
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
  const [filtro, setFiltro] = useState<Categoria | null>(null);

  const eventiFiltrati = filtro
    ? eventi.filter((e) => e.categoria === filtro)
    : eventi;

  function toggleFiltro(cat: Categoria) {
    setFiltro((prev) => (prev === cat ? null : cat));
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setFiltro(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            filtro === null
              ? "bg-stone-800 text-white border-stone-800"
              : "bg-white text-stone-600 border-stone-300 hover:bg-stone-100"
          }`}
        >
          Tutti
        </button>
        {CATEGORIE.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleFiltro(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
              filtro === cat
                ? "bg-stone-800 text-white border-stone-800"
                : coloriBottone[cat]
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {eventiFiltrati.length === 0 ? (
        <p className="text-center text-stone-500 py-16">
          Nessun evento trovato per questa categoria.
        </p>
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
