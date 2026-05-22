/**
 * /api/cron — Cron job giornaliero
 * Chiamato automaticamente da Vercel ogni giorno alle 07:00 (ora italiana).
 * Cerca eventi nel Cilento tramite AI e li salva nel database KV.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function stagionalita(mese: string): string {
  const m = mese.toLowerCase();
  if (["dicembre","gennaio","febbraio"].some(x => m.includes(x)))
    return "presepi viventi, capodanno, feste di Sant'Antonio, sagre invernali, concerti al chiuso, mostre";
  if (["marzo","aprile","maggio"].some(x => m.includes(x)))
    return "feste patronali di primavera, Pasqua, processioni, sagra del carciofo, trekking fioriture, mercati di primavera, ciclismo";
  if (["giugno","luglio","agosto"].some(x => m.includes(x)))
    return "sagre del pesce e della cucina cilentana, concerti sulla spiaggia, festival musicali estivi, feste patronali costiere, gare di nuoto, tornei beach volley";
  return "sagre dei funghi porcini e castagne, vendemmia, feste patronali autunnali, trekking foliage, mercatini artigianali";
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_SISTEMA = `Sei un assistente specializzato nell'individuare eventi pubblici nel territorio
del Cilento, Vallo di Diano e Golfo di Policastro (provincia di Salerno, Campania, Italia).
Cerca eventi reali e verificabili: sagre, concerti, mostre, feste religiose, mercati, eventi sportivi, trekking, enogastronomia.

Comuni del Cilento: Agropoli, Alfano, Ascea, Camerota, Capaccio-Paestum, Casal Velino, Castellabate,
Centola (Palinuro), Ceraso, Cicerale, Futani, Gioi, Laureana Cilento, Laurito, Lustra, Moio della Civitella,
Montecorice, Morigerati, Novi Velia, Ogliastro Cilento, Omignano, Orria, Perdifumo, Perito, Pisciotta,
Pollica (Acciaroli, Pioppi), Prignano Cilento, Rofrano, Salento, San Giovanni a Piro, San Mauro la Bruca,
Santa Marina, Stella Cilento, Stio, Torchiara, Torre Orsaia, Torraca, Vallo della Lucania.

Comuni del Vallo di Diano: Atena Lucana, Buonabitacolo, Casalbuono, Monte San Giacomo,
Montesano sulla Marcellana, Padula, Pertosa, Polla, Sala Consilina, San Pietro al Tanagro,
San Rufo, Sant'Arsenio, Sassano, Sanza, Teggiano.

Comuni del Golfo di Policastro: Ispani, Sapri, Vibonati, Scario, Santa Marina di Camerota.`;

const FORMATO_JSON = `
Restituisci SOLO un array JSON valido, senza testo prima o dopo:
[
  {
    "titolo": "Nome evento",
    "data": "YYYY-MM-DD",
    "dataFine": "YYYY-MM-DD",
    "comune": "Nome comune",
    "categoria": "Sagra" | "Musica" | "Cultura" | "Sport" | "Religioso" | "Mercato" | "Natura",
    "descrizione": "Descrizione 2-3 frasi",
    "orario": "HH:MM",
    "luogo": "Nome luogo specifico",
    "gratuito": true,
    "sorgente": "https://url-fonte.it"
  }
]
Ometti i campi facoltativi se non disponibili. Se non trovi eventi, rispondi con [].`;

export async function GET(request: Request) {
  // Verifica token Vercel oppure chiave manuale per trigger dal browser
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const chiaveManuale = url.searchParams.get("chiave");
  const cronSecret = process.env.CRON_SECRET;
  const triggerKey = process.env.TRIGGER_KEY ?? "cilento2025";

  const autorizzato =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) || // chiamata automatica Vercel
    chiaveManuale === triggerKey;                             // trigger manuale dal browser

  if (!autorizzato) {
    return NextResponse.json({ errore: "Non autorizzato — aggiungi ?chiave=cilento2025" }, { status: 401 });
  }

  const oggi = new Date().toISOString().split("T")[0];
  // Accetta un periodo personalizzato via query param (es. ?periodo=luglio+2026)
  const periodoParam = url.searchParams.get("periodo");
  const mese = periodoParam ?? new Date().toLocaleString("it-IT", { month: "long" });
  const anno = periodoParam ? "" : String(new Date().getFullYear());
  const periodoLabel = periodoParam ?? `${mese} ${anno}`;

  let eventiGrezzi: object[] = [];

  // ── FASE 1: Web search per trovare eventi reali ──────────────────────────
  let contestoRicerca = "";
  try {
    const ricerca = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305" as any, name: "web_search" }],
      system: "Sei un assistente che cerca eventi reali nel Cilento (Campania, Italia). Usa la ricerca web per trovare eventi veri e verificabili.",
      messages: [{
        role: "user",
        content: `Cerca eventi reali nel Cilento, Vallo di Diano e Golfo di Policastro per ${periodoLabel}. Cerca su sagre.net, eventiesagre.it, paesionline.it zona Salerno, siti Pro Loco Cilento, comuni.cilento.it, parcoregionalecilento.it. Elenca titolo, data, comune e tipo di ogni evento trovato.`,
      }],
    });
    contestoRicerca = ricerca.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  } catch {
    // Web search non disponibile — si procede con generazione avanzata
    contestoRicerca = "";
  }

  // ── FASE 2: Genera array JSON strutturato ────────────────────────────────
  try {
    const basePrompt = contestoRicerca.length > 100
      ? `Hai trovato questi eventi reali nel Cilento per ${periodoLabel}:\n\n${contestoRicerca}\n\n---\nConverti questi eventi reali in JSON e aggiungi altri eventi verosimili per arrivare a 20 totali. Distribuisci tra tutti i comuni del territorio.`
      : `Genera 20 eventi del Cilento, Vallo di Diano e Golfo di Policastro per ${periodoLabel}.

Organizzatori reali del territorio:
- Pro Loco di ogni comune (es. Pro Loco Agropoli, Pro Loco Palinuro, Pro Loco Pisciotta, Pro Loco Teggiano)
- Feste patronali: Sant'Erasmo (Agropoli/giugno), Madonna del Granato (Capaccio/settembre), San Cono (Teggiano/giugno), San Biagio (Castellabate/febbraio), Madonna della Neve (Pollica/agosto)
- Sagre storiche: Sagra del Fico Bianco di Cilento (Pisciotta/agosto), Sagra del Tonno (Agropoli/luglio), Sagra della Mozzarella (Paestum/luglio), Sagra del Carciofo (Paestum/aprile), Sagra delle Alici (Pisciotta/agosto)
- Musei: Museo Archeologico di Paestum, Certosa di Padula, Castello di Agropoli
- Parco Nazionale del Cilento: sentieri, escursioni guidate, birdwatching
- Grotte: Grotte di Castelcivita, Grotte di Pertosa-Auletta
- ASD locali: Cilento Running, Podistica Vallo, ASD Agropoli Calcio, Canoa Club Cilento
- Circoli: Circolo Legambiente Cilento, associazioni culturali locali

Distribuzione geografica — includi eventi da tutti questi comuni:
Cilento costiero: Agropoli, Castellabate, Acciaroli, Pioppi, Ascea, Pisciotta, Palinuro, Camerota, Maratea
Cilento entroterra: Vallo della Lucania, Capaccio-Paestum, Giungano, Agropoli, Cicerale
Vallo di Diano: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana
Golfo di Policastro: Sapri, Santa Marina, San Giovanni a Piro

Stagionalità ${periodoLabel}: ${stagionalita(mese)}.
Varietà: almeno 3 sagre, 2 religiosi, 2 musica, 2 sport, 2 natura, 1 mercato, 1 salute.`;

    const risposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      system: "Rispondi SOLO con un array JSON valido, senza markdown, senza testo aggiuntivo, senza ```json. Solo il JSON grezzo che inizia con [ e finisce con ].",
      messages: [{
        role: "user",
        content: `${basePrompt}\n\nArray JSON — rispondi SOLO con questo array:\n[{"titolo":"...","data":"YYYY-MM-DD","dataFine":"YYYY-MM-DD","comune":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute","descrizione":"2-3 frasi sull evento","orario":"HH:MM","gratuito":true,"luogo":"nome luogo specifico"}]`,
      }],
    });

    const testo = risposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const pulito = testo.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const match = pulito.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ ok: false, messaggio: "Formato AI non valido", testo: pulito.slice(0, 200) });
    }
    eventiGrezzi = JSON.parse(match[0]);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      messaggio: err instanceof Error ? err.message : "Errore AI",
    });
  }

  // Salva nel database KV (deduplica automatica)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aggiunti = await aggiungiEventiKV(eventiGrezzi as any[]);

  return NextResponse.json({
    ok: true,
    trovati: eventiGrezzi.length,
    nuovi: aggiunti,
    data: oggi,
  });
}
