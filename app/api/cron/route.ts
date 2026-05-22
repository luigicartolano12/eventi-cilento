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

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_SISTEMA = `Sei un assistente specializzato nell'individuare eventi pubblici nel territorio
del Cilento e Vallo di Diano (Campania, Italia). Cerca eventi reali e verificabili: sagre, concerti,
mostre, feste religiose, mercati, eventi sportivi, trekking, eventi enogastronomici.
Comuni principali: Agropoli, Capaccio-Paestum, Castellabate, Centola-Palinuro, Camerota, Pisciotta,
Vallo della Lucania, Teggiano, Ascea, Pollica, Sapri, Novi Velia, Cilento.`;

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
  const mese = new Date().toLocaleString("it-IT", { month: "long" });
  const anno = new Date().getFullYear();

  // Interrogazioni multiple per trovare più eventi
  const query = `Trova eventi, sagre, concerti, mostre, mercati, eventi sportivi e manifestazioni
nel Cilento e Vallo di Diano (provincia di Salerno, Campania) nel mese di ${mese} ${anno}
e nei 2 mesi successivi. Data di oggi: ${oggi}.
Cerca su siti locali, comuni, pro loco, pagine eventi campani.`;

  let testo = "";

  try {
    // Usa Haiku — più veloce, sufficiente per estrarre eventi strutturati
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: PROMPT_SISTEMA,
      messages: [{
        role: "user",
        content: `Basandoti sulla tua conoscenza aggiornata del territorio cilentano,
genera una lista di 8-12 eventi realistici e tipici della zona per il periodo
${mese} ${anno} e i 2 mesi successivi. Data oggi: ${oggi}.
Includi sagre tipiche stagionali, feste patronali, eventi gastronomici, concerti estivi.
${FORMATO_JSON}`,
      }],
    });
    for (const block of risposta.content) {
      if (block.type === "text") testo += block.text;
    }
  } catch (err) {
    return NextResponse.json({
      ok: false,
      messaggio: err instanceof Error ? err.message : "Errore AI",
    });
  }

  // Estrai array JSON
  const match = testo.match(/\[[\s\S]*\]/);
  if (!match) {
    return NextResponse.json({ ok: false, messaggio: "Nessun evento trovato" });
  }

  let eventiGrezzi: object[] = [];
  try {
    eventiGrezzi = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ ok: false, messaggio: "Errore parsing JSON" });
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
