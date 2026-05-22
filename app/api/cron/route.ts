/**
 * /api/cron — Pipeline di ricerca eventi multi-sorgente
 *
 * ARCHITETTURA:
 *   Fase 0 – Scraping parallelo di ~50 sorgenti (timeout 7s ciascuna)
 *   Fase 1 – 20 ricerche web specifiche via Claude web_search
 *   Fase 2 – Claude Opus estrae JSON strutturato da tutto il contesto
 *   Fase 3 – Salvataggio in KV con deduplicazione
 *
 * Triggered: automaticamente 2×/giorno + manualmente con ?chiave=...
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEventiKV, sostituisciEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 120;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SORGENTI — ~50 siti, tutti in parallelo con timeout 7s
// Categorie: aggregatori · notizie locali · turismo · cultura · associazioni · comuni
// ─────────────────────────────────────────────────────────────────────────────
const SORGENTI_DIRETTE = [

  // ══ AGGREGATORI NAZIONALI / REGIONALI ═════════════════════════════════════
  { url: "https://www.sagre.net/campania/salerno/",                        label: "sagre.net Salerno" },
  { url: "https://www.eventiesagre.it/campania/sa/",                       label: "eventiesagre.it SA" },
  { url: "https://www.paesionline.it/italia/eventi-campania-salerno.asp",  label: "paesionline.it SA" },
  { url: "https://www.turismoincampania.it/cosa-fare/eventi/?provincia=salerno", label: "Turismo Campania SA" },
  { url: "https://www.regione.campania.it/campania/export/sites/default/RCSTART/index.html#!cultura_sport_e_turismo", label: "Regione Campania" },
  { url: "https://www.2night.it/campania/salerno/",                        label: "2night Salerno" },
  { url: "https://www.ilovesagre.com/sagre-in-campania/",                  label: "ilovesagre Campania" },
  { url: "https://www.vivicampania.com/eventi/",                           label: "ViviCampania eventi" },
  { url: "https://www.mangiaebevi.it/sagre/campania/",                     label: "mangiaebevi Campania" },

  // ══ NOTIZIE LOCALI CILENTO E VALLO DI DIANO ═══════════════════════════════
  { url: "https://www.infocilento.it/category/eventi/",                    label: "infoCilento" },
  { url: "https://www.ondanews.it/",                                       label: "OndaNews (Vallo Diano)" },
  { url: "https://www.cilentolive.it/",                                    label: "CilentoLive" },
  { url: "https://www.salernotoday.it/eventi/",                            label: "SalernoToday" },
  { url: "https://www.ottopagine.it/sa/eventi/",                           label: "OttoPagine Salerno" },
  { url: "https://www.zerottonove.it/salerno/eventi/",                     label: "ZeroTtoNove SA" },
  { url: "https://www.cronachesalerno.it/categoria/eventi/",               label: "Cronache Salerno" },
  { url: "https://www.agropolichannel.it/category/eventi/",                label: "AgropoliChannel" },
  { url: "https://www.cilentano.it/",                                      label: "Cilentano.it" },
  { url: "https://www.cilentoweb.it/eventi/",                              label: "CilentoWeb" },
  { url: "https://www.lacittadisalerno.it/",                               label: "La Città di Salerno" },

  // ══ TURISMO, CULTURA E SITI TEMATICI ══════════════════════════════════════
  { url: "https://parcoregionalecilento.it/it/eventi/",                    label: "Parco Nazionale Cilento" },
  { url: "https://www.certosadipadula.it/eventi/",                         label: "Certosa di Padula" },
  { url: "https://www.museopaestum.beniculturali.it/",                     label: "Museo Paestum" },
  { url: "https://www.grottedipertosa-auletta.it/",                        label: "Grotte Pertosa-Auletta" },
  { url: "https://www.grottadicastelcivita.com/",                          label: "Grotta Castelcivita" },
  { url: "https://www.cilentodiet.com/it/eventi/",                         label: "CilentoDiet (UNESCO)" },
  { url: "https://www.visitcilento.it/eventi/",                            label: "VisitCilento" },
  { url: "https://www.campaniatourism.it/it/eventi/",                      label: "CampaniaTourism" },

  // ══ COMUNI CILENTO COSTIERO ════════════════════════════════════════════════
  { url: "https://www.comune.agropoli.sa.it/eventi",                       label: "Comune Agropoli" },
  { url: "https://www.comune.castellabate.sa.it",                          label: "Comune Castellabate" },
  { url: "https://www.comune.pollica.sa.it",                               label: "Comune Pollica (Acciaroli/Pioppi)" },
  { url: "https://www.comune.pisciotta.sa.it",                             label: "Comune Pisciotta" },
  { url: "https://www.comune.camerota.sa.it",                              label: "Comune Camerota" },
  { url: "https://www.comune.centola.sa.it",                               label: "Comune Centola (Palinuro)" },
  { url: "https://www.comune.ascea.sa.it",                                 label: "Comune Ascea" },
  { url: "https://www.comune.vallo-della-lucania.sa.it",                   label: "Comune Vallo della Lucania" },
  { url: "https://www.comune.capaccio-paestum.sa.it",                      label: "Comune Capaccio-Paestum" },
  { url: "https://www.comune.casal-velino.sa.it",                          label: "Comune Casal Velino" },
  { url: "https://www.comune.montecorice.sa.it",                           label: "Comune Montecorice" },

  // ══ COMUNI VALLO DI DIANO ══════════════════════════════════════════════════
  { url: "https://www.comune.sala-consilina.sa.it",                        label: "Comune Sala Consilina" },
  { url: "https://www.comune.teggiano.sa.it",                              label: "Comune Teggiano" },
  { url: "https://www.comune.padula.sa.it",                                label: "Comune Padula" },
  { url: "https://www.comune.polla.sa.it",                                 label: "Comune Polla" },
  { url: "https://www.comune.atena-lucana.sa.it",                          label: "Comune Atena Lucana" },
  { url: "https://www.comune.sassano.sa.it",                               label: "Comune Sassano" },
  { url: "https://www.comune.montesano-sulla-marcellana.sa.it",            label: "Comune Montesano s/M" },
  { url: "https://www.comune.buonabitacolo.sa.it",                         label: "Comune Buonabitacolo" },
  { url: "https://www.comune.sanza.sa.it",                                 label: "Comune Sanza" },
  { url: "https://www.comune.san-rufo.sa.it",                              label: "Comune San Rufo" },
  { url: "https://www.comune.santarsenio.sa.it",                           label: "Comune Sant'Arsenio" },
  { url: "https://www.comune.pertosa.sa.it",                               label: "Comune Pertosa" },
  { url: "https://www.comune.san-pietro-al-tanagro.sa.it",                 label: "Comune San Pietro al Tanagro" },

  // ══ COMUNI GOLFO DI POLICASTRO ════════════════════════════════════════════
  { url: "https://www.comune.sapri.sa.it",                                 label: "Comune Sapri" },
  { url: "https://www.comune.santa-marina.sa.it",                          label: "Comune Santa Marina" },
  { url: "https://www.comune.vibonati.sa.it",                              label: "Comune Vibonati" },
  { url: "https://www.comune.san-giovanni-a-piro.sa.it",                   label: "Comune San Giovanni a Piro" },
  { url: "https://www.comune.torre-orsaia.sa.it",                          label: "Comune Torre Orsaia" },

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
    return "sagre del pesce, concerti estivi sulla spiaggia, festival musicali, feste patronali costiere, cinema all'aperto, estate nei borghi, eventi in piazza, rassegne teatrali";
  return "sagre dei funghi porcini e castagne, vendemmia, feste patronali autunnali, trekking foliage, mercatini dell'artigianato, fiere agricole";
}

/** Scarica un sito, rimuove HTML, restituisce testo pulito max 4500 car */
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
      .slice(0, 4500);
    return text ? `\n\n=== SORGENTE: ${label} (${url}) ===\n${text}` : "";
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/** Estrae testo dai blocchi di risposta Claude */
function estraiTesto(content: Anthropic.ContentBlock[]): string {
  return content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
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

  const reset = url.searchParams.get("reset") === "1";
  const oggi = new Date().toISOString().split("T")[0];
  const periodoParam = url.searchParams.get("periodo");
  const mese = periodoParam ?? new Date().toLocaleString("it-IT", { month: "long" });
  const anno = periodoParam ? "" : String(new Date().getFullYear());
  const periodoLabel = periodoParam ?? `${mese} ${anno}`;
  const stagione = stagionalita(mese);
  const log: string[] = [];

  // ⚠️ NON resettiamo subito: prima estraiamo i nuovi eventi, poi sostituiamo.
  if (reset) {
    log.push("ℹ️ Reset richiesto — verrà eseguito DOPO l'estrazione riuscita");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 0 — Scraping parallelo di tutte le sorgenti
  // ══════════════════════════════════════════════════════════════════════════
  log.push(`Fase 0: scraping ${SORGENTI_DIRETTE.length} sorgenti in parallelo...`);
  const scrapeRisultati = await Promise.allSettled(
    SORGENTI_DIRETTE.map((s) => scrapeUrl(s.url, s.label))
  );
  const contestoScraping = scrapeRisultati
    .map((r) => (r.status === "fulfilled" ? r.value : ""))
    .join("");
  const sitiFunzionanti = scrapeRisultati.filter(
    (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value.length > 100
  ).length;
  log.push(`  → ${sitiFunzionanti}/${SORGENTI_DIRETTE.length} siti raggiunti`);

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 1 — Web search con 20 query specifiche per area e tipo di evento
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 1: 20 ricerche web AI...");
  let contestoWebSearch = "";
  try {
    const ricercaRisposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 6000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305" as any, name: "web_search" }],
      system: `Sei un esperto di eventi locali in Campania (Italia), specializzato nel Cilento e Vallo di Diano.
Esegui OGNI ricerca richiesta. Riporta solo dati reali trovati online: titolo evento, data, comune, organizzatore, tipo.`,
      messages: [{
        role: "user",
        content: `Esegui TUTTE queste 20 ricerche per trovare eventi REALI per ${periodoLabel}:

— VALLO DI DIANO (priorità assoluta) —
1. "estate ${anno} vallo di diano programma eventi sagre"
2. "sala consilina eventi ${mese} ${anno} pro loco comune"
3. "teggiano estate ${anno} eventi sagre feste"
4. "padula certosa eventi ${anno} programma estate"
5. "polla atena lucana sassano eventi estate ${anno}"
6. "montesano buonabitacolo sanza eventi ${anno}"
7. site:ondanews.it eventi vallo diano ${anno}
8. site:facebook.com "pro loco" "vallo di diano" eventi ${anno}

— CILENTO COSTIERO —
9. "agropoli castellabate acciaroli eventi ${mese} ${anno}"
10. "palinuro camerota pisciotta sagre estate ${anno}"
11. "paestum capaccio eventi sagre ${anno}"
12. site:facebook.com "pro loco cilento" eventi estate ${anno}
13. site:infocilento.it eventi cilento ${mese} ${anno}

— GOLFO DI POLICASTRO —
14. "sapri vibonati santa marina eventi estate ${anno}"
15. "golfo di policastro sagre festival ${anno}"

— ASSOCIAZIONI E CULTURA —
16. "legambiente cilento eventi ${anno}"
17. "proloco cilento campania eventi ${anno}"
18. "certosa padula grotte pertosa castelcivita eventi ${anno}"
19. "festival cilento musica cultura ${anno}"
20. "sagre cilento campania ${mese} ${anno} lista"

Per ogni evento trovato riporta: titolo, data, comune, organizzatore, URL fonte (includi URL Facebook/Instagram se trovato).`,
      }],
    });
    contestoWebSearch = estraiTesto(ricercaRisposta.content);
    log.push("  → ricerche web completate");
  } catch (err) {
    log.push(`  → web search non disponibile: ${err instanceof Error ? err.message.slice(0, 80) : "errore"}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 2 — Estrazione JSON strutturata
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 2: estrazione JSON...");

  const contestoTotale = [
    contestoScraping.slice(0, 14000),
    contestoWebSearch.slice(0, 8000),
  ].filter(Boolean).join("\n\n");

  const haContesto = contestoTotale.length > 200;

  const schemaJSON = `[{
  "titolo": "nome evento",
  "data": "YYYY-MM-DD",
  "dataFine": "YYYY-MM-DD",
  "comune": "nome comune",
  "luogo": "luogo specifico",
  "categoria": "Sagra|Musica|Cultura|Sport|Religioso|Mercato|Natura|Salute",
  "descrizione": "2-3 frasi descrittive",
  "orario": "HH:MM",
  "gratuito": true,
  "organizzatore": "Pro Loco / Comune / Associazione",
  "telefono": "+39...",
  "sorgente": "https://url-fonte",
  "facebook": "https://facebook.com/... (se trovato)",
  "instagram": "https://instagram.com/... (se trovato)"
}]`;

  const promptEstrazione = haContesto
    ? `Hai raccolto dati da ${sitiFunzionanti} siti web e ricerche Google su eventi del Cilento e Vallo di Diano per ${periodoLabel}.

DATI RACCOLTI:
${contestoTotale}

━━━ ISTRUZIONI ━━━
1. Estrai TUTTI gli eventi reali identificabili (anche se menzionati brevemente o con data approssimativa)
2. PRIORITÀ ASSOLUTA Vallo di Diano: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano, Buonabitacolo, Sanza, Sant'Arsenio, Pertosa, Monte San Giacomo, San Rufo, San Pietro al Tanagro
3. Se trovi URL Facebook/Instagram associati all'evento, includili
4. Completa con eventi VEROSIMILI (basati su tradizioni locali documentate) fino a 40 totali
5. Distribuzione: min 15 Vallo di Diano · min 12 Cilento costiero · min 5 Golfo Policastro · min 5 entroterra · 3 liberi
6. Stagionalità ${periodoLabel}: ${stagione}
7. Usa dati reali come organizzatori (Pro Loco, Comuni, Legambiente, ARCI, bande musicali, associazioni sportive locali)

Rispondi SOLO con l'array JSON — nessun testo prima o dopo:
${schemaJSON}`
    : `Genera 40 eventi reali e verosimili del Cilento, Vallo di Diano e Golfo di Policastro per ${periodoLabel}.

━━━ VALLO DI DIANO — PRIORITÀ (min 15 eventi) ━━━
Comuni: Sala Consilina, Teggiano, Padula, Polla, Atena Lucana, Sassano, Montesano s/M, Buonabitacolo, Sanza, San Rufo, Sant'Arsenio, Pertosa, Monte San Giacomo, Casalbuono, San Pietro al Tanagro
Sagre storiche: Soppressata (Sassano), Fagiolo (Montesano), Caciocavallo (Teggiano), Castagna (Sanza)
Feste: San Cono (Teggiano/lug), San Rocco (Sala Consilina/ago), Sant'Arsenio (ago)
Siti: Certosa Padula UNESCO, Grotte Pertosa, Grotta Castelcivita, Rocca Teggiano, Castello Sala Consilina
Associazioni: Pro Loco di ogni comune, ARCI, Legambiente, bande musicali locali
Estate: concerti in piazza, cinema all'aperto, rassegne teatrali, mercatini artigianali notturni

━━━ CILENTO COSTIERO (min 12 eventi) ━━━
Agropoli, Acciaroli, Castellabate, Pioppi, Ascea, Pisciotta, Palinuro, Camerota, Marina di Camerota, Capaccio-Paestum
Sagre: Tonno (Agropoli), Fico Bianco (Pisciotta), Alici (Pisciotta), Mozzarella (Paestum)
Feste: Sant'Erasmo (Agropoli/giu), Madonna della Neve (Pollica/ago)

━━━ GOLFO POLICASTRO + ENTROTERRA (min 8 eventi) ━━━
Sapri, Santa Marina, Vibonati, San Giovanni a Piro, Torre Orsaia, Vallo della Lucania, Rofrano, Morigerati

Stagionalità ${periodoLabel}: ${stagione}
Varietà categorie: min 6 Sagra · 3 Religioso · 4 Musica · 3 Sport · 3 Natura · 2 Mercato · 2 Cultura · 2 Salute

Rispondi SOLO con l'array JSON:
${schemaJSON}`;

  let eventiGrezzi: object[] = [];
  try {
    const risposta = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
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
        testo: pulito.slice(0, 300),
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
  // FASE 3 — Salvataggio (reset atomico oppure aggiunta con deduplicazione)
  // ══════════════════════════════════════════════════════════════════════════
  let salvati: number;
  if (reset && eventiGrezzi.length > 0) {
    // Reset atomico: sostituisce tutto il DB ora che l'estrazione è riuscita
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    salvati = await sostituisciEventiKV(eventiGrezzi as any[]);
    log.push(`  → Reset eseguito: ${salvati} eventi sostituiti nel KV`);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    salvati = await aggiungiEventiKV(eventiGrezzi as any[]);
    log.push(`  → ${salvati} eventi nuovi aggiunti in KV`);
  }

  return NextResponse.json({
    ok: true,
    trovati: eventiGrezzi.length,
    nuovi: salvati,
    sitiFunzionanti,
    haContestoReale: haContesto,
    reset,
    data: oggi,
    log,
  });
}
