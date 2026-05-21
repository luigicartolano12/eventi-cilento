"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUtente } from "@/lib/utente";

export function UserButton() {
  const [iniziali, setIniziali] = useState<string | null>(null);
  const [punti, setPunti] = useState(0);

  useEffect(() => {
    function aggiorna() {
      const u = getUtente();
      if (u) {
        setIniziali(`${u.nome[0]}${u.cognome[0]}`.toUpperCase());
        setPunti(u.punti);
      } else {
        setIniziali(null);
        setPunti(0);
      }
    }
    aggiorna();
    window.addEventListener("utente-aggiornato", aggiorna);
    window.addEventListener("storage", aggiorna);
    return () => {
      window.removeEventListener("utente-aggiornato", aggiorna);
      window.removeEventListener("storage", aggiorna);
    };
  }, []);

  if (!iniziali) {
    return (
      <Link
        href="/registrati"
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
      >
        Accedi
      </Link>
    );
  }

  return (
    <Link
      href="/profilo"
      className="inline-flex items-center gap-2 px-2 py-1 rounded-xl transition-opacity hover:opacity-80"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: "#a3e635", color: "#0f2318" }}
      >
        {iniziali}
      </div>
      <span className="hidden sm:block text-xs font-bold" style={{ color: "#a3e635" }}>
        {punti} pt
      </span>
    </Link>
  );
}
