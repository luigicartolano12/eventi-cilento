"use client";

import { useState } from "react";
import { aggiungiPunti, getUtente, salvaUtente, PUNTI_AZIONI } from "@/lib/utente";

export function ProponiPunti() {
  const [stato, setStato] = useState<"idle" | "fatto">("idle");

  function riscatta() {
    const u = getUtente();
    if (!u) return;
    const aggiornato = aggiungiPunti(PUNTI_AZIONI.EVENTO_PROPOSTO);
    if (aggiornato) {
      salvaUtente({ ...aggiornato, eventiProposti: aggiornato.eventiProposti + 1 });
    }
    setStato("fatto");
  }

  if (!getUtente()) return null;

  if (stato === "fatto") {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold mt-6"
        style={{ background: "#f0fdf4", color: "#166534" }}
      >
        ✓ Ottimo! Hai guadagnato +{PUNTI_AZIONI.EVENTO_PROPOSTO} punti per aver proposto un evento.
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}
    >
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#78716c" }}>
          Contribuisci e guadagna
        </p>
        <p className="text-base font-black text-stone-900">
          Hai inviato la tua proposta?
        </p>
        <p className="text-sm text-stone-500 mt-1">
          Confermalo e guadagna{" "}
          <span className="font-black text-green-600">+{PUNTI_AZIONI.EVENTO_PROPOSTO} punti</span>{" "}
          per il tuo contributo al portale.
        </p>
      </div>
      <button
        onClick={riscatta}
        className="w-full py-3.5 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: "#a3e635", color: "#14532d" }}
      >
        Ho inviato la proposta →
      </button>
    </div>
  );
}
