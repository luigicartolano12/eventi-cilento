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
    id: "mercato-contadino-agropoli",
    titolo: "Mercato Contadino di Agropoli",
    data: "2026-05-21",
    orario: "08:00",
    luogo: "Piazza Vittorio Veneto",
    comune: "Agropoli",
    categoria: "Mercato",
    descrizioneBreve:
      "Prodotti freschi della campagna cilentana: frutta, verdura, formaggi e salumi direttamente dai produttori locali.",
    descrizione:
      "Ogni giovedì mattina nella piazza principale di Agropoli i produttori locali portano il meglio della stagione: verdure di campo, frutta raccolta la mattina stessa, formaggi di latte crudo, miele millefiori e salumi artigianali. Un'occasione per fare la spesa a km zero e incontrare i contadini del Cilento.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: true,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: true,
    },
    contatto: {
      nome: "Comune di Agropoli",
      telefono: "+39 0974 827111",
      email: "info@comune.agropoli.sa.it",
      sito: "https://www.comune.agropoli.sa.it",
    },
  },
  {
    id: "yoga-alba-paestum",
    titolo: "Yoga all'Alba a Paestum",
    data: "2026-05-21",
    orario: "06:30",
    luogo: "Area Archeologica di Paestum",
    comune: "Capaccio-Paestum",
    categoria: "Sport",
    descrizioneBreve:
      "Sessione di yoga al sorgere del sole tra i templi greci di Paestum: arte, storia e benessere in un'unica esperienza.",
    descrizione:
      "Un risveglio speciale tra le colonne doriche dei templi di Paestum, patrimonio UNESCO. La sessione di yoga all'alba è condotta da una istruttrice certificata e aperta a tutti i livelli. Portare tappetino, abbigliamento comodo e uno strato caldo. Numero limitato a 30 persone.",
    pubblico: "Adulti",
    servizi: {
      accessibileDisabili: false,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: true,
      petFriendly: false,
    },
    contatto: {
      nome: "Associazione Benessere Cilento",
      telefono: "+39 333 9876543",
      email: "yoga@beneresecilento.it",
    },
  },
  {
    id: "sagra-fagiolo-controne",
    titolo: "Sagra del Fagiolo di Controne",
    data: "2026-08-15",
    orario: "18:00",
    luogo: "Piazza del Paese",
    comune: "Controne",
    categoria: "Sagra",
    descrizioneBreve:
      "La tradizionale sagra dedicata al fagiolo DOP di Controne, con piatti tipici e musica dal vivo.",
    descrizione:
      "La Sagra del Fagiolo di Controne è uno degli eventi più attesi dell'estate cilentana. Il fagiolo di Controne è un prodotto di eccellenza, coltivato in questa piccola comunità del Cilento interno. Durante la sagra potrai gustare zuppe, pasta e fagioli e altri piatti tradizionali preparati con questo legume pregiato. L'evento si svolge nella piazza principale del paese, animata da musica popolare dal vivo e bancarelle di prodotti locali. Un'occasione perfetta per scoprire le tradizioni gastronomiche del territorio.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: true,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: true,
    },
    contatto: {
      nome: "Pro Loco di Controne",
      telefono: "+39 0828 771234",
      email: "proloco.controne@cilento.it",
      sito: "https://www.prolococontrone.it",
    },
  },
  {
    id: "concerto-estate-vallo",
    titolo: "Concerto d'Estate a Vallo della Lucania",
    data: "2026-07-20",
    orario: "21:30",
    luogo: "Piazza Vittorio Emanuele",
    comune: "Vallo della Lucania",
    categoria: "Musica",
    descrizioneBreve:
      "Una serata di musica jazz e blues nel cuore di Vallo della Lucania, con artisti locali e ospiti speciali.",
    descrizione:
      "La Piazza Vittorio Emanuele di Vallo della Lucania si trasforma in un grande palcoscenico per una serata di jazz e blues. Sul palco si alterneranno musicisti locali di alto livello e ospiti speciali provenienti da tutta la Campania. L'evento è organizzato dall'associazione culturale 'Musica nel Cilento' con il patrocinio del Comune. I posti in piazza sono liberi e gratuiti. Si consiglia di portare sedie o cuscini per maggiore comfort.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: true,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: true,
    },
    contatto: {
      nome: "Associazione Musica nel Cilento",
      telefono: "+39 0974 712345",
      email: "info@musicanelcilento.it",
    },
  },
  {
    id: "mostra-cilento-dallalto",
    titolo: "Mostra Fotografica: Cilento dall'Alto",
    data: "2026-06-21",
    dataFine: "2026-07-20",
    orario: "10:00",
    luogo: "Museo Narrante del Santuario di Hera Argiva",
    comune: "Capaccio-Paestum",
    categoria: "Cultura",
    descrizioneBreve:
      "Immagini aeree del Cilento realizzate con drone: paesaggi, borghi e coste viste da una prospettiva inedita.",
    descrizione:
      "Una mostra fotografica straordinaria che esplora il Cilento visto dall'alto. Il fotografo Marco Esposito ha trascorso tre anni a sorvolare il territorio con il suo drone, catturando immagini spettacolari di borghi arroccati, coste frastagliate, foreste e spiagge dorate. La mostra sarà allestita negli spazi del Museo Narrante con oltre 50 stampe di grande formato. Apertura tutti i giorni dalle 10:00 alle 19:00. Ingresso gratuito per i residenti nel Parco Nazionale del Cilento.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: true,
      parcheggio: true,
      ingressoGratuito: false,
      costoDescrizione: "€5 (gratuito per residenti)",
      prenotazioneRichiesta: false,
      petFriendly: false,
    },
    contatto: {
      nome: "Museo Narrante — Capaccio Paestum",
      telefono: "+39 0828 723456",
      email: "museo@capacciopaestum.it",
      sito: "https://www.museonarrante.it",
    },
    biglietteria: {
      prezzo: "€5",
      note: "Gratuito per i residenti nel Parco Nazionale del Cilento",
    },
  },
  {
    id: "regata-capo-palinuro",
    titolo: "Regata del Capo Palinuro",
    data: "2026-06-07",
    orario: "09:00",
    luogo: "Porto di Palinuro",
    comune: "Centola-Palinuro",
    categoria: "Sport",
    descrizioneBreve:
      "La regata velica più attesa del Cilento: imbarcazioni di ogni tipo si sfidano lungo le acque cristalline del Capo.",
    descrizione:
      "La Regata del Capo Palinuro è un appuntamento storico per gli appassionati di vela del Mediterraneo. Quest'anno partecipano oltre 40 imbarcazioni provenienti da tutto il Sud Italia. Il percorso costeggia le scogliere rosse del Capo e le grotte marine, offrendo uno spettacolo magnifico anche per chi assiste dalla riva. Le premiazioni si terranno nel pomeriggio sul lungomare di Palinuro con musica e aperitivi.",
    pubblico: "Adulti",
    servizi: {
      accessibileDisabili: false,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: false,
    },
    contatto: {
      nome: "Circolo Nautico Palinuro",
      telefono: "+39 0974 938100",
      email: "info@circolonauticopalinuro.it",
      sito: "https://www.circolonauticopalinuro.it",
    },
  },
  {
    id: "processione-madonna-novi-velia",
    titolo: "Pellegrinaggio al Sacro Monte di Novi Velia",
    data: "2026-09-08",
    orario: "07:00",
    luogo: "Santuario del Sacro Monte",
    comune: "Novi Velia",
    categoria: "Religioso",
    descrizioneBreve:
      "La tradizionale processione al Santuario di Novi Velia: migliaia di fedeli in cammino verso la cima del monte.",
    descrizione:
      "Il Santuario della Madonna del Sacro Monte di Novi Velia è uno dei luoghi di culto più importanti del Cilento. Ogni anno, il giorno della Natività di Maria (8 settembre), migliaia di fedeli provenienti da tutto il territorio si radunano per il pellegrinaggio verso la cima del monte. La processione parte all'alba dal centro del paese e risale il sentiero storico tra preghiere e canti tradizionali. In cima si celebra la Santa Messa all'aperto.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: false,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: false,
    },
    contatto: {
      nome: "Parrocchia di Novi Velia",
      telefono: "+39 0974 985001",
      email: "parrocchia.novivelia@diocesivallo.it",
    },
  },
  {
    id: "mercatino-artigianato-teggiano",
    titolo: "Mercatino dell'Artigianato e dei Sapori",
    data: "2026-07-25",
    dataFine: "2026-07-26",
    orario: "09:00",
    luogo: "Centro Storico",
    comune: "Teggiano",
    categoria: "Mercato",
    descrizioneBreve:
      "Tra i vicoli del borgo medievale di Teggiano, artigiani e produttori locali espongono le loro eccellenze.",
    descrizione:
      "Il centro storico di Teggiano, uno dei borghi più belli del Vallo di Diano, ospita il Mercatino dell'Artigianato e dei Sapori. Tra palazzi nobiliari e chiese antiche, i visitatori troveranno bancarelle di ceramiche, tessuti, prodotti alimentari tipici, formaggi, salumi e dolci tradizionali. L'evento si svolge su due giorni con apertura dalle 9:00 alle 23:00. Previsti spettacoli di rievocazione medievale e musici itineranti. Ingresso libero.",
    pubblico: "Famiglie",
    servizi: {
      accessibileDisabili: false,
      parcheggio: true,
      ingressoGratuito: true,
      prenotazioneRichiesta: false,
      petFriendly: true,
    },
    contatto: {
      nome: "Comune di Teggiano — Ufficio Cultura",
      telefono: "+39 0975 577011",
      email: "cultura@comune.teggiano.sa.it",
      sito: "https://www.comune.teggiano.sa.it",
    },
  },
  {
    id: "trekking-monte-bulgheria",
    titolo: "Trekking sul Monte Bulgheria",
    data: "2026-06-14",
    orario: "07:30",
    luogo: "Partenza da Celle di Bulgheria",
    comune: "Celle di Bulgheria",
    categoria: "Natura",
    descrizioneBreve:
      "Escursione guidata sul Monte Bulgheria (1225 m): panorami mozzafiato sul Golfo di Policastro.",
    descrizione:
      "Il Monte Bulgheria è una delle vette più belle del Parco Nazionale del Cilento. Questa escursione guidata percorre il sentiero principale da Celle di Bulgheria fino alla cima, con un dislivello di circa 900 metri. In vetta, in giornate limpide, si può vedere fino alla Sicilia e alla Calabria. Difficoltà: media. Equipaggiamento richiesto: scarpe da trekking, abbigliamento a strati, almeno 2 litri d'acqua. Iscrizione obbligatoria entro il 12 giugno.",
    pubblico: "Adulti",
    servizi: {
      accessibileDisabili: false,
      parcheggio: true,
      ingressoGratuito: false,
      costoDescrizione: "€15 a persona",
      prenotazioneRichiesta: true,
      petFriendly: false,
    },
    contatto: {
      nome: "Roberto Sellitto — Guida Escursionistica",
      telefono: "+39 333 1234567",
      email: "roberto.sellitto@guidecilento.it",
      sito: "https://www.guidecilento.it",
    },
    biglietteria: {
      prezzo: "€15 a persona",
      note: "Iscrizione obbligatoria. Minimo 6 partecipanti per confermare l'uscita.",
    },
  },
  {
    id: "sagra-alici-menaica-pisciotta",
    titolo: "Sagra delle Alici di Menaica",
    data: "2026-08-03",
    orario: "19:00",
    luogo: "Lungomare di Pisciotta",
    comune: "Pisciotta",
    categoria: "Sagra",
    descrizioneBreve:
      "Le celebri alici di menaica di Pisciotta, presidio Slow Food, protagoniste di una sagra unica tra sapori e tramonti.",
    descrizione:
      "Le alici di menaica di Pisciotta sono un presidio Slow Food: vengono pescate con la rete da menaica, una tecnica di pesca antica e selettiva che cattura solo le acciughe di grandi dimensioni. La sagra celebra questo prodotto eccezionale con degustazioni, workshop di cucina, spettacoli musicali e la magia del tramonto sul mare cilentano. I ristoranti del lungomare prepareranno menù speciali a base di alici in tutte le forme.",
    pubblico: "Tutti",
    servizi: {
      accessibileDisabili: true,
      parcheggio: true,
      ingressoGratuito: true,
      costoDescrizione: "Degustazioni da €3",
      prenotazioneRichiesta: false,
      petFriendly: true,
    },
    contatto: {
      nome: "Pro Loco di Pisciotta",
      telefono: "+39 0974 973456",
      email: "info@prolocopisciotta.it",
      sito: "https://www.prolocopisciotta.it",
    },
  },
];
