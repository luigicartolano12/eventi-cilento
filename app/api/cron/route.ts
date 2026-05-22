/**
 * /api/cron — Pipeline di ricerca eventi multi-sorgente
 *
 * ARCHITETTURA:
 *   Fase 0 – Scraping diretto di siti eventi italiani reali (parallelo)
 *   Fase 1 – 8 ricerche web via Claude web_search (1 chiamata, tool multi-uso)
 *   Fase 2 – Claude estrae JSON strutturato da tutto il contesto raccolto
 *   Fase 3 – Salvataggio in KV con deduplicazione
 *
 * Triggered: automaticamente 2×/giorno + manualmente con ?chiave=...
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 120;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// Siti italiani da scrapare direttamente (testo estratto → Claude)
// ─────────────────────────────────────────────────────────────────────────────
const SORGENTI_DIRETTE = [
  { url: "https://www.sagre.net/campania/salerno/",        label: "sagre.net Salerno" },
  { url: "https://www.eventiesagre.it/campania/sa/",       label: "eventiesagre.it SA" },
  { url: "https://www.paesionline.it/italia/eventi-campania-salerno.asp", label: "paesionline.it SA" },
  { url: "https://www.cilentoweb.it/eventi/",              label: "cilentoweb.it" },
  { url: "https://www.comune.agropoli.sa.it/eventi",       label: "Comune Agropoli" },
  { url: "https://www.comune.vallo-della-lucania.sa.it",   label: "Comune Vallo" },
  { url: "https://parcoregionalecilento.it/it/eventi/",    label: "Parco Cilento" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania SA" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function stagionalita(mese: string): string {
  const m = mese.toLowerCase();
  if (["dicembre","gennaio","febbraio"].some(x => m.includes(x)))
    return "presepi viventi, capodanno, feste di Sant'Antonio, sagre invernali, concerti al chiuso, mostre d'arte";
  if (["marzo","aprile","maggio"].some(x => m.includes(x)))
    return "feste patronali di primavera, Pasqua, processioni, sagra del carciofo e del tartufo, trekking tra le fioriture, mercati artigianali, ciclismo";
  if (["giugno","luglio","agosto"].some(x => m.includes(x)))
    return "sagre del pesce, concerti estivi sulla spiaggia, festival musicali, feste patronali costiere, gare di nuoto, tornei beach volley, cinema all'aperto";
  return "sagre dei funghi porcini e castagne, vendemmia, feste patronali autunnali, trekking foliage, mercatini dell'artigianato, fiere agricole";
}

/** Scarica un sito, rimuove HTML, restituisce testo pulito max 5000 car */
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
      .slice(0, 5000);
    return text ? `\n\n=== SORGENTE: ${label} (${url}) ===\n${text}` : "";
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/** Estrae testo dai blocchi di risposta Claude (text + tool_result) */
function estraiTesto(content: Anthropic.ContentBlock[]): string {
  return content
    .map((b) => {
      if (b.type === "text") return b.text;
      return "";
    })
    .join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principale
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const chiaveManuale = url.searchParams.get("chiave");
  const cronSecret = process.env.CRON_SECRET;
  const triggerKey = process.env.TRIGGER_KEY ?? "cilento2025";

  const autorizzato =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    chiaveManuale === triggerKey;

  if (!autorizzato) {
    return NextResponse.json(
      { errore: "Non autorizzato — aggiungi ?chiave=cilento2025" },
      { status: 401 }
    );
  }

  const oggi = new Date().toISOString().split("T")[0];
  const periodoParam = url.searchParams.get("periodo");
  const mese = periodoParam ?? new Date().toLocaleString("it-IT", { month: "long" });
  const anno = periodoParam ? "" : String(new Date().getFullYear());
  const periodoLabel = periodoParam ?? `${mese} ${anno}`;
  const stagione = stagionalita(mese);

  const log: string[] = [];

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 0 — Scraping parallelo siti eventi italiani
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 0: scraping siti diretti...");
  const scrapeRisultati = await Promise.allSettled(
    SORGENTI_DIRETTE.map((s) => scrapeUrl(s.url, s.label))
  );
  const contestoScraping = scrapeRisultati
    .map((r) => (r.status === "fulfilled" ? r.value : ""))
    .join("");
  const sitiFunzionanti = scrapeRisultati.filter(
    (r) => r.status === "fulfilled" && r.value.length > 100
  ).length;
  log.push(`  → ${sitiFunzionanti}/${SORGENTI_DIRETTE.length} siti raggiunti`);

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 1 — Web search multi-query via Claude
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 1: ricerche web AI...");
  let contestoWebSearch = "";
  try {
    const ricercaRisposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305" as any, name: "web_search" }],
      system: `Sei un esperto di turismo del Cilento (Campania, Italia).
Usa lo strumento web_search PER OGNI PUNTO richiesto e cerca eventi REALI nel territorio.
Riporta solo ciò che trovi effettivamente online.`,
      messages: [{
        role: "user",
        content: `Esegui TUTTE queste 8 ricerche web distinte per trovare eventi REALI nel Cilento per ${periodoLabel}:

1. Cerca: "eventi sagre cilento ${mese} ${anno}"
2. Cerca: "sagre campania salerno ${anno} programma"
3. Cerca: "pro loco cilento eventi ${mese} ${anno}"
4. Cerca: "feste patronali cilento ${anno} ${mese}"
5. Cerca: "concerti festival musica cilento estate ${anno}"
6. Cerca: "agropoli paestum castellabate acciaroli eventi ${anno}"
7. Cerca: "vallo di diano sala consilina teggiano padula eventi ${anno}"
8. Cerca: "golfo policastro sapri camerota eventi ${anno}"

Per ogni ricerca elenca TUTTI gli eventi trovati con: titolo, data, comune, tipo di evento.`,
      }],
    });
    contestoWebSearch = estraiTesto(ricercaRisposta.content);
    log.push("  → ricerche web completate");
  } catch (err) {
    log.push(`  → web search non disponibile: ${err instanceof Error ? err.message : "errore"}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 2 — Estrazione JSON strutturata da tutto il contesto
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 2: estrazione JSON...");

  const contestoTotale = [
    contestoScraping.slice(0, 12000),
    contestoWebSearch.slice(0, 8000),
  ].filter(Boolean).join("\n\n");

  const haContesto = contestoTotale.length > 200;

  const promptEstrazione = haContesto
    ? `Hai raccolto queste informazioni su eventi nel Cilento per ${periodoLabel}:

${contestoTotale}

---
ISTRUZIONI:
1. Estrai TUTTI gli eventi reali che riesci a identificare dal testo sopra
2. Aggiungi eventi VEROSIMILI (basati su tradizioni locali reali) per raggiungere 30 eventi totali
3. Distribuzione obbligatoria: Cilento costiero + entroterra + Vallo di Diano + Golfo di Policastro
4. Stagionalità ${periodoLabel}: ${stagione}

Rispondi SOLO con l'array JSON, nessun testo:
[{"titolo":"...","data":"YYYY-MM-DD","dataFine":"YYYY-MM-DD","comune":"...","luogo":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute","descrizione":"2-3 frasi","orario":"HH:MM","gratuito":true,"sorgente":"url se reale"}]`
    : `Genera 30 eventi del Cilento, Vallo di Diano e Golfo di Policastro per ${periodoLabel}.

ORGANIZZATORI REALI del territorio (usa questi come base):
• Pro Loco: Agropoli, Acciaroli, Palinuro, Pisciotta, Camerota, Vallo della Lucania, Teggiano, Sala Consilina, Sapri
• Sagre storiche: Sagra del Fico Bianco (Pisciotta/ago), Sagra del Tonno (Agropoli/lug), Sagra della Mozzarella (Paestum/lug), Sagra del Carciofo (Paestum/apr), Sagra delle Alici (Pisciotta/ago), Sagra dei Sapori del Cilento (Vallo/set)
• Feste patronali: Sant'Erasmo (Agropoli/giu), Madonna del Granato (Capaccio/set), San Cono (Teggiano/giu), San Biagio (Castellabate/feb), Madonna della Neve (Pollica/ago), San Pantaleone (Pisciotta/lug), Sant'Antonio (Vallo/gen)
• Musei/Siti: Paestum (scavi e museo), Certosa di Padula, Castello di Agropoli, Castello di Castellabate, Grotte di Castelcivita, Grotte di Pertosa-Auletta
• Sport/Natura: Cilento Running, Podistica Vallo, ASD Agropoli, Canoa Club Cilento, Trekking Parco Nazionale
• Associazioni culturali: Circolo Legambiente Cilento, Arci, Auser locali, bande musicali comunali

DISTRIBUZIONE GEOGRAFICA obbligatoria (almeno 3 eventi per zona):
• Cilento costiero: Agropoli, Pioppi, Acciaroli, Castellabate, Ascea, Pisciotta, Palinuro, Camerota, Marina di Camerota
• Cilento entroterra: Capaccio-Paestum, Vallo della Lucania, Casaletto Spartano, Rofrano, Sanza, Morigerati
• Vallo di Diano: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano
• Golfo di Policastro: Sapri, Santa Marina, San Giovanni a Piro, Torre Orsaia

Stagionalità ${periodoLabel}: ${stagione}
Varietà categorie: min 4 Sagra, 2 Religioso, 2 Musica, 2 Sport, 2 Natura, 1 Mercato, 1 Salute

Rispondi SOLO con l'array JSON:
[{"titolo":"...","data":"YYYY-MM-DD","dataFine":"YYYY-MM-DD","comune":"...","luogo":"...","categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute","descrizione":"2-3 frasi","orario":"HH:MM","gratuito":true}]`;

  let eventiGrezzi: object[] = [];
  try {
    const risposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 6000,
      system: "Rispondi SOLO con un array JSON valido. Nessun markdown, nessun testo prima o dopo. Solo [ ... ].",
      messages: [{ role: "user", content: promptEstrazione }],
    });

    const testo = risposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
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
    eventiGrezzi = JSON.parse(match[0]);
    log.push(`  → ${eventiGrezzi.length} eventi estratti (contesto: ${haContesto ? "reale" : "generato"})`);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      messaggio: err instanceof Error ? err.message : "Errore AI",
      log,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 3 — Salvataggio con deduplicazione
  // ══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aggiunti = await aggiungiEventiKV(eventiGrezzi as any[]);
  log.push(`  → ${aggiunti} eventi nuovi salvati in KV`);

  return NextResponse.json({
    ok: true,
    trovati: eventiGrezzi.length,
    nuovi: aggiunti,
    sitiFunzionanti,
    haContestoReale: haContesto,
    data: oggi,
    log,
  });
}
