/**
 * /api/cron-light — Versione veloce del cron (no web search AI)
 *
 * ARCHITETTURA:
 *   Fase 0 – Scraping parallelo di ~40 sorgenti (timeout 7s ciascuna)
 *   Fase 1 – Claude Haiku estrae JSON strutturato dal contesto raccolto
 *   Fase 2 – Salvataggio in KV con deduplicazione
 *
 * Tutte le sorgenti girano in PARALLELO → tempo totale ≈ max(singolo sito) ≈ 7–15s
 * Completa in ~25-35 secondi totali (ben dentro il limite di 60s).
 * Supporta ?reset=1 per svuotare il KV prima di ricaricare.
 *
 * Triggered: manualmente dall'admin panel
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SORGENTI — ~40 siti, tutti in parallelo con timeout 7s
// Categorie: aggregatori · notizie locali · turismo/cultura · associazioni · comuni
// ─────────────────────────────────────────────────────────────────────────────
const SORGENTI = [

  // ══ AGGREGATORI NAZIONALI / REGIONALI ════════════════════════════════════
  { url: "https://www.sagre.net/campania/salerno/",                        label: "sagre.net Salerno" },
  { url: "https://www.eventiesagre.it/campania/sa/",                       label: "eventiesagre.it SA" },
  { url: "https://www.paesionline.it/italia/eventi-campania-salerno.asp",  label: "paesionline.it SA" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania SA" },
  { url: "https://www.ilovesagre.com/sagre-in-campania/",                  label: "ilovesagre Campania" },
  { url: "https://www.mangiaebevi.it/sagre/campania/",                     label: "mangiaebevi Campania" },
  { url: "https://www.vivicampania.com/eventi/",                           label: "ViviCampania eventi" },

  // ══ NOTIZIE LOCALI — CILENTO E VALLO DI DIANO ════════════════════════════
  { url: "https://www.infocilento.it/category/eventi/",                    label: "infoCilento (locale)" },
  { url: "https://www.ondanews.it/",                                       label: "OndaNews Vallo Diano" },
  { url: "https://www.cilentolive.it/",                                    label: "CilentoLive" },
  { url: "https://www.salernotoday.it/eventi/",                            label: "SalernoToday eventi" },
  { url: "https://www.ottopagine.it/sa/eventi/",                           label: "OttoPagine Salerno" },
  { url: "https://www.zerottonove.it/salerno/eventi/",                     label: "ZeroTtoNove SA" },
  { url: "https://www.agropolichannel.it/category/eventi/",                label: "AgropoliChannel" },
  { url: "https://www.cilentano.it/",                                      label: "Cilentano.it" },
  { url: "https://www.cilentoweb.it/eventi/",                              label: "CilentoWeb" },

  // ══ TURISMO, CULTURA E SITI TEMATICI ════════════════════════════════════
  { url: "https://parcoregionalecilento.it/it/eventi/",                    label: "Parco Nazionale Cilento" },
  { url: "https://www.certosadipadula.it/eventi/",                         label: "Certosa di Padula" },
  { url: "https://www.grottedipertosa-auletta.it/",                        label: "Grotte Pertosa-Auletta" },
  { url: "https://www.grottadicastelcivita.com/",                          label: "Grotta Castelcivita" },
  { url: "https://www.cilentodiet.com/it/eventi/",                         label: "CilentoDiet (UNESCO)" },
  { url: "https://www.visitcilento.it/eventi/",                            label: "VisitCilento" },

  // ══ COMUNI CILENTO COSTIERO ══════════════════════════════════════════════
  { url: "https://www.comune.agropoli.sa.it/eventi",                       label: "Comune Agropoli" },
  { url: "https://www.comune.castellabate.sa.it",                          label: "Comune Castellabate" },
  { url: "https://www.comune.pollica.sa.it",                               label: "Comune Pollica (Acciaroli)" },
  { url: "https://www.comune.pisciotta.sa.it",                             label: "Comune Pisciotta" },
  { url: "https://www.comune.camerota.sa.it",                              label: "Comune Camerota" },
  { url: "https://www.comune.ascea.sa.it",                                 label: "Comune Ascea" },
  { url: "https://www.comune.capaccio-paestum.sa.it",                      label: "Comune Capaccio-Paestum" },

  // ══ COMUNI VALLO DI DIANO — PRIORITÀ ════════════════════════════════════
  { url: "https://www.comune.sala-consilina.sa.it",                        label: "Comune Sala Consilina" },
  { url: "https://www.comune.teggiano.sa.it",                              label: "Comune Teggiano" },
  { url: "https://www.comune.padula.sa.it",                                label: "Comune Padula" },
  { url: "https://www.comune.polla.sa.it",                                 label: "Comune Polla" },
  { url: "https://www.comune.atena-lucana.sa.it",                          label: "Comune Atena Lucana" },
  { url: "https://www.comune.sassano.sa.it",                               label: "Comune Sassano" },
  { url: "https://www.comune.montesano-sulla-marcellana.sa.it",            label: "Comune Montesano s/M" },
  { url: "https://www.comune.buonabitacolo.sa.it",                         label: "Comune Buonabitacolo" },
  { url: "https://www.comune.sanza.sa.it",                                 label: "Comune Sanza" },
  { url: "https://www.comune.santarsenio.sa.it",                           label: "Comune Sant'Arsenio" },
  { url: "https://www.comune.pertosa.sa.it",                               label: "Comune Pertosa" },

  // ══ COMUNI GOLFO DI POLICASTRO ══════════════════════════════════════════
  { url: "https://www.comune.sapri.sa.it",                                 label: "Comune Sapri" },
  { url: "https://www.comune.santa-marina.sa.it",                          label: "Comune Santa Marina" },
  { url: "https://www.comune.san-giovanni-a-piro.sa.it",                   label: "Comune San Giovanni a Piro" },

  // ══ FEED RSS — FACEBOOK VIA RSS.APP (aggiungi qui i tuoi feed) ═══════════
  // Per aggiungere una pagina Facebook: vai su rss.app → incolla l'URL FB →
  // copia il link RSS generato e incollalo qui nel formato:
  // { url: "https://rss.app/feeds/TUO-CODICE.xml", label: "Pro Loco NomeComune (FB)" },
  //
  // Esempi da configurare su rss.app:
  //   facebook.com/proloco.teggiano
  //   facebook.com/comunedipolla
  //   facebook.com/proloco.salaconsulina
  //   facebook.com/proloco.padula
  //   facebook.com/proloco.sassano
  //   facebook.com/comuneatena
  //   facebook.com/proloco.agropoli
  //   facebook.com/prolococastellabate
  //   facebook.com/proloco.pisciotta
  //   facebook.com/proloco.camerota
  //   facebook.com/comunesapri
  //
  // Una volta configurati, de-commenta le righe e inserisci i codici RSS reali:
  // { url: "https://rss.app/feeds/CODICE1.xml", label: "Pro Loco Teggiano (FB)" },
  // { url: "https://rss.app/feeds/CODICE2.xml", label: "Comune Polla (FB)" },
  // { url: "https://rss.app/feeds/CODICE3.xml", label: "Pro Loco Sala Consilina (FB)" },

];

// ─────────────────────────────────────────────────────────────────────────────

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
  const timer = setTimeout(() => controller.abort(), 7000);
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
      .slice(0, 3500); // leggermente ridotto per tenere il prompt compatto
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

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 0 — Scraping parallelo di tutte le sorgenti
  // ══════════════════════════════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 1 — Estrazione con Haiku
  // ══════════════════════════════════════════════════════════════════════════
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

  const promptConContesto = `Analizza questo testo estratto da ${funzionanti} siti di eventi e notizie locali del Cilento, Vallo di Diano e Golfo di Policastro.

TESTO ESTRATTO:
${contesto.slice(0, 16000)}

━━━ REGOLE FONDAMENTALI ━━━
⛔ NON inventare eventi. NON aggiungere eventi non trovati esplicitamente nel testo.
⛔ NON completare con "eventi verosimili" o tradizioni storiche.
✅ Estrai SOLO eventi con titolo e data verificabili nel testo sopra.
✅ Se la data è approssimativa (es. "luglio ${anno}") usa il 1° del mese.
✅ Se trovi URL Facebook (facebook.com/...) o Instagram, includili.
✅ Stagionalità di riferimento per ${mese} ${anno}: ${stagione}

PRIORITÀ nell'estrazione:
1. Vallo di Diano: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano, Buonabitacolo, Sanza, Sant'Arsenio, Pertosa
2. Cilento costiero: Agropoli, Castellabate, Acciaroli, Pisciotta, Palinuro, Camerota, Ascea, Capaccio-Paestum
3. Golfo Policastro: Sapri, Santa Marina, San Giovanni a Piro, Vibonati
4. Entroterra Cilento: Vallo della Lucania, Rofrano, Morigerati

Rispondi SOLO con l'array JSON degli eventi REALI trovati — nessun testo prima o dopo:
${schemaJSON}`;

  const promptSenzaContesto = `I siti web non hanno restituito dati utili in questo momento.
Non inventare eventi.
Restituisci un array JSON vuoto: []`;

  try {
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 6000,
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

    // Il cron aggiunge sempre nuovi eventi senza mai cancellare quelli esistenti.
    // Il reset del database va fatto separatamente tramite seed-eventi?reset=1.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salvati = await aggiungiEventiKV(eventi as any[]);
    log.push(`  → ${eventi.length} eventi estratti dall'AI, ${salvati} nuovi aggiunti in KV`);

    return NextResponse.json({
      ok: true,
      trovati: eventi.length,
      nuovi: salvati,
      funzionanti,
      sorgenti: SORGENTI.length,
      haContestoReale: haContesto,
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
