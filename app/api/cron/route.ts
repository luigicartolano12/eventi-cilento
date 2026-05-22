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
  // ── Aggregatori generali Cilento / Salerno ────────────────────────────────
  { url: "https://www.sagre.net/campania/salerno/",        label: "sagre.net Salerno" },
  { url: "https://www.eventiesagre.it/campania/sa/",       label: "eventiesagre.it SA" },
  { url: "https://www.paesionline.it/italia/eventi-campania-salerno.asp", label: "paesionline.it SA" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania SA" },
  // ── Notizie locali Cilento (coprono tutta la programmazione comunale) ─────
  { url: "https://www.infocilento.it/category/eventi/",    label: "infoCilento eventi" },
  { url: "https://www.ondanews.it/",                       label: "OndaNews Vallo Diano" },
  { url: "https://www.cilentolive.it/",                    label: "CilentoLive" },
  { url: "https://www.salernotoday.it/eventi/",            label: "SalernoToday eventi" },
  // ── Siti dedicati al Cilento ──────────────────────────────────────────────
  { url: "https://www.cilentoweb.it/eventi/",              label: "cilentoweb.it" },
  { url: "https://parcoregionalecilento.it/it/eventi/",    label: "Parco Nazionale Cilento" },
  // ── Comuni Cilento costiero ───────────────────────────────────────────────
  { url: "https://www.comune.agropoli.sa.it/eventi",       label: "Comune Agropoli" },
  { url: "https://www.comune.vallo-della-lucania.sa.it",   label: "Comune Vallo Lucania" },
  // ── Comuni Vallo di Diano (spesso ignorati dagli aggregatori) ────────────
  { url: "https://www.comune.sala-consilina.sa.it",        label: "Comune Sala Consilina" },
  { url: "https://www.comune.teggiano.sa.it",              label: "Comune Teggiano" },
  { url: "https://www.comune.padula.sa.it",                label: "Comune Padula" },
  { url: "https://www.comune.polla.sa.it",                 label: "Comune Polla" },
  { url: "https://www.comune.atena-lucana.sa.it",          label: "Comune Atena Lucana" },
  { url: "https://www.comune.sassano.sa.it",               label: "Comune Sassano" },
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
        content: `Esegui TUTTE queste 16 ricerche web per trovare eventi REALI per ${periodoLabel}.
PRIORITÀ ASSOLUTA: Vallo di Diano (Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano, Buonabitacolo).

— VALLO DI DIANO (ricerche dedicate) —
1. Cerca: "estate ${anno} vallo di diano programma eventi"
2. Cerca: "sagre vallo di diano ${anno} ${mese}"
3. Cerca: "sala consilina teggiano padula polla eventi estate ${anno}"
4. Cerca: "pro loco vallo di diano estate ${anno} programma"
5. Cerca: site:facebook.com "vallo di diano" eventi estate ${anno}
6. Cerca: "ondanews.it vallo diano estate ${anno} eventi"

— CILENTO COSTIERO —
7. Cerca: "agropoli castellabate acciaroli palinuro camerota eventi ${mese} ${anno}"
8. Cerca: "sagre cilento costiero estate ${anno}"
9. Cerca: site:facebook.com "pro loco cilento" eventi ${anno}

— GOLFO DI POLICASTRO —
10. Cerca: "golfo policastro sapri camerota marina eventi estate ${anno}"

— SOCIAL MEDIA & INSTAGRAM —
11. Cerca: site:instagram.com "cilento" eventi estate ${anno}
12. Cerca: "facebook eventi cilento ${mese} ${anno}"
13. Cerca: "instagram cilento sagre estate ${anno}"

— FONTI LOCALI —
14. Cerca: "infocilento.it eventi ${mese} ${anno}"
15. Cerca: "certosa di padula grotte pertosa eventi estate ${anno}"
16. Cerca: "parco nazionale cilento vallo diano eventi ${mese} ${anno}"

Per ogni evento trovato riporta: titolo, data, comune, tipo, URL fonte (includi URL Facebook/Instagram se disponibile).`,
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

  const schemaJSON = `[{
  "titolo":"nome evento",
  "data":"YYYY-MM-DD",
  "dataFine":"YYYY-MM-DD",
  "comune":"nome comune",
  "luogo":"nome luogo specifico",
  "categoria":"Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute",
  "descrizione":"2-3 frasi descrittive",
  "orario":"HH:MM",
  "gratuito":true,
  "organizzatore":"Pro Loco / Comune / Associazione",
  "telefono":"+39...",
  "sorgente":"https://url-fonte",
  "facebook":"https://facebook.com/... (se trovato)",
  "instagram":"https://instagram.com/... (se trovato)"
}]`;

  const promptEstrazione = haContesto
    ? `Hai raccolto informazioni da scraping web e ricerche Google su eventi del Cilento e Vallo di Diano per ${periodoLabel}:

${contestoTotale}

---
ISTRUZIONI:
1. Estrai TUTTI gli eventi reali identificabili dal testo — anche quelli menzionati brevemente
2. PRIORITÀ ASSOLUTA: Vallo di Diano — Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano, Buonabitacolo, Sanza, San Rufo, Sant'Arsenio, Pertosa, Monte San Giacomo
3. Quando trovi URL di Facebook (facebook.com/...) o Instagram (instagram.com/...) vicini a un evento, inseriscili nei campi "facebook" o "instagram"
4. Aggiungi eventi VEROSIMILI per raggiungere 35 totali
5. Distribuzione: min 12 Vallo di Diano + 10 Cilento costiero + 5 entroterra + 5 Golfo Policastro + 3 liberi
6. Stagionalità ${periodoLabel}: ${stagione}

Rispondi SOLO con l'array JSON, nessun testo prima o dopo:
${schemaJSON}`
    : `Genera 35 eventi del Cilento, Vallo di Diano e Golfo di Policastro per ${periodoLabel}.

VALLO DI DIANO — FOCUS PRINCIPALE (min 12 eventi):
• Comuni: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano sulla Marcellana, Buonabitacolo, Sanza, San Rufo, Sant'Arsenio, Pertosa, Monte San Giacomo, Casalbuono
• Sagre storiche: Sagra della Soppressata (Sassano), Sagra del Fagiolo (Montesano), Sagra del Caciocavallo (Teggiano), Estate Teggianese (Teggiano/lug-ago), Fiera di San Cono (Teggiano/giu), Sagra della Castagna (Sanza/ott)
• Feste patronali: San Cono (Teggiano/lug), Sant'Arsenio (Sant'Arsenio/ago), San Rocco (Sala Consilina/ago), San Pietro (Sala Consilina/giu)
• Siti: Certosa di Padula (UNESCO), Grotte di Pertosa-Auletta, Museo della Rocca di Teggiano
• Estate nei borghi: concerti in piazza, cinema all'aperto, rassegne teatrali, mercatini notturni
• Per le Pro Loco e Comuni noti, includi il link Facebook ufficiale nel campo "facebook"

CILENTO COSTIERO (min 10 eventi):
• Agropoli, Acciaroli, Castellabate, Pioppi, Ascea, Pisciotta, Palinuro, Camerota, Marina di Camerota
• Sagre: del Tonno (Agropoli/lug), del Fico Bianco (Pisciotta/ago), delle Alici (Pisciotta/ago)
• Feste: Sant'Erasmo (Agropoli/giu), Madonna della Neve (Pollica/ago)

ENTROTERRA + GOLFO POLICASTRO (min 8 eventi):
• Vallo della Lucania, Capaccio-Paestum, Rofrano, Morigerati, Sapri, Santa Marina, San Giovanni a Piro, Torre Orsaia

Stagionalità ${periodoLabel}: ${stagione}
Varietà: min 4 Sagra, 2 Religioso, 2 Musica, 2 Sport, 2 Natura, 1 Mercato, 1 Salute

Rispondi SOLO con l'array JSON:
${schemaJSON}`;

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
