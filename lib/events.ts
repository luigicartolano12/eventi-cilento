export type Categoria =
  | "Sagra"
  | "Musica"
  | "Cultura"
  | "Sport"
  | "Religioso"
  | "Mercato"
  | "Natura";

export type Servizi = {
  accessibileDisabili: boolean;
  parcheggio: boolean;
  ingressoGratuito: boolean;
  costoDescrizione?: string;
  prenotazioneRichiesta: boolean;
  petFriendly: boolean;
};

export type Contatto = {
  nome?: string;
  telefono?: string;
  email?: string;
  sito?: string;
};

export type Biglietteria = {
  url?: string;
  prezzo?: string;
  note?: string;
};

export type IntolleranzaTag =
  | "vegetariano"
  | "vegano"
  | "senzaGlutine"
  | "senzaLattosio";

export type MenuVoce = {
  nome: string;
  descrizione?: string;
  prezzo?: string;
  intolleranze?: IntolleranzaTag[];
};

export type MenuSezione = {
  titolo: string;
  voci: MenuVoce[];
};

export type Menu = {
  sezioni: MenuSezione[];
  noteIntolleranze?: string;
};

export type Evento = {
  id: string;
  titolo: string;
  data: string;
  dataFine?: string;
  orario?: string;
  luogo: string;
  comune: string;
  categoria: Categoria;
  descrizioneBreve: string;
  descrizione: string;
  pubblico: "Tutti" | "Adulti" | "Bambini" | "Famiglie";
  immagine?: string;
  video?: string;
  servizi: Servizi;
  contatto?: Contatto;
  biglietteria?: Biglietteria;
  menu?: Menu;
};

export const CATEGORIE: Categoria[] = [
  "Sagra",
  "Musica",
  "Cultura",
  "Sport",
  "Religioso",
  "Mercato",
  "Natura",
];

export function formattaData(dataStr: string): string {
  const [anno, mese, giorno] = dataStr.split("-").map(Number);
  const mesi = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  return `${giorno} ${mesi[mese - 1]} ${anno}`;
}

export const eventi: Evento[] = [];
