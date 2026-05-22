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
      // Cache di 10 minuti — aggiorna abbastanza spesso senza sovraccaricare il DB
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
    },
  });
}
