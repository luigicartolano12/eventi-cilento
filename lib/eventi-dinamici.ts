import { type Categoria } from "./events";

export type EventoDinamico = {
  id: string;
  titolo: string;
  data: string;
  dataFine?: string;
  comune: string;
  categoria: Categoria;
  descrizione: string;
  orario?: string;
  luogo?: string;
  gratuito?: boolean;
  prezzo?: string;
  organizzatore?: string;
  telefono?: string;
  email?: string;
  sorgente?: string;        // URL sito web ufficiale / articolo fonte
  facebook?: string;        // URL pagina o evento Facebook
  instagram?: string;       // URL profilo o post Instagram
  immagine?: string;        // URL immagine ufficiale (Wikipedia, sito evento, ecc.)
  approvato: boolean;
  dataCreazione: string;
};

const KEY = "eventi-dinamici";

export function getEventiDinamici(): EventoDinamico[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EventoDinamico[]) : [];
  } catch {
    return [];
  }
}

export function salvaEventiDinamici(eventi: EventoDinamico[]): void {
  localStorage.setItem(KEY, JSON.stringify(eventi));
}

export function aggiungiEventiDinamici(nuovi: Omit<EventoDinamico, "id" | "dataCreazione" | "approvato">[]): EventoDinamico[] {
  const esistenti = getEventiDinamici();
  const aggiunti: EventoDinamico[] = nuovi.map((e) => ({
    ...e,
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approvato: false,
    dataCreazione: new Date().toISOString(),
  }));
  const tutti = [...esistenti, ...aggiunti];
  salvaEventiDinamici(tutti);
  return aggiunti;
}

export function approvaEvento(id: string): void {
  const eventi = getEventiDinamici();
  salvaEventiDinamici(eventi.map((e) => (e.id === id ? { ...e, approvato: true } : e)));
}

export function rifiutaEvento(id: string): void {
  salvaEventiDinamici(getEventiDinamici().filter((e) => e.id !== id));
}

export function getEventiApprovati(): EventoDinamico[] {
  return getEventiDinamici().filter((e) => e.approvato);
}

export function svuotaPendenti(): void {
  salvaEventiDinamici(getEventiDinamici().filter((e) => e.approvato));
}
