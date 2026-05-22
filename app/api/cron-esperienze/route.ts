/**
 * /api/cron-esperienze — Ricerca approfondita di esperienze nel Cilento e Vallo di Diano
 *
 * ARCHITETTURA:
 *   Fase 0 – Scraping parallelo di ~30 sorgenti specializzate (booking, associazioni, privati)
 *   Fase 1 – Claude Haiku estrae esperienze strutturate dal contesto
 *   Fase 2 – Salvataggio in KV con deduplicazione
 *
 * Completa in ~25-40 secondi (tutte le sorgenti in parallelo, timeout 7s each).
 * Supporta ?reset=1 per sostituire tutto il database esperienze.
 *
 * Triggered: manualmente dall'admin panel
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aggiungiEsperienzeKV, sostituisciEsperienzeKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SORGENTI ESPERIENZE (~30 siti specializzati)
// ─────────────────────────────────────────────────────────────────────────────
const SORGENTI = [

  // ══ BOOKING ESPERIENZE (aggregatori internazionali) ══════════════════════
  { url: "https://www.civitatis.com/it/cilento/",                    label: "Civitatis Cilento" },
  { url: "https://www.getyourguide.it/cilento-l89043/",             label: "GetYourGuide Cilento" },
  { url: "https://www.tripadvisor.it/Attractions-g192745-Activities-Cilento_National_Park.html", label: "TripAdvisor Cilento" },
  { url: "https://www.viator.com/it/Cilento/d50765-ttd",            label: "Viator Cilento" },
  { url: "https://www.airbnb.it/s/Cilento--Salerno/experiences",    label: "Airbnb Experiences Cilento" },

  // ══ TURISMO E PORTALI LOCALI ═════════════════════════════════════════════
  { url: "https://www.visitcilento.it/cosa-fare/",                  label: "VisitCilento — cosa fare" },
  { url: "https://www.cilentodiet.com/it/cosa-fare/",               label: "CilentoDiet — attività" },
  { url: "https://www.cilentoit.com/cosa-fare/",                    label: "CilentoIT — attività" },
  { url: "https://parcoregionalecilento.it/it/attivita/",           label: "Parco Cilento — attività" },
  { url: "https://www.campaniatourism.it/it/cilento/",              label: "CampaniaTourism Cilento" },
  { url: "https://www.infocilento.it/category/esperienze/",         label: "infoCilento esperienze" },

  // ══ AVVENTURA, TREKKING E OUTDOOR ═══════════════════════════════════════
  { url: "https://www.cainapoli.it/aree-escursionistiche/cilento/", label: "CAI Napoli — Cilento" },
  { url: "https://www.sentieridicampania.it/cilento/",              label: "Sentieri Campania" },
  { url: "https://www.parks.it/parco.nazionale.cilento/attivita.php", label: "Parks.it Cilento" },
  { url: "https://www.mtbcilento.it/",                              label: "MTB Cilento (bici)" },
  { url: "https://www.cilentotrekking.it/",                         label: "CilentoTrekking" },

  // ══ MARE — IMMERSIONI, KAYAK, BARCHE ════════════════════════════════════
  { url: "https://www.cilentodiving.it/",                           label: "Cilento Diving" },
  { url: "https://www.kayakcilento.it/",                            label: "Kayak Cilento" },
  { url: "https://www.scuolavelalegambiente.it/cilento/",           label: "Scuola Vela Legambiente" },
  { url: "https://www.barcharound.it/cilento/",                     label: "Barca Around Cilento" },

  // ══ GASTRONOMIA E AGRITURISMO ════════════════════════════════════════════
  { url: "https://www.agriturismoparcocilento.it/",                 label: "Agriturismo Parco Cilento" },
  { url: "https://www.agricilento.it/",                             label: "AgriCilento" },
  { url: "https://www.slowfood.it/comunita/cilento/",               label: "Slow Food Cilento" },
  { url: "https://www.cilentowine.it/",                             label: "Cilento Wine (cantine)" },

  // ══ SITI CULTURALI E VISITE GUIDATE ═════════════════════════════════════
  { url: "https://www.museopaestum.beniculturali.it/",              label: "Museo Paestum" },
  { url: "https://www.certosadipadula.it/",                         label: "Certosa Padula UNESCO" },
  { url: "https://www.grottedipertosa-auletta.it/",                 label: "Grotte Pertosa-Auletta" },
  { url: "https://www.grottadicastelcivita.com/",                   label: "Grotta Castelcivita" },

  // ══ BENESSERE E TERMALE ══════════════════════════════════════════════════
  { url: "https://www.termedicalongone.it/",                        label: "Terme Casal Velino" },
  { url: "https://www.cilentowellness.it/",                         label: "Cilento Wellness" },

  // ══ VALLO DI DIANO — ESPERIENZE SPECIFICHE ══════════════════════════════
  { url: "https://www.vallodidiano.it/cosa-fare/",                  label: "ValloDiDiano — attività" },
  { url: "https://www.padulaturismo.it/",                           label: "Padula Turismo" },

];

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
      .slice(0, 3000);
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

  const log: string[] = [];

  if (reset) {
    log.push("ℹ️ Reset richiesto — verrà eseguito DOPO l'estrazione");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 0 — Scraping parallelo
  // ══════════════════════════════════════════════════════════════════════════
  log.push(`Fase 0: scraping ${SORGENTI.length} sorgenti in parallelo...`);
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

  const haContesto = contesto.length > 200;

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 1 — Estrazione con Haiku
  // ══════════════════════════════════════════════════════════════════════════
  log.push("Fase 1: estrazione AI (haiku)...");

  const schemaJSON = `[{
  "titolo": "nome dell'esperienza",
  "categoria": "Avventura|Mare|Gastronomia|Cultura|Benessere|Sport|Natura",
  "comune": "comune principale",
  "luogo": "nome del posto specifico",
  "durata": "es. 2 ore / mezza giornata / 1 giorno",
  "difficolta": "Facile|Media|Difficile",
  "prezzo": "es. €35 a persona / Gratuito / Da €20",
  "descrizione": "2-3 frasi descrittive dell'esperienza",
  "linkEsterno": "https://sito-ufficiale.it",
  "facebook": "https://facebook.com/... (se trovato)",
  "instagram": "https://instagram.com/... (se trovato)",
  "telefono": "+39...",
  "email": "info@...",
  "organizzatore": "Nome azienda/associazione/guida",
  "tags": ["tag1","tag2","tag3"],
  "sorgente": "https://url-fonte"
}]`;

  const prompt = haContesto
    ? `Analizza questo testo estratto da ${funzionanti} siti specializzati in esperienze nel Cilento e Vallo di Diano.

TESTO ESTRATTO:
${contesto.slice(0, 18000)}

━━━ REGOLE FONDAMENTALI ━━━
⛔ NON inventare esperienze. Estrai SOLO esperienze con nome e fornitore verificabili nel testo.
✅ Includi esperienze di OGNI tipo: trekking, immersioni, kayak, visite guidate, cooking class, degustazioni, agriturismi, termali, climbing, canyoning, birdwatching, equitazione, artigianato, laboratori...
✅ Per ogni esperienza includi se disponibile: prezzo, durata, difficoltà, contatti, URL sito/social
✅ Priorità Vallo di Diano: Certosa Padula, Grotte Pertosa, Grotta Castelcivita, trekking Monti Alburni
✅ Priorità Cilento costiero: immersioni, kayak, barche, snorkeling, trekking sul mare
✅ Tags descrittivi: usa parole come "famiglia", "avventura", "gastronomia", "UNESCO", "guidato", etc.

Rispondi SOLO con l'array JSON delle esperienze REALI trovate:
${schemaJSON}`
    : `I siti web non hanno restituito dati utili.
Non inventare esperienze.
Restituisci un array JSON vuoto: []`;

  try {
    const risposta = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 6000,
      system: "Rispondi SOLO con un array JSON valido. Nessun markdown, nessun testo prima o dopo. Solo [ ... ].",
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
    const esperienze = JSON.parse(match[0]) as any[];

    let salvate: number;
    if (reset && esperienze.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      salvate = await sostituisciEsperienzeKV(esperienze as any[]);
      log.push(`  → Reset eseguito: ${salvate} esperienze sostituite nel KV`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      salvate = await aggiungiEsperienzeKV(esperienze as any[]);
      log.push(`  → ${esperienze.length} esperienze trovate, ${salvate} nuove aggiunte`);
    }

    return NextResponse.json({
      ok: true,
      trovate: esperienze.length,
      nuove: salvate,
      funzionanti,
      sorgenti: SORGENTI.length,
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
