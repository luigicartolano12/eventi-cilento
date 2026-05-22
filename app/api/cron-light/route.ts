/**
 * /api/cron-light — Versione veloce del cron (no web search AI)
 *
 * Scraping parallelo di 12 siti (notizie locali + comuni Vallo di Diano)
 * + estrazione con claude-haiku. Completa in ~20-30 secondi.
 * Supporta ?reset=1 per svuotare il KV prima di ricaricare.
 *
 * Triggered: manualmente dall'admin panel
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV, svuotaEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SORGENTI = [
  // ── Aggregatori nazionali Salerno / Campania ───────────────────────────────
  { url: "https://www.sagre.net/campania/salerno/",         label: "sagre.net Salerno" },
  { url: "https://www.eventiesagre.it/campania/sa/",        label: "eventiesagre.it SA" },
  { url: "https://www.paesionline.it/italia/eventi-campania-salerno.asp", label: "paesionline.it SA" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania SA" },
  // ── Notizie locali Cilento (aggregano TUTTE le programmazioni comunali) ────
  { url: "https://www.infocilento.it/category/eventi/",     label: "infoCilento (locale)" },
  { url: "https://www.ondanews.it/",                        label: "OndaNews Vallo Diano" },
  { url: "https://www.cilentolive.it/",                     label: "CilentoLive" },
  { url: "https://www.salernotoday.it/eventi/",             label: "SalernoToday eventi" },
  // ── Siti Cilento ──────────────────────────────────────────────────────────
  { url: "https://www.cilentoweb.it/eventi/",               label: "cilentoweb.it" },
  { url: "https://parcoregionalecilento.it/it/eventi/",     label: "Parco Nazionale Cilento" },
  // ── Comuni Vallo di Diano ─────────────────────────────────────────────────
  { url: "https://www.comune.sala-consilina.sa.it",         label: "Comune Sala Consilina" },
  { url: "https://www.comune.teggiano.sa.it",               label: "Comune Teggiano" },
  { url: "https://www.comune.padula.sa.it",                 label: "Comune Padula" },
  { url: "https://www.comune.polla.sa.it",                  label: "Comune Polla" },
  { url: "https://www.comune.atena-lucana.sa.it",           label: "Comune Atena Lucana" },
  { url: "https://www.comune.sassano.sa.it",                label: "Comune Sassano" },
];

function stagionalita(mese: string): string {
  const m = mese.toLowerCase();
  if (["dicembre","gennaio","febbraio"].some(x => m.includes(x)))
    return "presepi viventi, capodanno, feste invernali, sagre invernali, concerti al chiuso";
  if (["marzo","aprile","maggio"].some(x => m.includes(x)))
    return "feste patronali primaverili, Pasqua, processioni, sagre del carciofo e tartufo, trekking tra le fioriture";
  if (["giugno","luglio","agosto"].some(x => m.includes(x)))
    return "sagre del pesce, concerti estivi, feste patronali costiere, cinema all'aperto, estate nei borghi, eventi in piazza";
  return "sagre dei funghi e castagne, vendemmia, feste autunnali, trekking foliage, mercatini artigianato";
}

async function scrapeUrl(url: string, label: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EventiCilentoBot/2.0; +https://eventicial.it/bot)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#[0-9]+;/g, " ")
      .replace(/\s{2,}/g, " ").trim()
      .slice(0, 4500);
    return text ? `\n\n=== ${label} (${url}) ===\n${text}` : "";
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chiave = url.searchParams.get("chiave");
  const reset = url.searchParams.get("reset") === "1";
  const triggerKey = process.env.TRIGGER_KEY ?? "cilento2025";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  const autorizzato =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    chiave === triggerKey;

  if (!autorizzato) {
    return NextResponse.json(
      { errore: "Non autorizzato — aggiungi ?chiave=cilento2025" },
      { status: 401 }
    );
  }

  const mese = new Date().toLocaleString("it-IT", { month: "long" });
  const anno = String(new Date().getFullYear());
  const stagione = stagionalita(mese);
  const log: string[] = [];

  // ─── Reset opzionale ───────────────────────────────────────────────────────
  if (reset) {
    await svuotaEventiKV();
    log.push("✓ KV svuotato (reset completato)");
  }

  // ─── Fase 0: scraping parallelo di tutti i siti ────────────────────────────
  log.push(`Fase 0: scraping ${SORGENTI.length} siti in parallelo...`);
  const risultati = await Promise.allSettled(
    SORGENTI.map(s => scrapeUrl(s.url, s.label))
  );
  const contesto = risultati
    .map(r => r.status === "fulfilled" ? r.value : "")
    .join("");
  const funzionanti = risultati.filter(
    r => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value.length > 100
  ).length;
  log.push(`  → ${funzionanti}/${SORGENTI.length} siti raggiunti`);

  // ─── Fase 1: estrazione con haiku ──────────────────────────────────────────
  log.push("Fase 1: estrazione AI (haiku)...");
  const haContesto = contesto.length > 200;

  const schemaJSON = `[{
  "titolo":"nome evento",
  "data":"YYYY-MM-DD",
  "dataFine":"YYYY-MM-DD",
  "comune":"nome comune",
  "luogo":"nome posto specifico",
  "categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute",
  "descrizione":"2-3 frasi descrittive dell'evento",
  "orario":"HH:MM",
  "gratuito":true,
  "organizzatore":"Pro Loco / Comune / Associazione",
  "telefono":"+39...",
  "sorgente":"https://url-sito-fonte",
  "facebook":"https://facebook.com/... (se trovato)",
  "instagram":"https://instagram.com/... (se trovato)"
}]`;

  const promptConContesto = `Analizza questo testo estratto da siti di eventi e notizie locali del Cilento.
Identifica TUTTI gli eventi reali menzionati. Poi aggiungi eventi verosimili per raggiungere 25 totali.
Stagionalità ${mese} ${anno}: ${stagione}

TESTO ESTRATTO:
${contesto.slice(0, 12000)}

DISTRIBUZIONE OBBLIGATORIA:
• Vallo di Diano (PRIORITÀ): min 10 eventi — Sala Consilina, Teggiano, Padula, Polla, Atena Lucana,
  Sassano, Montesano, Buonabitacolo, Sanza, Sant'Arsenio, Pertosa, Monte San Giacomo
• Cilento costiero: min 8 eventi — Agropoli, Acciaroli, Castellabate, Ascea, Pisciotta, Palinuro, Camerota
• Golfo Policastro + entroterra: min 5 — Sapri, Vallo della Lucania, Capaccio-Paestum, Rofrano

IMPORTANTE: Se trovi link a Facebook (facebook.com/...) o Instagram (instagram.com/...) vicini a un evento, includili.

Rispondi SOLO con l'array JSON valido, nessun testo:
${schemaJSON}`;

  const promptSenzaContesto = `Genera 25 eventi realistici del Cilento e Vallo di Diano per ${mese} ${anno}.
Stagionalità: ${stagione}

VALLO DI DIANO — PRIORITÀ (min 10 eventi):
• Comuni: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano, Buonabitacolo, Sanza
• Sagre: Soppressata (Sassano), Fagiolo (Montesano), Caciocavallo (Teggiano), Estate Teggianese (lug-ago)
• Feste: San Cono (Teggiano), San Rocco (Sala Consilina), Sant'Arsenio
• Siti: Certosa di Padula, Grotte di Pertosa, Castello di Teggiano

CILENTO (min 10 eventi):
• Costiero: Agropoli, Acciaroli, Castellabate, Pisciotta, Palinuro, Camerota
• Sagre: del Tonno (Agropoli), del Fico Bianco (Pisciotta), delle Alici (Pisciotta)
• Golfo: Sapri, Santa Marina, San Giovanni a Piro

Per gli eventi noti, includi il link Facebook ufficiale della Pro Loco / Comune organizzatore.

Rispondi SOLO con l'array JSON valido:
${schemaJSON}`;

  try {
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 5000,
      system: "Rispondi SOLO con un array JSON valido. Nessun markdown, nessun testo prima o dopo. Solo [ ... ].",
      messages: [{ role: "user", content: haContesto ? promptConContesto : promptSenzaContesto }],
    });

    const testo = risposta.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const pulito = testo.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const match = pulito.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({
        ok: false,
        messaggio: "Formato AI non valido",
        testo: pulito.slice(0, 200),
        log,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventi = JSON.parse(match[0]) as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nuovi = await aggiungiEventiKV(eventi as any[]);
    log.push(`  → ${eventi.length} eventi estratti, ${nuovi} nuovi salvati in KV`);

    return NextResponse.json({
      ok: true,
      trovati: eventi.length,
      nuovi,
      funzionanti,
      haContestoReale: haContesto,
      reset,
      log,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      messaggio: err instanceof Error ? err.message : "Errore AI",
      log,
    });
  }
}
