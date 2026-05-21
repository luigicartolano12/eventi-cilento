export type CategoriaEsperienza =
  | "Natura"
  | "Mare"
  | "Gastronomia"
  | "Cultura"
  | "Sport"
  | "Benessere"
  | "Artigianato";

export type Difficolta = "Facile" | "Media" | "Difficile";

export type Esperienza = {
  id: string;
  titolo: string;
  categoria: CategoriaEsperienza;
  luogo: string;
  comune: string;
  descrizione: string;
  difficolta?: Difficolta;
  durata?: string;
  prezzo: string;
  inEvidenza?: boolean;
  linkEsterno?: string;
  tags?: string[];
};

export const CATEGORIE_ESPERIENZA: CategoriaEsperienza[] = [
  "Natura", "Mare", "Gastronomia", "Cultura", "Sport", "Benessere", "Artigianato",
];

export const STILE_CATEGORIA: Record<
  CategoriaEsperienza,
  { bg: string; color: string; gradient: string }
> = {
  Natura:      { bg: "#dcfce7", color: "#166534", gradient: "linear-gradient(135deg, #22c55e, #10b981)" },
  Mare:        { bg: "#dbeafe", color: "#1e40af", gradient: "linear-gradient(135deg, #3b82f6, #22d3ee)" },
  Gastronomia: { bg: "#fef3c7", color: "#92400e", gradient: "linear-gradient(135deg, #fb923c, #fbbf24)" },
  Cultura:     { bg: "#ede9fe", color: "#6b21a8", gradient: "linear-gradient(135deg, #a855f7, #818cf8)" },
  Sport:       { bg: "#fee2e2", color: "#991b1b", gradient: "linear-gradient(135deg, #f87171, #fb923c)" },
  Benessere:   { bg: "#fce7f3", color: "#9d174d", gradient: "linear-gradient(135deg, #f472b6, #c084fc)" },
  Artigianato: { bg: "#f3f4f6", color: "#374151", gradient: "linear-gradient(135deg, #9ca3af, #6b7280)" },
};

export const esperienze: Esperienza[] = [
  {
    id: "kayak-grotte-palinuro",
    titolo: "Kayak nelle Grotte Marine di Palinuro",
    categoria: "Mare",
    luogo: "Porto di Palinuro",
    comune: "Centola-Palinuro",
    descrizione:
      "Esplora le spettacolari grotte marine del Capo Palinuro in kayak. Un'avventura tra archi naturali, acque cristalline e formazioni rocciose millenarie, guidata da esperti locali.",
    difficolta: "Facile",
    durata: "3 ore",
    prezzo: "Da €35/persona",
    inEvidenza: true,
    tags: ["kayak", "grotte", "mare", "avventura"],
  },
  {
    id: "grotta-castelcivita",
    titolo: "Grotta di Castelcivita",
    categoria: "Cultura",
    luogo: "Contrada Grotticelle",
    comune: "Controne",
    descrizione:
      "Visita guidata alla terza grotta d'Italia per sviluppo turistico. Stalattiti, stalagmiti e un percorso da 1 km attraverso ambienti sotterranei di rara bellezza, con reperti paleolitici.",
    difficolta: "Facile",
    durata: "2 ore",
    prezzo: "€12/persona",
    inEvidenza: true,
    tags: ["grotte", "storia", "geologia", "paleolitico"],
  },
  {
    id: "templi-paestum",
    titolo: "Templi Greci di Paestum",
    categoria: "Cultura",
    luogo: "Area Archeologica di Paestum",
    comune: "Capaccio-Paestum",
    descrizione:
      "Scopri i tre templi dorici tra i meglio conservati al mondo, testimonianza della grande Poseidonia greca (VI–V sec. a.C.). Patrimonio UNESCO con museo annesso di straordinario valore.",
    difficolta: "Facile",
    durata: "2–3 ore",
    prezzo: "€12/persona",
    inEvidenza: true,
    tags: ["UNESCO", "archeologia", "greci", "storia", "museo"],
  },
  {
    id: "cucina-cilentana",
    titolo: "Corso di Cucina Tradizionale Cilentana",
    categoria: "Gastronomia",
    luogo: "Agriturismo Masseria Gallo",
    comune: "Vallo della Lucania",
    descrizione:
      "Impara a preparare i piatti storici del Cilento: fusilli al ferretto, cicoria e fagioli, mozzarella di bufala fatta a mano. Pranzo incluso con i prodotti freschi del territorio.",
    difficolta: "Facile",
    durata: "3 ore",
    prezzo: "€45/persona",
    inEvidenza: true,
    tags: ["cucina", "tradizione", "dieta mediterranea", "mozzarella"],
  },
  {
    id: "monte-bulgheria-trek",
    titolo: "Escursione sul Monte Bulgheria",
    categoria: "Natura",
    luogo: "Sentiero CAI 901",
    comune: "Celle di Bulgheria",
    descrizione:
      "Trekking panoramico sulla vetta del Monte Bulgheria (1225 m). Paesaggi mozzafiato sul Golfo di Policastro, flora endemica del Parco Nazionale del Cilento e avvistamenti faunistici rari.",
    difficolta: "Media",
    durata: "4–5 ore",
    prezzo: "Gratuito",
    tags: ["trekking", "montagna", "parco nazionale", "fauna", "panorama"],
  },
  {
    id: "degustazione-dop-cilento",
    titolo: "Degustazione Olio, Vino e Formaggi DOP",
    categoria: "Gastronomia",
    luogo: "Frantoio Cooperativa Cilento",
    comune: "Novi Velia",
    descrizione:
      "Tour guidato tra frantoio e cantina con degustazione di olio EVO DOP Cilento, vino DOC, mozzarella di bufala e cacioricotta. Incontro diretto con i produttori locali.",
    difficolta: "Facile",
    durata: "2.5 ore",
    prezzo: "€28/persona",
    tags: ["olio", "vino", "formaggi", "DOP", "prodotti locali"],
  },
  {
    id: "diving-capo-palinuro",
    titolo: "Immersioni Subacquee a Capo Palinuro",
    categoria: "Sport",
    luogo: "Capo Palinuro",
    comune: "Centola-Palinuro",
    descrizione:
      "Immersioni guidate nei fondali tra i più ricchi del Tirreno: relitti storici, grotte subacquee, posidonia oceanica. Disponibile battesimo del mare per principianti e percorsi avanzati.",
    difficolta: "Media",
    durata: "Giornata intera",
    prezzo: "Da €65/persona",
    tags: ["diving", "subacquea", "grotte marine", "relitti"],
  },
  {
    id: "birdwatching-persano",
    titolo: "Birdwatching all'Oasi WWF di Persano",
    categoria: "Natura",
    luogo: "Oasi WWF di Persano",
    comune: "Serre",
    descrizione:
      "Osservazione naturalistica in una delle più importanti zone umide della Campania. Aironi cenerini, martin pescatori, cicogne e rapaci in un ambiente fluviale protetto dal WWF.",
    difficolta: "Facile",
    durata: "3 ore",
    prezzo: "€10/persona",
    tags: ["birdwatching", "natura", "uccelli", "WWF", "zone umide"],
  },
  {
    id: "terme-cilento",
    titolo: "Relax alle Terme del Parco",
    categoria: "Benessere",
    luogo: "Centro Termale",
    comune: "Teggiano",
    descrizione:
      "Giornata di relax in acque termali naturali nel cuore del Vallo di Diano. Piscine all'aperto, fanghi curativi e trattamenti benessere immersi nella natura del Parco Nazionale.",
    difficolta: "Facile",
    durata: "Mezza giornata",
    prezzo: "Da €35/persona",
    tags: ["terme", "relax", "benessere", "salute", "parco"],
  },
  {
    id: "mountain-bike-alburni",
    titolo: "Mountain Bike sui Monti Alburni",
    categoria: "Sport",
    luogo: "Monti Alburni",
    comune: "Controne",
    descrizione:
      "Percorsi MTB tra boschi di faggio e panorami mozzafiato sui Monti Alburni. Guide esperte, noleggio bici incluso e assistenza tecnica. Itinerari calibrati per tutti i livelli.",
    difficolta: "Media",
    durata: "4 ore",
    prezzo: "€25/persona (noleggio incluso)",
    tags: ["mountain bike", "sport", "monti alburni", "adrenalina", "faggio"],
  },
  {
    id: "ceramica-artigianale",
    titolo: "Laboratorio di Ceramica Artigianale",
    categoria: "Artigianato",
    luogo: "Bottega Ceramiche Cilento",
    comune: "Agropoli",
    descrizione:
      "Laboratorio hands-on con un maestro ceramista locale. Crea il tuo oggetto in terracotta seguendo le antiche tecniche del Cilento. Il pezzo viene cotto e spedito a domicilio.",
    difficolta: "Facile",
    durata: "2 ore",
    prezzo: "€40/persona (pezzo incluso)",
    tags: ["ceramica", "artigianato", "laboratorio", "creatività", "souvenir"],
  },
  {
    id: "barca-costa-cilentana",
    titolo: "Gita in Barca lungo la Costa Cilentana",
    categoria: "Mare",
    luogo: "Porto di Agropoli",
    comune: "Agropoli",
    descrizione:
      "Navigazione lungo la costa del Parco Nazionale: calette nascoste, acque cristalline e snorkeling. Pranzo a bordo con prodotti tipici. Tramonto sulla costa con vista sui templi di Paestum.",
    difficolta: "Facile",
    durata: "Giornata intera",
    prezzo: "€55/persona",
    tags: ["barca", "costa", "snorkeling", "tramonti", "relax"],
  },
];

export function getInEvidenza(): Esperienza[] {
  return esperienze.filter((e) => e.inEvidenza);
}
