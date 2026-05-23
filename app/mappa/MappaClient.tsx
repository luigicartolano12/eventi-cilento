"use client";

import { useEffect, useRef, useState } from "react";
import type { Evento } from "@/lib/events";
import { formattaData } from "@/lib/events";
import { IcoCalendar, IcoMapPin } from "@/app/components/icons";
import Link from "next/link";

// Coordinate centroidi dei comuni del Cilento e Vallo di Diano
const COORDINATE_COMUNI: Record<string, [number, number]> = {
  // Cilento Costiero
  "Agropoli":              [40.349, 15.002],
  "Capaccio-Paestum":      [40.419, 15.088],
  "Castellabate":          [40.279, 15.215],
  "San Marco di Castellabate": [40.284, 15.200],
  "Pollica":               [40.168, 15.167],
  "Acciaroli":             [40.169, 15.167],
  "Pisciotta":             [40.108, 15.240],
  "Centola":               [40.058, 15.285],
  "Palinuro":              [40.030, 15.283],
  "Camerota":              [40.012, 15.375],
  "Ascea":                 [40.141, 15.186],
  "Casal Velino":          [40.183, 15.117],
  "Montecorice":           [40.238, 15.093],
  "Ogliastro Cilento":     [40.251, 15.074],
  "Perdifumo":             [40.256, 15.116],
  "Prignano Cilento":      [40.264, 15.156],
  "Omignano":              [40.194, 15.134],
  "Salento":               [40.208, 15.224],
  "Laureana Cilento":      [40.226, 15.136],
  "Lustra":                [40.249, 15.196],
  "Stella Cilento":        [40.238, 15.211],
  "Torchiara":             [40.276, 15.109],
  "Cicerale":              [40.338, 15.150],
  "Gioi":                  [40.257, 15.239],
  "Moio della Civitella":  [40.268, 15.265],
  "Orria":                 [40.264, 15.257],
  "Perito":                [40.285, 15.267],
  "Ceraso":                [40.242, 15.315],
  "Novi Velia":            [40.233, 15.317],
  "Alfano":                [40.147, 15.478],
  "Futani":                [40.188, 15.418],

  // Golfo di Policastro
  "Sapri":                 [40.074, 15.630],
  "Santa Marina":          [40.112, 15.535],
  "Vibonati":              [40.099, 15.607],
  "San Giovanni a Piro":   [40.080, 15.517],
  "Ispani":                [40.085, 15.573],
  "Torre Orsaia":          [40.148, 15.495],
  "Torraca":               [40.133, 15.549],

  // Entroterra Cilento
  "Vallo della Lucania":   [40.232, 15.268],
  "Rofrano":               [40.205, 15.434],
  "Morigerati":            [40.183, 15.583],
  "Laurito":               [40.164, 15.506],
  "San Mauro la Bruca":    [40.130, 15.458],

  // Vallo di Diano
  "Sala Consilina":        [40.405, 15.596],
  "Teggiano":              [40.389, 15.555],
  "Padula":                [40.332, 15.662],
  "Polla":                 [40.511, 15.494],
  "Atena Lucana":          [40.457, 15.555],
  "Sassano":               [40.333, 15.583],
  "Montesano sulla Marcellana": [40.267, 15.700],
  "Sanza":                 [40.233, 15.533],
  "Buonabitacolo":         [40.368, 15.618],
  "Sant'Arsenio":          [40.474, 15.491],
  "Pertosa":               [40.533, 15.450],
  "Monte San Giacomo":     [40.375, 15.639],
  "Casalbuono":            [40.285, 15.695],
  "San Pietro al Tanagro": [40.498, 15.480],
  "San Rufo":              [40.491, 15.465],

  // Area Paestum / Capaccio
  "Capaccio Paestum":      [40.419, 15.088],
};

function getCoord(comune: string): [number, number] | null {
  // Prova match esatto
  if (COORDINATE_COMUNI[comune]) return COORDINATE_COMUNI[comune];
  // Prova match parziale (es. "Centola-Palinuro" → Centola o Palinuro)
  for (const [key, val] of Object.entries(COORDINATE_COMUNI)) {
    if (comune.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(comune.toLowerCase())) {
      return val;
    }
  }
  return null;
}

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

interface Props {
  eventi: Evento[];
}

export function MappaClient({ eventi }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const [selezionato, setSelezionato] = useState<Evento | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Tutti");

  const oggi = new Date().toISOString().split("T")[0];
  const futuri = eventi.filter(e => (e.dataFine ?? e.data) >= oggi);
  const categorie = ["Tutti", ...Array.from(new Set(futuri.map(e => e.categoria)))];
  const filtrati = categoriaFiltro === "Tutti"
    ? futuri
    : futuri.filter(e => e.categoria === categoriaFiltro);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      // Distruggi mappa esistente se c'è
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: [40.25, 15.35],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      leafletRef.current = map;

      // Tile layer OpenStreetMap (gratuito)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Aggiungi marker per ogni evento
      filtrati.forEach((evento) => {
        const coord = getCoord(evento.comune);
        if (!coord) return;

        const colore = COLORI[evento.categoria] ?? "#16a34a";

        // Marker SVG personalizzato
        const icon = L.divIcon({
          html: `
            <div style="
              width:34px;height:34px;border-radius:50%;
              background:${colore};border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex;align-items:center;justify-content:center;
              cursor:pointer;transition:transform 0.15s;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker(coord, { icon }).addTo(map);
        marker.on("click", () => setSelezionato(evento));
      });
    });

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrati.length, categoriaFiltro]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 130px)" }}>

      {/* Filtri categoria */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {categorie.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border-0 cursor-pointer transition-all whitespace-nowrap"
            style={categoriaFiltro === cat
              ? { background: COLORI[cat] ?? "#16a34a", color: "white" }
              : { background: "#f5f3ef", color: "#78716c" }}
          >
            {cat} {cat !== "Tutti" ? `(${futuri.filter(e => e.categoria === cat).length})` : `(${futuri.length})`}
          </button>
        ))}
      </div>

      {/* Container mappa + sidebar */}
      <div className="flex flex-1 relative" style={{ minHeight: 500 }}>

        {/* Mappa */}
        <div ref={mapRef} className="flex-1" style={{ zIndex: 0 }} />

        {/* Pannello evento selezionato */}
        {selezionato && (
          <div
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 rounded-3xl p-5 flex flex-col gap-3"
            style={{
              background: "white",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => setSelezionato(null)}
              className="absolute top-3 right-4 text-xl text-stone-400 hover:text-stone-700 border-0 bg-transparent cursor-pointer leading-none"
            >
              ×
            </button>
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full self-start"
              style={{
                background: (COLORI[selezionato.categoria] ?? "#16a34a") + "22",
                color: COLORI[selezionato.categoria] ?? "#16a34a",
              }}
            >
              {selezionato.categoria}
            </span>
            <h3 className="text-[15px] font-black text-stone-900 leading-tight pr-6">
              {selezionato.titolo}
            </h3>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-stone-500 flex items-center gap-1.5">
                <IcoCalendar size={11} />
                <span className="capitalize">
                  {formattaData(selezionato.data)}
                  {selezionato.dataFine && ` – ${formattaData(selezionato.dataFine)}`}
                </span>
                {selezionato.orario && ` · ore ${selezionato.orario}`}
              </span>
              <span className="text-[12px] text-stone-500 flex items-center gap-1.5">
                <IcoMapPin size={11} />
                {selezionato.luogo}, {selezionato.comune}
              </span>
            </div>
            <p className="text-[12px] text-stone-500 leading-relaxed line-clamp-2">
              {selezionato.descrizioneBreve ?? selezionato.descrizione}
            </p>
            <Link
              href={`/events/${selezionato.id}`}
              className="w-full py-3 rounded-2xl text-center text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ background: COLORI[selezionato.categoria] ?? "#16a34a" }}
            >
              Scopri l&apos;evento →
            </Link>
          </div>
        )}
      </div>

      {/* Contatore eventi sulla mappa */}
      <div
        className="px-4 py-2.5 text-center text-xs font-semibold"
        style={{ background: "#f5f3ef", color: "#78716c", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {filtrati.filter(e => getCoord(e.comune)).length} eventi sulla mappa
        {categoriaFiltro !== "Tutti" && ` · ${categoriaFiltro}`}
        {" · "}
        <span style={{ color: "#9ca3af" }}>Clicca un pin per i dettagli</span>
      </div>
    </div>
  );
}
