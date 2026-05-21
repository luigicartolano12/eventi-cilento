"use client";

import { useState } from "react";
import { Menu, IntolleranzaTag } from "@/lib/events";
import { IcoChevronRight } from "./icons";

const TAG: Record<IntolleranzaTag, { label: string; color: string; bg: string }> = {
  vegetariano:   { label: "Vegetariano",    color: "#166534", bg: "#dcfce7" },
  vegano:        { label: "Vegano",         color: "#14532d", bg: "#bbf7d0" },
  senzaGlutine:  { label: "Senza glutine",  color: "#92400e", bg: "#fef3c7" },
  senzaLattosio: { label: "Senza lattosio", color: "#1e40af", bg: "#dbeafe" },
};

export function MenuAccordion({ menu }: { menu: Menu }) {
  const [aperte, setAperte] = useState<Set<number>>(new Set([0]));

  const tagDisponibili = [
    ...new Set(
      menu.sezioni.flatMap((s) => s.voci.flatMap((v) => v.intolleranze ?? []))
    ),
  ] as IntolleranzaTag[];

  function toggle(i: number) {
    setAperte((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Badge intolleranze disponibili */}
      {tagDisponibili.length > 0 && (
        <div>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide mb-2">
            Opzioni disponibili
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tagDisponibili.map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: TAG[tag].bg, color: TAG[tag].color }}
              >
                {TAG[tag].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sezioni accordion */}
      <div className="flex flex-col gap-2">
        {menu.sezioni.map((sezione, i) => (
          <div
            key={sezione.titolo}
            className="rounded-xl overflow-hidden border border-stone-200"
          >
            {/* Header sezione — cliccabile */}
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-50 hover:bg-stone-100 text-left border-0 cursor-pointer transition-colors"
              aria-expanded={aperte.has(i)}
            >
              <span className="font-bold text-stone-800 text-sm">{sezione.titolo}</span>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="text-xs">{sezione.voci.length} piatti</span>
                <IcoChevronRight
                  size={14}
                  style={{
                    transform: aperte.has(i) ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
            </button>

            {/* Voci menu */}
            {aperte.has(i) && (
              <div className="divide-y divide-stone-100">
                {sezione.voci.map((voce) => (
                  <div key={voce.nome} className="px-4 py-3.5 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-stone-800 leading-snug">
                        {voce.nome}
                      </span>
                      {voce.prezzo && (
                        <span
                          className="text-sm font-black shrink-0"
                          style={{ color: "#65a30d" }}
                        >
                          {voce.prezzo}
                        </span>
                      )}
                    </div>
                    {voce.descrizione && (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {voce.descrizione}
                      </p>
                    )}
                    {voce.intolleranze && voce.intolleranze.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {voce.intolleranze.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: TAG[tag].bg, color: TAG[tag].color }}
                          >
                            {TAG[tag].label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota intolleranze */}
      {menu.noteIntolleranze && (
        <p className="text-xs text-stone-400 leading-relaxed pt-1 border-t border-stone-100">
          ⚠ {menu.noteIntolleranze}
        </p>
      )}
    </div>
  );
}
