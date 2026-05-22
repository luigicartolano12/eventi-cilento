/**
 * kv-proposte.ts
 * Gestione delle proposte di eventi inviate dagli utenti tramite /proponi.
 * Storage: Vercel KV (Redis), chiave "eventi:proposte"
 */

import { kv } from "@vercel/kv";

export type Proposta = {
  id: string;
  titolo: string;
  data: string;
  dataFine?: string;
  orario?: string;
  luogo: string;
  comune: string;
  categoria: string;
  descrizione: string;
  gratuito: boolean;
  prezzo?: string;
  linkEsterno?: string;
  organizzatore: string;
  telefono?: string;
  email?: string;
  nota?: string;                   // nota del proponente
  stato: "in_attesa" | "approvata" | "rifiutata";
  dataInvio: string;               // ISO timestamp
  notaAdmin?: string;              // messaggio interno dell'admin
};

const CHIAVE = "eventi:proposte";

export async function getProposte(): Promise<Proposta[]> {
  try {
    return (await kv.get<Proposta[]>(CHIAVE)) ?? [];
  } catch {
    return [];
  }
}

export async function aggiungiProposta(
  dati: Omit<Proposta, "id" | "stato" | "dataInvio">
): Promise<Proposta> {
  const lista = await getProposte();
  const nuova: Proposta = {
    ...dati,
    id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stato: "in_attesa",
    dataInvio: new Date().toISOString(),
  };
  await kv.set(CHIAVE, [...lista, nuova]);
  return nuova;
}

export async function aggiornaProposta(
  id: string,
  patch: Partial<Proposta>
): Promise<void> {
  const lista = await getProposte();
  await kv.set(
    CHIAVE,
    lista.map((p) => (p.id === id ? { ...p, ...patch } : p))
  );
}

export async function eliminaProposta(id: string): Promise<void> {
  const lista = await getProposte();
  await kv.set(CHIAVE, lista.filter((p) => p.id !== id));
}
