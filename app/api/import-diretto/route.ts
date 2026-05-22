/**
 * /api/import-diretto — Estrae eventi da un testo incollato dall'admin
 * e li pubblica DIRETTAMENTE nel database KV (senza coda di approvazione).
 *
 * Usa Claude Haiku (costo ~$0.001 per chiamata) per estrarre il JSON.
 * Richiede la chiave admin per essere chiamata.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const OGGI = () => new Date().toISOString().split("T")[0];

const PROMPT_SISTEMA = `Sei un assistente che estrae eventi pubblici da testi italiani (post Facebook, newsletter Pro Loco, programmi estivi, articoli di giornale locale).
Il territorio di riferimento è il Cilento e Vallo di Diano (provincia di Salerno, Campania).
Estrai TUTTI gli eventi che riesci a trovare nel testo. Per ogni evento individua: titolo, data, comune, categoria, descrizione.
Se una data è espressa come "sabato 12 luglio" usa l'anno corrente o prossimo a seconda del contesto.
Se non è specificato il comune, usa il comune più plausibile dal contesto del testo.`;

const FORMATO = `Restituisci SOLO un array JSON valido, senza testo prima o dopo:
[
  {
    "titolo": "Nome esatto dell'evento",
    "data": "YYYY-MM-DD",
    "dataFine": "YYYY-MM-DD",
    "orario": "HH:MM",
    "comune": "Nome comune (es. Teggiano, Padula, Agropoli…)",
    "luogo": "Luogo specifico (piazza, parco, teatro…)",
    "categoria": "Sagra" oppure "Musica" oppure "Cultura" oppure "Sport" oppure "Religioso" oppure "Mercato" oppure "Natura" oppure "Salute",
    "descrizione": "2-3 frasi descrittive",
    "gratuito": true,
    "prezzo": "€10 (solo se a pagamento)",
    "organizzatore": "Pro Loco / Comune / Associazione",
    "linkEsterno": "https://url (se presente nel testo)",
    "telefono": "numero (se presente)",
    "email": "email (se presente)"
  }
]
Ometti i campi facoltativi se non disponibili. Se non trovi eventi, rispondi con [].`;

export async function POST(req: Request) {
  try {
    const { testo, chiave } = (await req.json()) as { testo?: string; chiave?: string };

    // Protezione base — stessa chiave usata dagli altri endpoint
    if (chiave !== "cilento2025") {
      return NextResponse.json({ ok: false, errore: "Non autorizzato" }, { status: 401 });
    }

    if (!testo || testo.trim().length < 20) {
      return NextResponse.json({ ok: false, errore: "Testo troppo corto" }, { status: 400 });
    }

    const oggi = OGGI();

    // Chiamata a Claude Haiku — economica (~$0.001)
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: PROMPT_SISTEMA,
      messages: [
        {
          role: "user",
          content: `Data di oggi: ${oggi}. Anno corrente: ${oggi.slice(0, 4)}.

Estrai tutti gli eventi da questo testo:

---
${testo.slice(0, 6000)}
---

${FORMATO}`,
        },
      ],
    });

    // Estrai testo dalla risposta
    let tRisposta = "";
    for (const block of risposta.content) {
      if (block.type === "text") tRisposta += block.text;
    }

    // Cerca l'array JSON nella risposta
    const match = tRisposta.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({
        ok: false,
        errore: "L'AI non ha trovato eventi nel testo fornito",
        raw: tRisposta.slice(0, 200),
      });
    }

    let eventi: object[] = [];
    try {
      eventi = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({
        ok: false,
        errore: "Errore nel parsing JSON della risposta AI",
        raw: match[0].slice(0, 200),
      });
    }

    if (!Array.isArray(eventi) || eventi.length === 0) {
      return NextResponse.json({
        ok: true,
        salvati: 0,
        estratti: 0,
        messaggio: "Nessun evento trovato nel testo",
      });
    }

    // Filtra eventi senza titolo o data
    const validi = eventi.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => e.titolo && e.data && e.comune && e.categoria
    );

    // Pubblica direttamente in KV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salvati = await aggiungiEventiKV(validi as any[]);

    return NextResponse.json({
      ok: true,
      estratti: eventi.length,
      validi: validi.length,
      salvati,
      messaggio:
        salvati > 0
          ? `${salvati} nuov${salvati === 1 ? "o" : "i"} event${salvati === 1 ? "o" : "i"} pubblicat${salvati === 1 ? "o" : "i"} nel database`
          : "Nessun nuovo evento (già presenti o dati incompleti)",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, errore: err instanceof Error ? err.message : "Errore imprevisto" },
      { status: 500 }
    );
  }
}
