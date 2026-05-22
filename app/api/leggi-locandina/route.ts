/**
 * /api/leggi-locandina
 * Agente AI vision: riceve un'immagine (locandina, volantino, post social)
 * e restituisce i dati dell'evento in formato strutturato.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, mediaType } = body as {
      image: string;         // base64 stringa
      mediaType: string;     // es. "image/jpeg", "image/png", "image/webp"
    };

    if (!image || !mediaType) {
      return NextResponse.json({ errore: "Parametri mancanti: image e mediaType richiesti" }, { status: 400 });
    }

    // Tipi MIME accettati da Claude vision
    const tipiAccettati = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!tipiAccettati.includes(mediaType)) {
      return NextResponse.json({ errore: `Formato non supportato: ${mediaType}` }, { status: 400 });
    }

    const risposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: `Sei un assistente specializzato nell'estrarre informazioni da locandine e volantini di eventi italiani.
Analizza l'immagine e restituisci SOLO un oggetto JSON valido con i campi trovati.
Se un campo non è presente nella locandina, omettilo completamente.
Non aggiungere dati inventati: usa solo ciò che si vede chiaramente nell'immagine.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: image,
              },
            },
            {
              type: "text",
              text: `Analizza questa locandina/volantino ed estrai i dati dell'evento.

Rispondi SOLO con un oggetto JSON con questi campi (includi solo quelli che riesci a leggere chiaramente):
{
  "titolo": "nome dell'evento",
  "data": "YYYY-MM-DD (se disponibile)",
  "dataFine": "YYYY-MM-DD (solo se evento plurigiorno)",
  "orario": "HH:MM (24h)",
  "luogo": "nome del luogo/venue",
  "comune": "nome del comune",
  "categoria": "Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute",
  "descrizione": "descrizione breve dell'evento, max 3 frasi",
  "gratuito": true/false,
  "prezzo": "es. €5, Ingresso libero",
  "organizzatore": "nome Pro Loco o associazione",
  "telefono": "numero di telefono",
  "email": "indirizzo email",
  "sito": "URL sito web",
  "note": "altre informazioni utili visibili nella locandina"
}

Restituisci SOLO il JSON grezzo, senza markdown o testo aggiuntivo.`,
            },
          ],
        },
      ],
    });

    const testo = risposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Pulizia markdown se presente
    const pulito = testo.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    // Estrai JSON
    const match = pulito.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ errore: "Impossibile leggere la locandina", testo: pulito.slice(0, 200) }, { status: 422 });
    }

    const dati = JSON.parse(match[0]);
    return NextResponse.json({ ok: true, evento: dati });

  } catch (err) {
    console.error("[leggi-locandina]", err);
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore interno" },
      { status: 500 }
    );
  }
}
