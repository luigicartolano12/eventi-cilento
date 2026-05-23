"use client";

import dynamic from "next/dynamic";
import type { Evento } from "@/lib/events";

const MappaClient = dynamic(
  () => import("./MappaClient").then(m => m.MappaClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex flex-col items-center justify-center gap-4"
        style={{ minHeight: 400, background: "#f5f3ef" }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-green-500 animate-spin" />
        <p className="text-sm font-semibold text-stone-400">Caricamento mappa…</p>
      </div>
    ),
  }
);

export function MappaWrapper({ eventi }: { eventi: Evento[] }) {
  return <MappaClient eventi={eventi} />;
}
