/**
 * kv-store.ts
 * Storage server-side degli eventi trovati dall'AI (Vercel KV / Redis).
 * Usato dal cron job e dalla API /eventi-live.
 */

import { kv } from "@vercel/kv";
import type { EventoDinamico } from "./eventi-dinamici";

const CHIAVE = "eventi:pubblicati";

/** Legge tutti gli eventi salvati nel database */
export async function getEventiKV(): Promise<EventoDinamico[]> {
  try {
    const data = await kv.get<EventoDinamico[]>(CHIAVE);
    return data ?? [];
  } catch {
    // KV non configurato o errore di rete — torna lista vuota
    return [];
  }
}

/** Aggiunge nuovi eventi evitando duplicati (stesso titolo + stessa data) */
export async function aggiungiEventiKV(
  nuovi: Omit<EventoDinamico, "id" | "dataCreazione" | "approvato">[]
): Promise<number> {
  const esistenti = await getEventiKV();

  // Set di chiavi univoche per deduplicare
  const chiavi = new Set(esistenti.map((e) => `${e.titolo.toLowerCase()}|${e.data}`));

  const davveroNuovi: EventoDinamico[] = nuovi
    .filter((e) => !chiavi.has(`${e.titolo.toLowerCase()}|${e.data}`))
    .map((e) => ({
      ...e,
      id: `kv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      approvato: true, // pubblicati automaticamente
      dataCreazione: new Date().toISOString(),
    }));

  if (davveroNuovi.length === 0) return 0;

  // Mantieni solo gli eventi non scaduti (data >= oggi - 1 giorno)
  const ieri = new Date();
  ieri.setDate(ieri.getDate() - 1);
  const ieriISO = ieri.toISOString().split("T")[0];

  const aggiornati = [...esistenti, ...davveroNuovi].filter(
    (e) => (e.dataFine ?? e.data) >= ieriISO
  );

  await kv.set(CHIAVE, aggiornati);
  return davveroNuovi.length;
}

/** Elimina tutti gli eventi (reset) */
export async function svuotaEventiKV(): Promise<void> {
  await kv.del(CHIAVE);
}
