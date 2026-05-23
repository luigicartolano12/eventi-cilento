# 🔄 Migrazione progetto — Eventi Cilento

**Data migrazione:** 2026-05-23
**Da account Claude:** (account precedente)
**A account Claude:** `luigi.cartolano@gmail.com`

Questo file serve a riprendere il lavoro su Claude Code dal nuovo account senza perdere contesto.

---

## ✅ Cosa è già pronto

Il **codice è intatto** e committato su GitHub:
- Repo: https://github.com/luigicartolano12/eventi-cilento
- Branch principale: `main`
- Ultimo commit prima della migrazione: vedi `git log -1`

Il **deploy Vercel resta attivo** su https://eventi-cilento.vercel.app — non serve toccare nulla lato Vercel se l'account Vercel non cambia.

I **dati su Vercel KV (Redis)** sono intatti — restano legati al progetto Vercel, non all'account Claude.

---

## 🪪 Passi per attivare Claude Code sul nuovo account

Sul terminale, dentro la cartella del progetto:

```bash
cd "/Users/luigicartolano/app eventi cilento/eventi-cilento"

# 1. Logout dall'account vecchio
claude logout

# 2. Login con il nuovo account
claude login
# (si apre il browser: accedi con luigi.cartolano@gmail.com)

# 3. Verifica
claude --version

# 4. Riapri Claude Code nel progetto
claude
```

A questo punto il nuovo account avrà accesso al progetto. **La cronologia delle conversazioni precedenti NON è trasferibile** — ma tutto il contesto necessario è in `CLAUDE.md`, in questo file `MIGRATION.md` e nei commit Git.

---

## 📋 Stato del progetto al momento della migrazione

### Cosa funziona ✅
- Homepage con lista eventi + filtri categoria/comune/data
- Pagina dettaglio evento (`/events/[id]`)
- Pagina dettaglio esperienza (`/esperienze/[id]`)
- Pagina dettaglio locale (`/locali/[id]`)
- Mappa interattiva con Leaflet (`/mappa`)
- Calendario mensile eventi
- Chat AI contestuale (Anthropic SDK)
- Pannello admin con PIN (`/admin`)
- Scanner locandine OCR (`/scan`) — **non toccare, funziona**
- Cron scheduling: lunedì + giovedì alle 07:00 UTC
- Immagini fallback per categoria (`lib/foto-fallback.ts`)

### Cosa è rotto in produzione 🔴
1. **Homepage mostra 0 eventi** — `lib/events.ts` esporta array vuoto e KV non è mai stato seedato in produzione
2. **Mappa mostra 0 eventi** — stesso problema (importa array vuoto)
3. **og:image punta al dominio sbagliato** — `app/layout.tsx` ha `eventicilentoapp.vercel.app` invece di `eventi-cilento.vercel.app`
4. **`/notte` e `/locali` sono la stessa pagina** — Header linka `/notte`, Footer linka `/locali`. Da unificare con redirect.
5. **Cron vede solo 10% del contesto scraped** — già FIXATO nel commit `5887bde` (slice 16k → 80k chars). Verificare che il prossimo run produca più eventi.
6. **Esperienze scarne** — dataset statico minimo, cron-esperienze non schedulato
7. **Empty state poco utile** — quando lista eventi è vuota mostra solo testo grigio

### Task pendenti (audit completo) 📝

In ordine di priorità, **da eseguire dal nuovo account**:

1. **Fix 0 eventi homepage**
   - Rendere `app/page.tsx` `async`, fare `getEventiKV()` lato server
   - Fallback a `EVENTI_REALI_2026` (in `lib/seed-eventi-2026.ts`) se KV vuoto
   - Aggiornare `HomeContent` per ricevere `eventiKV` via props (rimuovere fetch lato client duplicato)

2. **Fix mappa (0 eventi)**
   - Stesso pattern: `app/mappa/page.tsx` async, fetch KV server-side, fallback seed

3. **Fix og:image dominio**
   - In `app/layout.tsx`: sostituire `eventicilentoapp.vercel.app` → `eventi-cilento.vercel.app`
   - `metadataBase: new URL("https://eventi-cilento.vercel.app")`

4. **Unificare /notte e /locali**
   - Decidere canonico: **`/locali`**
   - Convertire `app/notte/page.tsx` in redirect a `/locali`
   - Aggiornare `Header.tsx` da `/notte` → `/locali`

5. **Empty state EventiList**
   - Quando `eventiFiltrati.length === 0` mostrare illustrazione SVG + CTA verso sagre, esperienze, proponi evento

6. **Date preset chips**
   - In `EventiList.tsx`: chips "Oggi · Weekend · Prossimi 7 giorni · Questo mese" sopra gli input data

7. **Estrarre lib/season.ts**
   - Spostare `getStagione()` + dict `STAGIONI` da `HomeContent.tsx` a `lib/season.ts`

8. **CTA esperienze context-aware**
   - "Scopri di più" se gratis
   - "Prenota su [partner]" se a pagamento con `linkEsterno`
   - "Vedi su Google Maps" se solo location

9. **Footer**
   - Aggiungere link a `/mappa`
   - Aggiungere sezione "Fonti" (siti scraped)

10. **Trigger seed in produzione**
    - Una tantum: `curl "https://eventi-cilento.vercel.app/api/seed-eventi?chiave=TUO_TRIGGER_KEY&reset=1"`
    - Popola KV con i 67 eventi reali in `lib/seed-eventi-2026.ts`

---

## 🔐 Credenziali e segreti

**NON sono nel repo** (giustamente). Da ripristinare manualmente sul nuovo account:

### Locale (`.env.local`)
Copia da `.env.example` e compila:
- `ANTHROPIC_API_KEY` — può essere la stessa di prima (chiave Anthropic console, non legata all'account Claude Code)
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` — da Vercel Dashboard → Storage → KV → tab `.env.local`
- `CRON_SECRET` — stringa segreta a tua scelta (32+ char)
- `TRIGGER_KEY` — stringa segreta a tua scelta

### Vercel (produzione)
Già configurate nel progetto Vercel. Per verificarle:
```
vercel.com/dashboard → eventi-cilento → Settings → Environment Variables
```

---

## 🎯 Cosa chiedere a Claude sul nuovo account (primo prompt suggerito)

```
Ciao, sto continuando il lavoro su Eventi Cilento da un nuovo account.
Leggi MIGRATION.md e CLAUDE.md per il contesto, poi parti dal Task 1
della sezione "Task pendenti" (fix 0 eventi homepage).
Procedi con incrementi piccoli e committabili.
```

---

## 📚 File di riferimento nel repo

- `CLAUDE.md` — architettura completa, stack, struttura cartelle, tipo `EventoDinamico`
- `README.md` — setup locale, deploy Vercel, troubleshooting
- `.env.example` — template variabili d'ambiente
- `lib/seed-eventi-2026.ts` — 67 eventi reali verificati maggio-settembre 2026
- `app/api/cron-light/route.ts` — pipeline scraping + AI (40 sorgenti)
- `lib/foto-fallback.ts` — immagini Unsplash per categoria

---

## ⚠️ Cose da NON toccare

- `app/scan/page.tsx` — OCR locandine, funziona già
- L'assistente AI in chat (`app/api/chat/route.ts`) — stabile, non modificare finché non richiesto
- I cron schedulati su `vercel.json` — funzionano

---

## ✍️ Note libere

- TypeScript strict abilitato — no `any`
- Tutti gli scraper devono rispettare `robots.txt` e max 1 req/sec per sito
- Lavorare in incrementi piccoli e committabili, mai cambi tutto-o-niente
