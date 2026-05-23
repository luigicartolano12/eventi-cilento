# 🌊 Eventi Cilento

Guida eventi automatica per il **Cilento, Vallo di Diano e Golfo di Policastro** (SA, Campania).  
La app aggrega sagre, concerti, feste patronali ed esperienze turistiche usando AI (Claude Opus) + scraping di 50+ sorgenti locali.

🔗 **Live**: https://eventi-cilento.vercel.app

---

## Requisiti
- Node.js 18+
- Account [Anthropic](https://console.anthropic.com) per la chiave API
- Progetto [Vercel](https://vercel.com) con un database KV (Redis) collegato

---

## Setup in locale

### 1. Clona il repository
```bash
git clone https://github.com/luigicartolano12/eventi-cilento.git
cd eventi-cilento
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
```bash
cp .env.example .env.local
```
Poi apri `.env.local` e compila i valori (vedi sezione *Variabili d'ambiente* sotto).

### 4. Avvia il server di sviluppo
```bash
npm run dev
```
Apri [http://localhost:3000](http://localhost:3000).

---

## Variabili d'ambiente

| Variabile | Dove si trova | Obbligatoria |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys | ✅ |
| `KV_REST_API_URL` | Vercel Dashboard → Storage → KV → `.env.local` tab | ✅ |
| `KV_REST_API_TOKEN` | Vercel Dashboard → Storage → KV → `.env.local` tab | ✅ |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel Dashboard → Storage → KV | ⬜ opzionale |
| `CRON_SECRET` | Scegli una stringa casuale (32+ caratteri) | ✅ |
| `TRIGGER_KEY` | Scegli una stringa casuale (es. `cilento2026`) | ✅ |

> **Come ottenere le credenziali KV in locale**: vai su [vercel.com/dashboard](https://vercel.com/dashboard) → seleziona il tuo progetto → Storage → il tuo KV store → tab "`.env.local`" → copia e incolla in `.env.local`.

---

## Popolare il database eventi

Dopo aver avviato il server, lancia il seed iniziale:
```bash
# Seed statico (eventi 2026 predefiniti)
curl "http://localhost:3000/api/seed-eventi"

# Poi esegui la pipeline AI completa (richiede TRIGGER_KEY)
curl "http://localhost:3000/api/cron?chiave=TUO_TRIGGER_KEY"
```

---

## Script disponibili
```bash
npm run dev      # Sviluppo locale (http://localhost:3000)
npm run build    # Build produzione
npm run start    # Avvia build produzione
npm run lint     # Controllo ESLint
```

---

## Struttura progetto (essenziale)
```
app/
  page.tsx / HomeContent.tsx    # Homepage con lista eventi e filtri
  api/cron/route.ts             # Pipeline AI: scraping → web search → JSON → KV
  api/eventi-live/route.ts      # Serve gli eventi al frontend da KV
  api/cron-esperienze/route.ts  # Aggiorna le esperienze turistiche
  esperienze / events / locali  # Pagine dettaglio
  mappa / notte / scan          # Sezioni extra
  admin / proponi               # Moderazione e form utenti
lib/
  kv-store.ts                   # CRUD Vercel KV
  eventi-dinamici.ts            # Tipi EventoDinamico
  photos.ts / foto-fallback.ts  # Gestione immagini
  esperienze.ts / locali.ts     # Dati turismo
```

---

## Deploy su Vercel

Il progetto è già configurato per Vercel (file `vercel.json`).  
I cron job si attivano automaticamente: lunedì e giovedì alle 07:00 UTC.

Per fare un nuovo deploy:
```bash
git add .
git commit -m "descrizione modifiche"
git push
```
Vercel rileva il push e fa il deploy automaticamente.

---

## Problemi comuni

**KV non funziona in locale** → Assicurati di aver copiato le credenziali KV dalla tab `.env.local` del tuo progetto Vercel, non quelle di produzione.

**Nessun evento visualizzato** → Esegui prima `seed-eventi` per popolare il KV con i dati statici.

**Errore 401 sul cron** → Controlla che `TRIGGER_KEY` in `.env.local` corrisponda al parametro `?chiave=` nella URL.

---

## Licenza
Progetto privato — tutti i diritti riservati.
