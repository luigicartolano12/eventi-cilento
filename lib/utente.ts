export type UtenteProfile = {
  nome: string;
  cognome: string;
  email: string;
  comune: string;
  interessi: string[];
  notificheEmail: boolean;
  notifichePush: boolean;
  notificheCategorie: string[];
  punti: number;
  recensioniInviate: number;
  eventiProposti: number;
  dataRegistrazione: string;
};

export type Livello = {
  nome: string;
  emoji: string;
  colore: string;
  sfondo: string;
  minPunti: number;
};

export const LIVELLI: Livello[] = [
  { nome: "Verde Cilentano",     emoji: "🌿", colore: "#166534", sfondo: "#dcfce7", minPunti: 0    },
  { nome: "Esploratore",         emoji: "🗺️",  colore: "#1e40af", sfondo: "#dbeafe", minPunti: 200  },
  { nome: "Ambasciatore",        emoji: "⭐",  colore: "#92400e", sfondo: "#fef3c7", minPunti: 500  },
  { nome: "Custode del Cilento", emoji: "🏛️",  colore: "#6d28d9", sfondo: "#ede9fe", minPunti: 1000 },
];

export const PUNTI_AZIONI = {
  REGISTRAZIONE:    100,
  PROFILO_COMPLETO:  50,
  RECENSIONE:        50,
  EVENTO_PROPOSTO:  100,
  LOGIN_GIORNALIERO:  5,
} as const;

export function getLivello(punti: number): Livello {
  return [...LIVELLI].reverse().find((l) => punti >= l.minPunti) ?? LIVELLI[0];
}

export function getLivelloSuccessivo(punti: number): Livello | null {
  return LIVELLI.find((l) => l.minPunti > punti) ?? null;
}

export function getUtente(): UtenteProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("utente-profilo");
    return raw ? (JSON.parse(raw) as UtenteProfile) : null;
  } catch {
    return null;
  }
}

export function salvaUtente(profilo: UtenteProfile): void {
  localStorage.setItem("utente-profilo", JSON.stringify(profilo));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("utente-aggiornato"));
  }
}

export function eliminaUtente(): void {
  localStorage.removeItem("utente-profilo");
}

export function aggiungiPunti(quantita: number): UtenteProfile | null {
  const utente = getUtente();
  if (!utente) return null;
  const aggiornato = { ...utente, punti: utente.punti + quantita };
  salvaUtente(aggiornato);
  return aggiornato;
}
