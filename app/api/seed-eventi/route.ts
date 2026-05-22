/**
 * /api/seed-eventi — Carica eventi reali verificati direttamente nel KV
 *
 * Non usa l'AI — legge lib/seed-eventi-2026.ts con eventi trovati da fonti reali:
 * eventinelcilento.it, ilcilentano.it, residencesandomenico.info, valloweb.com
 *
 * Supporta ?reset=1 per sostituire (safe: prima carica, poi sostituisce)
 * GET ?chiave=cilento2025&reset=1
 */

import { NextResponse } from "next/server";
import { aggiungiEventiKV, sostituisciEventiKV } from "@/lib/kv-store";
import { EVENTI_REALI_2026 } from "@/lib/seed-eventi-2026";

export const runtime = "nodejs";

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

  const eventi = EVENTI_REALI_2026 as unknown as Parameters<typeof aggiungiEventiKV>[0];

  let salvati: number;
  if (reset) {
    salvati = await sostituisciEventiKV(eventi);
  } else {
    salvati = await aggiungiEventiKV(eventi);
  }

  return NextResponse.json({
    ok: true,
    totaleDisponibili: EVENTI_REALI_2026.length,
    salvati,
    reset,
    messaggio: reset
      ? `Database sostituito con ${salvati} eventi reali verificati (maggio–settembre 2026)`
      : `Aggiunti ${salvati} nuovi eventi reali (${EVENTI_REALI_2026.length - salvati} già presenti)`,
    fonti: [
      "eventinelcilento.it",
      "ilcilentano.it",
      "residencesandomenico.info",
      "valloweb.com",
      "ilcilentano.it/sagre-cilento",
    ],
  });
}
