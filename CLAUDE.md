# CLAUDE.md — Contesto progetto: Eventi Cilento

## Cos'è questo progetto
Web app Next.js 15 (App Router) che aggrega automaticamente eventi, sagre e esperienze turistiche del Cilento, Vallo di Diano e Golfo di Policastro (provincia di Salerno, Campania). L'obiettivo è essere la guida eventi di riferimento per residenti e turisti in questa area.

Deployment: https://eventi-cilento.vercel.app  
Repository: https://github.com/luigicartolano12/eventi-cilento

---

## Stack tecnico
- **Framework**: Next.js 16 con App Router, TypeScript, Tailwind CSS 4
- **AI**: Anthropic SDK (`claude-opus-4-5`) — chat AI + web_search + estrazione eventi
- **Storage**: Vercel KV (Redis) — eventi dinamici, esperienze, proposte utenti
- **Deploy**: Vercel (regione fra1) con cron job 2×/settimana

---

## Variabili d'ambiente richieste (`.env.local`)
```
ANTHROPIC_API_KEY=sk-ant-...         # Chat AI e ricerca eventi
KV_REST_API_URL=https://...          # Vercel KV (auto-iniettato su Vercel)
KV_REST_API_TOKEN=...                # Vercel KV
KV_REST_API_READ_ONLY_TOKEN=...      # Vercel KV (opzionale in locale)
CRON_SECRET=...                      # Protegge /api/cron* (Bearer token)
TRIGGER_KEY=...                      # Trigger manuale cron (?chiave=...)
```
Copia `.env.example` in `.env.local` e compila tutti i valori.

---

## Struttura cartelle chiave
```
app/
  page.tsx                   # Homepage (wrapper server)
  HomeContent.tsx            # UI principale — eventi + filtri + hero
  components/
    EventCard.tsx            # Card singolo evento
    EventiList.tsx           # Lista con filtri per categoria/comune/data
    CalendarioEventi.tsx     # Vista calendario mensile
    ChatWidget.tsx           # Chat AI contestuale
    Header.tsx / Footer.tsx / BottomNav.tsx
  api/
    cron/route.ts            # Pipeline principale AI (3 fasi, 50+ sorgenti)
    cron-light/route.ts      # Cron leggero (2×/sett via vercel.json)
    cron-esperienze/route.ts # Aggiornamento esperienze turistiche
    eventi-live/route.ts     # Legge eventi da KV per il frontend
    esperienze-live/route.ts # Legge esperienze da KV
    ai-eventi/route.ts       # Ricerca AI on-demand (chiamata dalla chat)
    chat/route.ts            # Chat AI con contesto eventi
    proposte/route.ts        # Gestione proposte utenti
    import-da-url/route.ts   # Import eventi da URL esterno
    leggi-locandina/route.ts # OCR locandine (image → evento)
  esperienze/[id]/page.tsx   # Dettaglio esperienza turistica
  events/[id]/page.tsx       # Dettaglio evento
  locali/[id]/page.tsx       # Dettaglio locale
  mappa/page.tsx             # Mappa interattiva (Leaflet)
  notte/page.tsx             # Sezione vita notturna
  scan/page.tsx              # Scanner locandine
  admin/page.tsx             # Pannello moderazione eventi
  proponi/page.tsx           # Form proposta evento da utente

lib/
  kv-store.ts                # CRUD eventi su Vercel KV
  kv-proposte.ts             # CRUD proposte utenti su Vercel KV
  eventi-dinamici.ts         # Tipi EventoDinamico + helpers localStorage (legacy)
  events.ts                  # Tipi e dati statici eventi (seed)
  esperienze.ts              # Tipi e dati esperienze turistiche
  locali.ts                  # Tipi e dati locali
  photos.ts                  # Logica ricerca immagini (Unsplash / fallback)
  foto-fallback.ts           # URL fallback per categoria senza immagine
  seed-eventi-2026.ts        # Dataset statico eventi 2026 (seed iniziale)
```

---

## Come funziona la pipeline eventi (architettura)

### Fase 0 — Scraping parallelo (~50 sorgenti)
`/api/cron/route.ts` scarica in parallelo 50+ siti web (aggregatori, notizie locali, siti comuni, musei) con timeout 7s ciascuno. I testi estratti (max 4500 char/sito) vengono concatenati.

### Fase 1 — Web search AI (20 query)
`claude-opus-4-5` con tool `web_search_20250305` esegue 20 ricerche Google specifiche per area (Vallo di Diano, Cilento costiero, Golfo di Policastro) e tipo di evento.

### Fase 2 — Estrazione JSON
Claude Opus riceve tutto il contesto (scraping + web search) e restituisce un array JSON di `EventoDinamico[]` con deduplicazione.

### Fase 3 — Salvataggio KV
`aggiungiEventiKV()` in `lib/kv-store.ts` salva in Redis con deduplicazione per titolo+data+comune.

### Cron schedule
`vercel.json` schedula `cron-light` ogni lunedì e giovedì alle 07:00 UTC.

---

## Tipo principale: EventoDinamico
```typescript
{
  id: string;           // "ai-{timestamp}-{random}"
  titolo: string;
  data: string;         // "YYYY-MM-DD"
  dataFine?: string;
  comune: string;
  categoria: Categoria; // Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute
  descrizione: string;
  orario?: string;
  luogo?: string;
  gratuito?: boolean;
  prezzo?: string;
  organizzatore?: string;
  telefono?: string;
  email?: string;
  sorgente?: string;    // URL fonte originale
  facebook?: string;    // URL Facebook evento/pagina
  instagram?: string;   // URL Instagram
  immagine?: string;    // URL immagine ufficiale
  approvato: boolean;
  dataCreazione: string;
}
```

---

## Problemi noti e TODO prioritari

### 🔴 Critici
1. **Immagini non pertinenti** — `lib/photos.ts` usa Unsplash con query generiche. Soluzione: usare `immagine` dall'evento se disponibile, poi Wikipedia API con nome evento+comune, poi Unsplash con query specifica (es. "sagra Teggiano Campania")
2. **Pochi eventi trovati** — molti siti comunali restituiscono 403/timeout. Soluzione: aggiungere RSS feed, usare Google Events API, ampliare le query web_search
3. **Esperienze scarse** — `cron-esperienze` non è schedulato e il seed dati è minimo. Soluzione: schedulare + ampliare dataset manuale + web scraping TripAdvisor/Booking
4. **Siti non raggiungibili** — molti comuni.it bloccano i bot. Soluzione: usare SerpAPI o ScraperAPI come proxy

### 🟡 UX/UI da migliorare
5. **Filtri non persistenti** — resettano al refresh. Usare URL params (`?categoria=Sagra&comune=Agropoli`)
6. **Nessun skeleton loading** — la lista eventi appare vuota durante il caricamento
7. **Mobile bottom nav** — bottoni troppo piccoli su schermi < 375px
8. **Mappa** — i pin non mostrano anteprima evento al click
9. **Ricerca testuale** — manca un campo di ricerca libera

### 🟢 Miglioramenti futuri
10. **PWA** — service worker per uso offline
11. **Notifiche push** — alert per eventi nei prossimi 3 giorni
12. **Schema.org** — markup Event per SEO
13. **Multilingua** — EN per turisti stranieri

---

## Comandi utili in sviluppo
```bash
npm run dev          # Avvia in locale su http://localhost:3000
npm run build        # Build produzione
npm run lint         # ESLint

# Trigger manuale cron (sostituisci con il valore di TRIGGER_KEY)
curl "http://localhost:3000/api/cron?chiave=TUO_TRIGGER_KEY"
curl "http://localhost:3000/api/cron-esperienze?chiave=TUO_TRIGGER_KEY"

# Seeding iniziale
curl "http://localhost:3000/api/seed-eventi"
```

---

## Aree geografiche coperte
- **Cilento costiero**: Agropoli, Castellabate, Acciaroli (Pollica), Pisciotta, Ascea, Camerota, Palinuro (Centola), Capaccio-Paestum, Casal Velino, Montecorice
- **Vallo di Diano**: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano sulla Marcellana, Buonabitacolo, Sanza, Sant'Arsenio, San Pietro al Tanagro, San Rufo, Pertosa
- **Golfo di Policastro**: Sapri, Santa Marina, Vibonati, San Giovanni a Piro, Torre Orsaia
- **Entroterra Cilento**: Vallo della Lucania, Rofrano, Morigerati
