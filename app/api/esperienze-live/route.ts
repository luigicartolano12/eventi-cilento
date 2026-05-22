/**
 * /api/esperienze-live — Legge le esperienze dinamiche dal KV (Redis)
 * GET → restituisce array EsperienzaDinamica[]
 */

import { NextResponse } from "next/server";
import { getEsperienzeKV } from "@/lib/kv-store";

export const runtime = "nodejs";
export const revalidate = 0; // mai cacheare — sempre fresco

export async function GET() {
  try {
    const esperienze = await getEsperienzeKV();
    return NextResponse.json(esperienze);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
