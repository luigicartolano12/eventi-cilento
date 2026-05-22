/**
 * /api/cron-light — Versione veloce del cron (no web search)
 *
 * Usa solo scraping diretto + claude-haiku per l'estrazione.
 * Completato in ~15-25 secondi invece di 2 minuti.
 * Supporta ?reset=1 per svuotare prima il KV.
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
  { url: "https://www.sagre.net/campania/salerno/",        label: "sagre.net" },
  { url: "https://www.eventiesagre.it/campania/sa/",       label: "eventiesagre.it" },
  { url: "https://www.cilentoweb.it/eventi/",              label: "cilentoweb.it" },
  { url: "https://parcoregionalecilento.it/it/eventi/",    label: "Parco Cilento" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania" },
];

function stagionalita(mese: string): string {
  const m = mese.toLowerCase();
  if (["dicembre", "gennaio", "febbraio"].some(x => m.includes(x)))
    return "presepi viventi, capodanno, feste invernali, sagre invernali, concerti al chiuso";
  if (["marzo", "aprile", "maggio"].some(x => m.includes(x)))
    return "feste patronali primaverili, Pasqua, sagre del carciofo e del tartufo, trekking";
  if (["giugno", "luglio", "agosto"].some(x => m.includes(x)))
    return "sagre del pesce, concerti estivi, feste patronali costiere, beach volley, cinema all'aperto";
  return "sagre dei funghi e castagne, vendemmia, feste autunnali, trekking foliage, mercatini";
}

async function scrapeUrl(url: string, label: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EventiCilentoBot/2.0; +https://eventicial.it/bot)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "it-IT,it;q=0.9",
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
      .replace(/\s{2,}/g, " ").trim()
      .slice(0, 4000);
    return text ? `\n\n=== ${label} ===\n${text}` : "";
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

  // ─── Fase 0: scraping parallelo ────────────────────────────────────────────
  log.push("Fase 0: scraping siti...");
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

  const prompt = haContesto
    ? `Hai estratto questo testo da siti italiani di eventi. Identifica e struttura tutti gli eventi REALI del Cilento, Vallo di Diano e Golfo di Policastro (provincia di Salerno, Campania).
Aggiungi eventi verosimili basati su tradizioni locali reali per raggiungere 20 eventi totali.
Stagionalità ${mese} ${anno}: ${stagione}

TESTO SCRAPING:
${contesto.slice(0, 10000)}

DISTRIBUZIONE: Cilento costiero + entroterra + Vallo di Diano + Golfo Policastro (almeno 3 per zona).
Rispondi SOLO con l'array JSON, nessun altro testo:
[{"titolo":"...","data":"YYYY-MM-DD","dataFine":"YYYY-MM-DD","comune":"...","luogo":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute","descrizione":"2-3 frasi descrittive","orario":"HH:MM","gratuito":true,"sorgente":"url se reale"}]`
    : `Genera 20 eventi realistici del Cilento per ${mese} ${anno}.
Stagionalità: ${stagione}
Zone obbligatorie: Agropoli, Acciaroli, Castellabate, Palinuro, Camerota, Pisciotta, Vallo della Lucania, Sala Consilina, Teggiano, Sapri.
Varietà: min 4 Sagra, 2 Religioso, 2 Musica, 2 Sport, 2 Natura, 1 Mercato.
Rispondi SOLO con l'array JSON:
[{"titolo":"...","data":"YYYY-MM-DD","comune":"...","luogo":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute","descrizione":"2-3 frasi","orario":"HH:MM","gratuito":true}]`;

  try {
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      system: "Rispondi SOLO con un array JSON valido. Nessun markdown, nessun testo prima o dopo il JSON. Solo [ ... ].",
      messages: [{ role: "user", content: prompt }],
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
