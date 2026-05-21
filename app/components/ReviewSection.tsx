"use client";

import { useState, useEffect, useCallback } from "react";
import { Evento, formattaData } from "@/lib/events";
import { IcoMapPin, IcoLock } from "./icons";

// Coordinate approssimative dei comuni del Cilento
const COORD_COMUNI: Record<string, [number, number]> = {
  "Agropoli":            [40.3492, 14.9912],
  "Capaccio-Paestum":    [40.4256, 15.0043],
  "Centola-Palinuro":    [40.0407, 15.2829],
  "Celle di Bulgheria":  [40.0833, 15.3667],
  "Controne":            [40.5167, 15.1833],
  "Novi Velia":          [40.1500, 15.2500],
  "Pisciotta":           [40.1117, 15.2356],
  "Teggiano":            [40.3833, 15.5333],
  "Vallo della Lucania": [40.2333, 15.2667],
};

const RAGGIO_KM = 5;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Stelle ────────────────────────────────────────────────────────────────────
function Stelle({
  valore,
  onChange,
  size = 24,
}: {
  valore: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const piena = n <= (hover || valore);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            onMouseEnter={() => onChange && setHover(n)}
            onMouseLeave={() => onChange && setHover(0)}
            className={`border-0 bg-transparent p-0.5 ${onChange ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`${n} stelle`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={piena ? "#facc15" : "none"}
              stroke={piena ? "#f59e0b" : "#d1d5db"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Tipi locali ───────────────────────────────────────────────────────────────
type Recensione = {
  id: string;
  stelle: number;
  testo: string;
  dataInvio: string;
  verificata: boolean;
};

type Stato = "idle" | "loading" | "verificato" | "troppoLontano" | "erroreGeo" | "inviato";

// ── Componente principale ─────────────────────────────────────────────────────
export function ReviewSection({ evento }: { evento: Evento }) {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [stato, setStato] = useState<Stato>("idle");
  const [stelle, setStelle] = useState(0);
  const [testo, setTesto] = useState("");
  const [geoMsg, setGeoMsg] = useState("");

  // L'evento è oggi (o in corso)?
  const oggi = new Date().toISOString().split("T")[0];
  const isOggi = oggi >= evento.data && oggi <= (evento.dataFine ?? evento.data);

  // Carica recensioni da localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`recensioni-${evento.id}`);
      if (raw) setRecensioni(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [evento.id]);

  const salva = useCallback(
    (nuove: Recensione[]) => {
      localStorage.setItem(`recensioni-${evento.id}`, JSON.stringify(nuove));
      setRecensioni(nuove);
    },
    [evento.id]
  );

  // ── Verifica posizione ────────────────────────────────────────────────────
  function verificaPosizione() {
    if (!navigator.geolocation) {
      setGeoMsg("Geolocalizzazione non supportata dal browser.");
      setStato("erroreGeo");
      return;
    }
    setStato("loading");
    setGeoMsg("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = COORD_COMUNI[evento.comune];
        if (!coord) {
          // Comune senza coordinate: permettiamo la recensione
          setStato("verificato");
          return;
        }
        const km = haversineKm(
          pos.coords.latitude,
          pos.coords.longitude,
          coord[0],
          coord[1]
        );
        if (km <= RAGGIO_KM) {
          setStato("verificato");
        } else {
          setStato("troppoLontano");
          setGeoMsg(
            `Sei a ${km.toFixed(1)} km dall'evento. Devi essere entro ${RAGGIO_KM} km.`
          );
        }
      },
      () => {
        setStato("erroreGeo");
        setGeoMsg("Permesso di geolocalizzazione negato o non disponibile.");
      },
      { timeout: 10000 }
    );
  }

  // ── Invio recensione ──────────────────────────────────────────────────────
  function invia() {
    if (!stelle || !testo.trim()) return;
    const nuova: Recensione = {
      id: Date.now().toString(),
      stelle,
      testo: testo.trim(),
      dataInvio: new Date().toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      verificata: stato === "verificato",
    };
    salva([nuova, ...recensioni]);
    setStato("inviato");
    setStelle(0);
    setTesto("");
  }

  const media =
    recensioni.length > 0
      ? recensioni.reduce((s, r) => s + r.stelle, 0) / recensioni.length
      : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* Media voti */}
      {recensioni.length > 0 && (
        <div className="flex items-center gap-3 pb-1">
          <Stelle valore={Math.round(media)} size={18} />
          <span className="text-sm text-stone-500">
            <span className="font-black text-stone-800">{media.toFixed(1)}</span>
            {" "}· {recensioni.length}{" "}
            {recensioni.length === 1 ? "recensione" : "recensioni"}
          </span>
        </div>
      )}

      {/* ── Blocco aggiunta recensione ── */}

      {stato === "inviato" ? (
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold"
          style={{ background: "#f0fdf4", color: "#166534" }}
        >
          ✓ Recensione inviata! Grazie per il tuo contributo.
        </div>

      ) : !isOggi ? (
        /* Evento non oggi */
        <div
          className="flex items-start gap-3 px-4 py-4 rounded-2xl"
          style={{ background: "#f5f3ef" }}
        >
          <IcoLock size={15} className="text-stone-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-stone-700">
              Recensioni disponibili durante l&apos;evento
            </p>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Potrai lasciare una recensione il{" "}
              <span className="font-semibold capitalize">
                {formattaData(evento.data)}
                {evento.dataFine ? ` – ${formattaData(evento.dataFine)}` : ""}
              </span>
              , dal luogo dell&apos;evento.
            </p>
          </div>
        </div>

      ) : stato === "verificato" ? (
        /* Form recensione */
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-stone-200">
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-full w-fit"
            style={{ background: "#dcfce7", color: "#166534" }}
          >
            ✓ Posizione verificata
          </span>

          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
              Il tuo voto
            </p>
            <Stelle valore={stelle} onChange={setStelle} size={28} />
          </div>

          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
              La tua esperienza
            </p>
            <textarea
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Raccontaci com'è andato l'evento…"
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-300 resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={invia}
            disabled={!stelle || !testo.trim()}
            className="py-3.5 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#a3e635", color: "#14532d" }}
          >
            Invia recensione
          </button>
        </div>

      ) : (
        /* Richiedi verifica */
        <div className="flex flex-col gap-3 p-4 rounded-2xl border border-stone-200">
          <div className="flex items-start gap-3">
            <IcoMapPin size={15} className="text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-stone-700">Sei all&apos;evento?</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                Verifica la posizione GPS per sbloccare la recensione.
              </p>
            </div>
          </div>

          {geoMsg && (
            <p className="text-xs font-medium rounded-xl px-3 py-2" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              {geoMsg}
            </p>
          )}

          <button
            onClick={verificaPosizione}
            disabled={stato === "loading"}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "#1a3529", color: "white" }}
          >
            <IcoMapPin size={14} />
            {stato === "loading" ? "Rilevamento…" : "Verifica la mia posizione"}
          </button>
        </div>
      )}

      {/* ── Lista recensioni ── */}
      {recensioni.length > 0 && (
        <div className="flex flex-col gap-3">
          {recensioni.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-2 p-4 rounded-2xl"
              style={{ background: "#f5f3ef" }}
            >
              <div className="flex items-center justify-between gap-2">
                <Stelle valore={r.stelle} size={16} />
                <span className="text-xs text-stone-400">{r.dataInvio}</span>
              </div>
              {r.verificata && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full w-fit"
                  style={{ background: "#dcfce7", color: "#166634" }}
                >
                  ✓ Posizione verificata
                </span>
              )}
              <p className="text-sm text-stone-700 leading-relaxed">{r.testo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
