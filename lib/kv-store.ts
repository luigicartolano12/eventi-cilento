/**
 * kv-store.ts
 * Storage server-side degli eventi e delle esperienze trovati dall'AI (Vercel KV / Redis).
 * Usato dai cron job e dalle API /eventi-live, /esperienze-live.
 */

import { kv } from "@vercel/kv";
import type { EventoDinamico } from "./eventi-dinamici";

// ─────────────────────────────────────────────────────────────────────────────
// Tipo esperienza dinamica (da KV, complementa le esperienze statiche)
// ─────────────────────────────────────────────────────────────────────────────
export type EsperienzaDinamica = {
  id: string;
  titolo: string;
  categoria: string;
  comune: string;
  luogo?: string;
  durata?: string;
  difficolta?: string;
  prezzo: string;
  descrizione: string;
  linkEsterno?: string;
  facebook?: string;
  instagram?: string;
  telefono?: string;
  email?: string;
  organizzatore?: string;
  tags?: string[];
  sorgente?: string;
  dataCreazione: string;
};

const CHIAVE_ESPERIENZE = "esperienze:trovate";

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

// ─────────────────────────────────────────────────────────────────────────────
// ESPERIENZE KV
// ─────────────────────────────────────────────────────────────────────────────

/** Legge tutte le esperienze dinamiche dal KV */
export async function getEsperienzeKV(): Promise<EsperienzaDinamica[]> {
  try {
    const data = await kv.get<EsperienzaDinamica[]>(CHIAVE_ESPERIENZE);
    return data ?? [];
  } catch {
    return [];
  }
}

/** Aggiunge esperienze evitando duplicati (stesso titolo + stesso comune) */
export async function aggiungiEsperienzeKV(
  nuove: Omit<EsperienzaDinamica, "id" | "dataCreazione">[]
): Promise<number> {
  const esistenti = await getEsperienzeKV();
  const chiavi = new Set(
    esistenti.map((e) => `${e.titolo.toLowerCase()}|${e.comune.toLowerCase()}`)
  );

  const davveroNuove: EsperienzaDinamica[] = nuove
    .filter((e) => !chiavi.has(`${e.titolo.toLowerCase()}|${e.comune.toLowerCase()}`))
    .map((e) => ({
      ...e,
      id: `esp-kv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dataCreazione: new Date().toISOString(),
    }));

  if (davveroNuove.length === 0) return 0;

  await kv.set(CHIAVE_ESPERIENZE, [...esistenti, ...davveroNuove]);
  return davveroNuove.length;
}

/** Sostituisce tutte le esperienze (reset atomico) */
export async function sostituisciEsperienzeKV(
  nuove: Omit<EsperienzaDinamica, "id" | "dataCreazione">[]
): Promise<number> {
  const mapped: EsperienzaDinamica[] = nuove.map((e) => ({
    ...e,
    id: `esp-kv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dataCreazione: new Date().toISOString(),
  }));
  await kv.set(CHIAVE_ESPERIENZE, mapped);
  return mapped.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTI KV — reset atomico
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sostituisce TUTTI gli eventi con una nuova lista (reset atomico).
 * Usato da "Reset + Ricarica": prima estrai, poi sostituisci — così
 * se l'AI fallisce il database precedente rimane intatto.
 */
export async function sostituisciEventiKV(
  nuovi: Omit<EventoDinamico, "id" | "dataCreazione" | "approvato">[]
): Promise<number> {
  const ieri = new Date();
  ieri.setDate(ieri.getDate() - 1);
  const ieriISO = ieri.toISOString().split("T")[0];

  const mapped: EventoDinamico[] = nuovi
    .filter((e) => (e.dataFine ?? e.data) >= ieriISO)
    .map((e) => ({
      ...e,
      id: `kv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      approvato: true,
      dataCreazione: new Date().toISOString(),
    }));

  await kv.set(CHIAVE, mapped);
  return mapped.length;
}
