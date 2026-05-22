/**
 * /api/eventi-live — Restituisce gli eventi dal database KV
 * Usato dalla home page per mostrare gli eventi trovati dall'AI.
 */

import { NextResponse } from "next/server";
import { getEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";

export async function GET() {
  const eventi = await getEventiKV();
  return NextResponse.json(eventi, {
    headers: {
      // Nessuna cache CDN — i dati cambiano ogni giorno col cron
      "Cache-Control": "no-store",
    },
  });
}
