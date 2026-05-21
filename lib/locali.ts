export type CategoriaLocale =
  | "Bar & Aperitivo"
  | "Ristorante"
  | "Discoteca"
  | "Agriturismo"
  | "Beach Club";

export type Locale = {
  id: string;
  nome: string;
  categoria: CategoriaLocale;
  comune: string;
  descrizione: string;
  serate: string[];
  orario?: string;
  instagram?: string;
  telefono?: string;
  inEvidenza?: boolean;
};

export const CATEGORIE_LOCALE: CategoriaLocale[] = [
  "Bar & Aperitivo",
  "Ristorante",
  "Discoteca",
  "Agriturismo",
  "Beach Club",
];

export const STILE_LOCALE: Record<
  CategoriaLocale,
  { bg: string; color: string; gradient: string }
> = {
  "Bar & Aperitivo": { bg: "#fef3c7", color: "#92400e", gradient: "linear-gradient(135deg, #f59e0b, #fb923c)" },
  "Ristorante":      { bg: "#fee2e2", color: "#991b1b", gradient: "linear-gradient(135deg, #ef4444, #f97316)" },
  "Discoteca":       { bg: "#ede9fe", color: "#5b21b6", gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
  "Agriturismo":     { bg: "#d1fae5", color: "#065f46", gradient: "linear-gradient(135deg, #059669, #84cc16)" },
  "Beach Club":      { bg: "#e0f2fe", color: "#0c4a6e", gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)" },
};

export const locali: Locale[] = [
  {
    id: "bar-centrale-agropoli",
    nome: "Bar Centrale",
    categoria: "Bar & Aperitivo",
    comune: "Agropoli",
    descrizione: "Il cuore dell'aperitivo agropolitano. Ogni venerdì jazz live sul terrazzo panoramico con vista sul Castello Aragonese.",
    serate: ["Jazz Live (Ven)", "Aperitivo Sunset", "Brunch Domenicale"],
    orario: "07:00 – 01:00",
    instagram: "@barcentrale_agropoli",
    inEvidenza: true,
  },
  {
    id: "lido-helios-palinuro",
    nome: "Lido Helios",
    categoria: "Beach Club",
    comune: "Centola-Palinuro",
    descrizione: "Il beach club più esclusivo di Palinuro. Piscina a sfioro, DJ set al tramonto e serate a tema sulla spiaggia dei Cameroti.",
    serate: ["DJ Set (Sab)", "Aperitivo al Tramonto", "Full Moon Party"],
    orario: "09:00 – 02:00",
    instagram: "@lido_helios_palinuro",
    inEvidenza: true,
  },
  {
    id: "akropolis-agropoli",
    nome: "Akropolis Club",
    categoria: "Discoteca",
    comune: "Agropoli",
    descrizione: "Il club di riferimento del Cilento. Electronic, house e indie music con i migliori DJ della scena campana ogni weekend.",
    serate: ["Electronic Night (Ven)", "House Party (Sab)", "Indie Sunday"],
    orario: "23:00 – 05:00",
    instagram: "@akropolisclub",
    inEvidenza: true,
  },
  {
    id: "agriturismo-casolare-capaccio",
    nome: "Il Casolare",
    categoria: "Agriturismo",
    comune: "Capaccio-Paestum",
    descrizione: "Tra i templi di Paestum e i campi di bufala. Cene a km0, musica folk tradizionale e degustazioni di prodotti DOP del Cilento.",
    serate: ["Cena Folk (Gio)", "Degustazione DOP (Dom)", "Sagra della Mozzarella (Lug–Ago)"],
    orario: "12:00 – 23:00",
    inEvidenza: true,
  },
  {
    id: "la-terrazza-castellabate",
    nome: "La Terrazza",
    categoria: "Ristorante",
    comune: "Castellabate",
    descrizione: "Vista mozzafiato sul Golfo di Salerno. Cucina di mare con prodotti locali e serata musicale il sabato sera.",
    serate: ["Live Acustico (Sab)", "Cena Romantica (Ven)"],
    orario: "12:30 – 23:30",
    instagram: "@laterrazza_castellabate",
    inEvidenza: true,
  },
  {
    id: "bar-del-porto-pisciotta",
    nome: "Bar del Porto",
    categoria: "Bar & Aperitivo",
    comune: "Pisciotta",
    descrizione: "Il porto antico di Pisciotta come sfondo. Aperitivo con acciughe del Cilento e vini locali, ogni sera in estate.",
    serate: ["Aperitivo con Pescato (Quotidiano)", "Musica Acustica (Mer & Ven)"],
    orario: "06:30 – 00:30",
  },
  {
    id: "baia-sirene-camerota",
    nome: "Baia delle Sirene",
    categoria: "Beach Club",
    comune: "Camerota",
    descrizione: "Affacciato sulla baia più bella della Costa Cilentana. Ombrelloni, cocktail e serate con DJ internazionali tutto agosto.",
    serate: ["Sunset Aperitivo (Quotidiano)", "DJ Night (Mar, Gio, Sab)"],
    orario: "08:30 – 02:00",
    instagram: "@baiadellesirenecamerota",
  },
  {
    id: "la-grotta-vallo",
    nome: "La Grotta",
    categoria: "Discoteca",
    comune: "Vallo della Lucania",
    descrizione: "Ricavato in una grotta naturale nel centro storico. Indie, rock e alternative: il luogo di culto della notte cilentana per chi ama suoni non convenzionali.",
    serate: ["Indie Night (Ven)", "Rock Classics (Sab)", "Open Mic (Mer)"],
    orario: "22:00 – 04:00",
    instagram: "@lagrottaclub",
  },
  {
    id: "da-carmela-castellabate",
    nome: "Da Carmela",
    categoria: "Ristorante",
    comune: "Castellabate",
    descrizione: "Trattoria di famiglia dal 1962. La vera cucina cilentana: fusilli al ragù di capra, alici di menaica, melanzane a funghetto.",
    serate: ["Serata Pizza (Mer)", "Cena Tradizionale con Tarantella (Sab Est)"],
    orario: "12:00 – 15:00 / 19:00 – 23:00",
  },
  {
    id: "tenuta-cilento-ascea",
    nome: "Tenuta Cilento",
    categoria: "Agriturismo",
    comune: "Ascea",
    descrizione: "Cinquanta ettari di uliveti e vigneti con vista sul Tirreno. Degustazioni di olio IGP e vini Cilento DOC, serate con musica occitana.",
    serate: ["Degustazione Olio & Vino (Dom)", "Concerto Occitano (Lug–Ago)"],
    orario: "10:00 – 22:00",
    instagram: "@tenuta_cilento",
  },
  {
    id: "bar-vista-mare-agropoli",
    nome: "Vista Mare",
    categoria: "Bar & Aperitivo",
    comune: "Agropoli",
    descrizione: "Sulla scogliera del lungomare. Happy hour dalle 17 con cocktail artigianali e stuzzichini locali, musica lounge in sottofondo.",
    serate: ["Happy Hour Lounge (Quotidiano)", "Live Acustico (Dom)"],
    orario: "08:00 – 01:00",
  },
  {
    id: "il-faro-palinuro",
    nome: "Il Faro",
    categoria: "Ristorante",
    comune: "Centola-Palinuro",
    descrizione: "Sotto il faro storico di Palinuro. Pesce fresco di giornata, crudo di mare e degustazioni di vini bianchi campani al tramonto.",
    serate: ["Cena al Tramonto (Ven & Sab)", "Brunch della Domenica"],
    orario: "12:30 – 23:00",
    instagram: "@ilfaro_palinuro",
  },
];

export function getLocaliInEvidenza(): Locale[] {
  return locali.filter((l) => l.inEvidenza);
}
