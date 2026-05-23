"use client";

import { useMemo, useState } from "react";
import type { Evento } from "@/lib/events";
import { formattaData } from "@/lib/events";
import Link from "next/link";
import { IcoMapPin } from "./icons";

const COLORI: Record<string, string> = {
  Sagra:     "#ea580c",
  Musica:    "#9333ea",
  Cultura:   "#2563eb",
  Sport:     "#16a34a",
  Religioso: "#d97706",
  Mercato:   "#db2777",
  Natura:    "#059669",
  Salute:    "#be185d",
};

const MESI_IT = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];
const GIORNI_IT = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

export function CalendarioEventi({ eventi }: { eventi: Evento[] }) {
  const oggi = new Date();
  const [anno, setAnno] = useState(oggi.getFullYear());
  const [mese, setMese] = useState(oggi.getMonth()); // 0-indexed
  const [giornoSel, setGiornoSel] = useState<string | null>(null);

  // Giorni del mese corrente
  const giorni = useMemo(() => {
    const primo = new Date(anno, mese, 1);
    const ultimo = new Date(anno, mese + 1, 0);
    // Giorno della settimana del primo giorno (0=Dom → offset per iniziare da Lun)
    const offsetLun = (primo.getDay() + 6) % 7;
    const cella: (number | null)[] = Array(offsetLun).fill(null);
    for (let d = 1; d <= ultimo.getDate(); d++) cella.push(d);
    // Padding fine
    while (cella.length % 7 !== 0) cella.push(null);
    return cella;
  }, [anno, mese]);

  // Mappa iso-date → eventi
  const eventiPerGiorno = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    eventi.forEach(e => {
      const start = new Date(e.data);
      const end = new Date(e.dataFine ?? e.data);
      // Itera tutti i giorni coperti dall'evento
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split("T")[0];
        if (!map[key]) map[key] = [];
        map[key].push(e);
      }
    });
    return map;
  }, [eventi]);

  function isoGiorno(d: number) {
    return `${anno}-${String(mese + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function cambiaMe(delta: number) {
    let m = mese + delta;
    let a = anno;
    if (m > 11) { m = 0; a++; }
    if (m < 0)  { m = 11; a--; }
    setMese(m); setAnno(a); setGiornoSel(null);
  }

  const oggiISO = oggi.toISOString().split("T")[0];
  const eventiGiornoSel = giornoSel ? (eventiPerGiorno[giornoSel] ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header mese */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => cambiaMe(-1)}
          className="w-9 h-9 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all text-lg font-bold"
        >
          ‹
        </button>
        <h2 className="text-base font-black text-stone-900">
          {MESI_IT[mese]} {anno}
        </h2>
        <button
          onClick={() => cambiaMe(1)}
          className="w-9 h-9 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all text-lg font-bold"
        >
          ›
        </button>
      </div>

      {/* Intestazione giorni settimana */}
      <div className="grid grid-cols-7 gap-1">
        {GIORNI_IT.map(g => (
          <div key={g} className="text-center text-[11px] font-black text-stone-400 uppercase tracking-widest py-1">
            {g}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div className="grid grid-cols-7 gap-1">
        {giorni.map((giorno, i) => {
          if (!giorno) return <div key={i} />;
          const iso = isoGiorno(giorno);
          const eventiQ = eventiPerGiorno[iso] ?? [];
          const hasEventi = eventiQ.length > 0;
          const isOggi = iso === oggiISO;
          const isSel = iso === giornoSel;
          const isPast = iso < oggiISO;

          return (
            <button
              key={i}
              onClick={() => setGiornoSel(isSel ? null : iso)}
              disabled={!hasEventi}
              className="relative flex flex-col items-center py-2 px-1 rounded-2xl border-0 cursor-pointer transition-all disabled:cursor-default"
              style={{
                background: isSel ? "#1a3529" : isOggi ? "#f0fdf4" : "transparent",
                opacity: isPast && !hasEventi ? 0.35 : 1,
              }}
            >
              {/* Numero giorno */}
              <span
                className="text-[13px] font-bold leading-none"
                style={{
                  color: isSel ? "#a3e635" : isOggi ? "#16a34a" : hasEventi ? "#1c1917" : "#9ca3af",
                  fontWeight: hasEventi ? 900 : 500,
                }}
              >
                {giorno}
              </span>

              {/* Dot eventi (max 3 colori) */}
              {hasEventi && (
                <div className="flex gap-0.5 mt-1.5">
                  {eventiQ.slice(0, 3).map((e, j) => (
                    <div
                      key={j}
                      style={{
                        width: 5, height: 5,
                        borderRadius: "50%",
                        background: isSel ? "rgba(163,230,53,0.7)" : COLORI[e.categoria] ?? "#16a34a",
                      }}
                    />
                  ))}
                  {eventiQ.length > 3 && (
                    <span className="text-[8px] font-black" style={{ color: isSel ? "#a3e635" : "#9ca3af" }}>
                      +{eventiQ.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pannello eventi giorno selezionato */}
      {giornoSel && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#f5f3ef" }}>
            <p className="text-[11px] font-black uppercase tracking-widest text-stone-500 capitalize">
              {new Date(giornoSel + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "#dcfce7", color: "#166534" }}
            >
              {eventiGiornoSel.length} {eventiGiornoSel.length === 1 ? "evento" : "eventi"}
            </span>
          </div>
          {eventiGiornoSel.length === 0 ? (
            <p className="px-5 py-6 text-sm text-center text-stone-400">Nessun evento in questo giorno</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {eventiGiornoSel.map(e => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: COLORI[e.categoria] ?? "#16a34a" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-stone-900 truncate">{e.titolo}</p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <IcoMapPin size={9} />
                      {e.comune}
                      {e.orario && ` · ore ${e.orario}`}
                    </p>
                  </div>
                  <span className="text-stone-300 text-base shrink-0">›</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {Object.entries(COLORI).map(([cat, col]) => (
          <span key={cat} className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, display: "inline-block" }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
