/**
 * /api/import-da-url — Scarica un URL (sito Pro Loco, articolo, RSS, feed Facebook
 * tramite rss.app) ed estrae gli eventi con Claude Haiku, pubblicandoli
 * DIRETTAMENTE nel database KV.
 *
 * Funziona con:
 *   - Siti web normali (Pro Loco, Comuni, giornali locali)
 *   - Feed RSS (rss.app, fetchrss.com, ecc.)
 *   - Pagine Facebook mobile (m.facebook.com) — parziale, senza login
 *   - Qualsiasi URL testuale pubblico
 *
 * Costo: ~$0.001 per chiamata (Claude Haiku)
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const OGGI = () => new Date().toISOString().split("T")[0];

/** Scarica e pulisce il contenuto di un URL */
async function scaricaUrl(url: string): Promise<{ testo: string; tipo: "rss" | "html" | "errore"; errore?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    // Per Facebook mobile: riscriviamo facebook.com → m.facebook.com
    let urlEffettivo = url;
    if (url.includes("facebook.com") && !url.includes("m.facebook.com") && !url.includes("rss.app")) {
      urlEffettivo = url.replace("www.facebook.com", "m.facebook.com").replace("facebook.com/", "m.facebook.com/");
    }

    const res = await fetch(urlEffettivo, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
      },
    });

    if (!res.ok) {
      return { testo: "", tipo: "errore", errore: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    // RSS / Atom feed
    if (contentType.includes("xml") || raw.trimStart().startsWith("<?xml") || raw.includes("<rss") || raw.includes("<feed")) {
      // Estrai testo leggibile dall'XML
      const testo = raw
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<(title|description|content|summary|name|value)[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, val) => `${tag}: ${val}\n`)
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#[0-9]+;/g, " ")
        .replace(/\s{2,}/g, " ").trim()
        .slice(0, 8000);
      return { testo, tipo: "rss" };
    }

    // HTML normale
    const testo = raw
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#[0-9]+;/g, " ")
      .replace(/\s{2,}/g, " ").trim()
      .slice(0, 8000);

    return { testo, tipo: "html" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { testo: "", tipo: "errore", errore: msg.includes("abort") ? "Timeout (>15s)" : msg };
  } finally {
    clearTimeout(timer);
  }
}

const PROMPT_SISTEMA = `Sei un assistente che estrae eventi pubblici da pagine web e feed RSS italiani.
Il territorio è il Cilento e Vallo di Diano (provincia di Salerno, Campania).
Estrai TUTTI gli eventi reali che trovi nel contenuto. Per ogni evento cerca: titolo, data, comune, categoria, descrizione.
Se la data è parziale (es. "sabato 12 luglio") usa l'anno corrente.
Non inventare eventi non presenti nel testo.`;

const FORMATO = `Restituisci SOLO un array JSON valido:
[{
  "titolo": "nome evento",
  "data": "YYYY-MM-DD",
  "dataFine": "YYYY-MM-DD",
  "orario": "HH:MM",
  "comune": "Comune (es. Teggiano)",
  "luogo": "luogo specifico",
  "categoria": "Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute",
  "descrizione": "2-3 frasi",
  "gratuito": true,
  "prezzo": "€X (solo se a pagamento)",
  "organizzatore": "Pro Loco / Comune",
  "linkEsterno": "https://... (se nel testo)",
  "telefono": "numero (se nel testo)",
  "email": "email (se nel testo)"
}]
Se non ci sono eventi rispondi con: []`;

export async function POST(req: Request) {
  try {
    const { url, chiave } = (await req.json()) as { url?: string; chiave?: string };

    if (chiave !== "cilento2025") {
      return NextResponse.json({ ok: false, errore: "Non autorizzato" }, { status: 401 });
    }

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ ok: false, errore: "URL non valido" }, { status: 400 });
    }

    // 1. Scarica il contenuto
    const { testo, tipo, errore } = await scaricaUrl(url);

    if (tipo === "errore" || !testo || testo.length < 50) {
      return NextResponse.json({
        ok: false,
        errore: `Impossibile leggere l'URL: ${errore ?? "contenuto vuoto"}`,
        suggerimento: url.includes("facebook.com")
          ? "Facebook richiede login per la maggior parte dei contenuti. Usa rss.app per creare un feed RSS dalla pagina, poi incolla il link RSS qui."
          : "Prova con un URL diverso o usa l'import da testo.",
      });
    }

    const oggi = OGGI();

    // 2. Estrazione con Haiku
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: PROMPT_SISTEMA,
      messages: [
        {
          role: "user",
          content: `Data di oggi: ${oggi}. Anno corrente: ${oggi.slice(0, 4)}.
Tipo di fonte: ${tipo === "rss" ? "Feed RSS" : "Pagina web"} — ${url}

Contenuto scaricato:
---
${testo}
---

${FORMATO}`,
        },
      ],
    });

    let tRisposta = "";
    for (const block of risposta.content) {
      if (block.type === "text") tRisposta += block.text;
    }

    const match = tRisposta.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({
        ok: false,
        errore: "L'AI non ha trovato eventi in questa pagina",
        raw: tRisposta.slice(0, 200),
      });
    }

    let eventi: object[] = [];
    try {
      eventi = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ ok: false, errore: "Errore parsing JSON risposta AI" });
    }

    if (!Array.isArray(eventi) || eventi.length === 0) {
      return NextResponse.json({
        ok: true,
        salvati: 0,
        estratti: 0,
        tipo,
        messaggio: "Nessun evento trovato in questa pagina",
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validi = eventi.filter((e: any) => e.titolo && e.data && e.comune && e.categoria);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salvati = await aggiungiEventiKV(validi as any[]);

    return NextResponse.json({
      ok: true,
      estratti: eventi.length,
      validi: validi.length,
      salvati,
      tipo,
      messaggio:
        salvati > 0
          ? `${salvati} nuov${salvati === 1 ? "o" : "i"} event${salvati === 1 ? "o" : "i"} pubblicat${salvati === 1 ? "o" : "i"}`
          : "Nessun nuovo evento (già presenti o dati incompleti)",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, errore: err instanceof Error ? err.message : "Errore imprevisto" },
      { status: 500 }
    );
  }
}
