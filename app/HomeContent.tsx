"use client";

import { useEffect, useState } from "react";
import { Evento, Categoria, formattaData } from "@/lib/events";
import { getEventiApprovati, type EventoDinamico } from "@/lib/eventi-dinamici";
import { EventiList } from "./components/EventiList";
import {
  IcoMapPin, IcoClock,
} from "./components/icons";

// ── Mappatura keyword immagini per categoria ──────────────────────────────────

const kwCategoria: Record<string, string> = {
  Sagra:     "food,festival",
  Musica:    "concert,music",
  Cultura:   "ruins,columns",
  Sport:     "sport,outdoor",
  Religioso: "church,procession",
  Mercato:   "market,stalls",
  Natura:    "nature,trail",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 9999 + 1;
}

function oggiISO() {
  return new Date().toISOString().split("T")[0];
}

function eventiDiOggi(eventi: Evento[]): Evento[] {
  const oggi = oggiISO();
  return eventi.filter((e) => oggi >= e.data && oggi <= (e.dataFine ?? e.data));
}

// ── Mini card: evento di oggi ─────────────────────────────────────────────────
function MiniCard({ evento }: { evento: Evento }) {
  const kw = kwCategoria[evento.categoria] ?? "nature,trail";
  const lock = hashId(evento.id);
  return (
    <a
      href={`/events/${evento.id}`}
      className="shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 152,
        background: "white",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ height: 88 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://loremflickr.com/160/100/${kw}/all?lock=${lock}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <span
          className="relative z-10 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.28)", color: "white", backdropFilter: "blur(8px)" }}
        >
          {evento.categoria}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p
          className="text-[12px] font-bold leading-snug text-stone-900"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#78716c" }}>
          <IcoMapPin size={9} />
          {evento.comune}
        </span>
        {evento.orario && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#16a34a" }}>
            <IcoClock size={9} />
            {evento.orario}
          </span>
        )}
      </div>
    </a>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export function HomeContent({ eventi }: { eventi: Evento[] }) {
  const [eventiExtra, setEventiExtra] = useState<Evento[]>([]);

  function convertiDinamico(d: EventoDinamico): Evento {
    return {
      id: d.id,
      titolo: d.titolo,
      data: d.data,
      dataFine: d.dataFine,
      orario: d.orario,
      luogo: d.luogo ?? d.comune,
      comune: d.comune,
      categoria: d.categoria,
      descrizioneBreve: d.descrizione.slice(0, 120),
      descrizione: d.descrizione,
      pubblico: "Tutti",
      servizi: {
        accessibileDisabili: false,
        parcheggio: false,
        ingressoGratuito: d.gratuito ?? false,
        prenotazioneRichiesta: false,
        petFriendly: false,
      },
    };
  }

  useEffect(() => {
    const locali = getEventiApprovati().map(convertiDinamico);
    setEventiExtra(locali);
    fetch("/api/eventi-live")
      .then((r) => r.json())
      .then((kvEventi: EventoDinamico[]) => {
        if (kvEventi.length > 0) {
          const idLocali = new Set(locali.map((e) => e.id));
          const nuovi = kvEventi.filter((e) => !idLocali.has(e.id)).map(convertiDinamico);
          setEventiExtra((prev) => [...prev, ...nuovi]);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tutti gli eventi uniti e ordinati per data ────────────────────────────
  const tuttiGliEventi = [...eventiExtra, ...eventi].sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  const oggi = eventiDiOggi(tuttiGliEventi);

  // ── Comuni coinvolti oggi ─────────────────────────────────────────────────
  const comuniOggi = [...new Set(oggi.map((e) => e.comune))];
  const comuniLabel = comuniOggi.slice(0, 2).join(" · ") + (comuniOggi.length > 2 ? ` · +${comuniOggi.length - 2}` : "");

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── 01 HEAD ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pt-14 pb-8">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
            style={{ color: "#16a34a" }}
          >
            Cilento &amp; Vallo di Diano
          </p>
          <h1
            className="font-black leading-[0.88] tracking-tight text-stone-900 mb-5"
            style={{ fontSize: "clamp(48px, 8vw, 88px)" }}
          >
            Scopri gli eventi<br />
            <span style={{ color: "#65a30d" }}>del Cilento</span>.
          </h1>

          {/* ── 02 SUBHEAD ── */}
          <p
            className="text-base sm:text-lg leading-relaxed max-w-sm"
            style={{ color: "#78716c" }}
          >
            Sagre, concerti, mostre, sport e natura nel Parco Nazionale del Cilento.
          </p>
        </div>
      </div>

      {/* ── 03 OGGI STRIP ── */}
      {oggi.length > 0 && (
        <div style={{ background: "#f5f3ef" }} className="px-5 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header strip */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#16a34a" }}
              />
              <span
                className="text-sm font-black"
                style={{ color: "#16a34a" }}
              >
                {oggi.length} {oggi.length === 1 ? "evento" : "eventi"} oggi
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                {formattaData(oggiISO())}
              </span>
              {comuniOggi.length > 0 && (
                <span className="text-[11px] font-medium hidden sm:inline" style={{ color: "#78716c" }}>
                  {comuniLabel}
                </span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {oggi.map((e) => <MiniCard key={e.id} evento={e} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── 04 EVENTI LIST ── */}
      <div style={{ background: "#f5f3ef" }} className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <EventiList eventi={tuttiGliEventi} categoriaEsterna={null} />
        </div>
      </div>
    </>
  );
}
