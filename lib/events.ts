export type Categoria =
  | "Sagra"
  | "Musica"
  | "Cultura"
  | "Sport"
  | "Religioso"
  | "Mercato"
  | "Natura";

export type Evento = {
  id: string;
  titolo: string;
  data: string;
  orario?: string;
  luogo: string;
  comune: string;
  categoria: Categoria;
  descrizioneBreve: string;
  descrizione: string;
  pubblico: "Tutti" | "Adulti" | "Bambini" | "Famiglie";
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

export const eventi: Evento[] = [
  {
    id: "sagra-fagiolo-controne",
    titolo: "Sagra del Fagiolo di Controne",
    data: "2025-08-15",
    orario: "18:00",
    luogo: "Piazza del Paese",
    comune: "Controne",
    categoria: "Sagra",
    descrizioneBreve:
      "La tradizionale sagra dedicata al fagiolo DOP di Controne, con piatti tipici e musica dal vivo.",
    descrizione:
      "La Sagra del Fagiolo di Controne è uno degli eventi più attesi dell'estate cilentana. Il fagiolo di Controne è un prodotto di eccellenza, coltivato in questa piccola comunità del Cilento interno. Durante la sagra potrai gustare zuppe, pasta e fagioli e altri piatti tradizionali preparati con questo legume pregiato. L'evento si svolge nella piazza principale del paese, animata da musica popolare dal vivo e bancarelle di prodotti locali. Un'occasione perfetta per scoprire le tradizioni gastronomiche del territorio.",
    pubblico: "Tutti",
  },
  {
    id: "concerto-estate-vallo",
    titolo: "Concerto d'Estate a Vallo della Lucania",
    data: "2025-07-20",
    orario: "21:30",
    luogo: "Piazza Vittorio Emanuele",
    comune: "Vallo della Lucania",
    categoria: "Musica",
    descrizioneBreve:
      "Una serata di musica jazz e blues nel cuore di Vallo della Lucania, con artisti locali e ospiti speciali.",
    descrizione:
      "La Piazza Vittorio Emanuele di Vallo della Lucania si trasforma in un grande palcoscenico per una serata di jazz e blues. Sul palco si alterneranno musicisti locali di alto livello e ospiti speciali provenienti da tutta la Campania. L'evento è organizzato dall'associazione culturale 'Musica nel Cilento' con il patrocinio del Comune. I posti in piazza sono liberi e gratuiti. Si consiglia di portare sedie o cuscini per maggiore comfort. In caso di pioggia l'evento potrebbe essere posticipato.",
    pubblico: "Tutti",
  },
  {
    id: "mostra-cilento-dallalto",
    titolo: "Mostra Fotografica: Cilento dall'Alto",
    data: "2025-06-21",
    orario: "10:00",
    luogo: "Museo Narrante del Santuario di Hera Argiva",
    comune: "Capaccio-Paestum",
    categoria: "Cultura",
    descrizioneBreve:
      "Immagini aeree del Cilento realizzate con drone: paesaggi, borghi e coste viste da una prospettiva inedita.",
    descrizione:
      "Una mostra fotografica straordinaria che esplora il Cilento visto dall'alto. Il fotografo Marco Esposito ha trascorso tre anni a sorvolare il territorio con il suo drone, catturando immagini spettacolari di borghi arroccati, coste frastagliate, foreste e spiagge dorate. La mostra sarà allestita negli spazi del Museo Narrante con oltre 50 stampe di grande formato. Apertura tutti i giorni dalle 10:00 alle 19:00. Ingresso gratuito per i residenti nel Parco Nazionale del Cilento. Prezzo intero: 5€.",
    pubblico: "Tutti",
  },
  {
    id: "regata-capo-palinuro",
    titolo: "Regata del Capo Palinuro",
    data: "2025-06-07",
    orario: "09:00",
    luogo: "Porto di Palinuro",
    comune: "Centola-Palinuro",
    categoria: "Sport",
    descrizioneBreve:
      "La regata velica più attesa del Cilento: imbarcazioni di ogni tipo si sfidano lungo le acque cristalline del Capo.",
    descrizione:
      "La Regata del Capo Palinuro è un appuntamento storico per gli appassionati di vela del Mediterraneo. Quest'anno partecipano oltre 40 imbarcazioni provenienti da tutto il Sud Italia. Il percorso costeggia le scogliere rosse del Capo e le grotte marine, offrendo uno spettacolo magnifico anche per chi assiste dalla riva. Le premiazioni si terranno nel pomeriggio sul lungomare di Palinuro con musica e aperitivi. Possibilità di seguire la regata dalle barche a noleggio disponibili in porto.",
    pubblico: "Adulti",
  },
  {
    id: "processione-madonna-novi-velia",
    titolo: "Pellegrinaggio al Sacro Monte di Novi Velia",
    data: "2025-09-08",
    orario: "07:00",
    luogo: "Santuario del Sacro Monte",
    comune: "Novi Velia",
    categoria: "Religioso",
    descrizioneBreve:
      "La tradizionale processione al Santuario di Novi Velia: migliaia di fedeli in cammino verso la cima del monte.",
    descrizione:
      "Il Santuario della Madonna del Sacro Monte di Novi Velia è uno dei luoghi di culto più importanti del Cilento. Ogni anno, il giorno della Natività di Maria (8 settembre), migliaia di fedeli provenienti da tutto il territorio si radunano per il pellegrinaggio verso la cima del monte. La processione parte all'alba dal centro del paese e risale il sentiero storico tra preghiere e canti tradizionali. In cima, alle ore 11:00 circa, si celebra la Santa Messa all'aperto. Un evento di profonda spiritualità e tradizione popolare, aperto a tutti.",
    pubblico: "Tutti",
  },
  {
    id: "mercatino-artigianato-teggiano",
    titolo: "Mercatino dell'Artigianato e dei Sapori",
    data: "2025-07-26",
    orario: "09:00",
    luogo: "Centro Storico",
    comune: "Teggiano",
    categoria: "Mercato",
    descrizioneBreve:
      "Tra i vicoli del borgo medievale di Teggiano, artigiani e produttori locali espongono le loro eccellenze.",
    descrizione:
      "Il centro storico di Teggiano, uno dei borghi più belli del Vallo di Diano, ospita il Mercatino dell'Artigianato e dei Sapori. Tra palazzi nobiliari e chiese antiche, i visitatori troveranno bancarelle di ceramiche, tessuti, prodotti alimentari tipici, formaggi, salumi e dolci tradizionali. L'evento si svolge su due giorni con apertura dalle 9:00 alle 23:00. Previsti spettacoli di rievocazione medievale e musici itineranti. Ingresso libero. Parcheggi disponibili alla periferia del paese con navette gratuite.",
    pubblico: "Famiglie",
  },
  {
    id: "trekking-monte-bulgheria",
    titolo: "Trekking sul Monte Bulgheria",
    data: "2025-05-25",
    orario: "07:30",
    luogo: "Partenza da Celle di Bulgheria",
    comune: "Celle di Bulgheria",
    categoria: "Natura",
    descrizioneBreve:
      "Escursione guidata sul Monte Bulgheria (1225 m): panorami mozzafiato sul Golfo di Policastro.",
    descrizione:
      "Il Monte Bulgheria è una delle vette più belle del Parco Nazionale del Cilento. Questa escursione guidata percorre il sentiero principale da Celle di Bulgheria fino alla cima, con un dislivello di circa 900 metri. In vetta, in giornate limpide, si può vedere fino alla Sicilia e alla Calabria, e il panorama sul Golfo di Policastro è semplicemente spettacolare. La guida è Roberto Sellitto, escursionista esperto con 20 anni di esperienza. Difficoltà: media. Equipaggiamento richiesto: scarpe da trekking, abbigliamento a strati, almeno 2 litri d'acqua. Iscrizione obbligatoria entro il 23 maggio.",
    pubblico: "Adulti",
  },
  {
    id: "sagra-alici-menaica-pisciotta",
    titolo: "Sagra delle Alici di Menaica",
    data: "2025-08-03",
    orario: "19:00",
    luogo: "Lungomare di Pisciotta",
    comune: "Pisciotta",
    categoria: "Sagra",
    descrizioneBreve:
      "Le celebri alici di menaica di Pisciotta, presidio Slow Food, protagoniste di una sagra unica tra sapori e tramonti.",
    descrizione:
      "Le alici di menaica di Pisciotta sono un presidio Slow Food: vengono pescate con la rete da menaica, una tecnica di pesca antica e selettiva che cattura solo le acciughe di grandi dimensioni. La sagra celebra questo prodotto eccezionale con degustazioni, workshop di cucina, spettacoli musicali e la magia del tramonto sul mare cilentano. I ristoranti del lungomare prepareranno menù speciali a base di alici in tutte le forme. Esperti di Slow Food spiegheranno ai visitatori la storia e il valore di questa tradizione di pesca millenaria.",
    pubblico: "Tutti",
  },
];
