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

  try {
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: "Rispondi SOLO con un array JSON valido, senza markdown, senza testo aggiuntivo, senza ```json. Solo il JSON grezzo che inizia con [ e finisce con ].",
      messages: [{
        role: "user",
        content: `Genera 12 eventi realistici del Cilento, Vallo di Diano e Golfo di Policastro per il periodo: ${periodoLabel}.
Distribuisci gli eventi tra comuni diversi del territorio (non ripetere sempre gli stessi).
Includi eventi tipici della stagione: estate=sagre del mare e concerti, autunno=sagre dei funghi e castagne, inverno=presepi e capodanno, primavera=fiori e trekking.
Varia le categorie: sagre gastronomiche, feste patronali, concerti, mercati artigianali, trekking, mostre, sport, eventi religiosi.

Array JSON — rispondi SOLO con questo array, nessun testo prima o dopo:
[{"titolo":"...","data":"YYYY-MM-DD","dataFine":"YYYY-MM-DD","comune":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura","descrizione":"frase di 2-3 righe sull evento","orario":"HH:MM","gratuito":true}]`,
      }],
    });

    const testo = risposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Pulizia: rimuovi eventuale markdown ```json ... ```
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
