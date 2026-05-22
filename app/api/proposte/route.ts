/**
 * GET  /api/proposte  → lista tutte le proposte (solo admin con chiave)
 * POST /api/proposte  → invia una proposta (pubblica, da /proponi)
 */
import { NextResponse } from "next/server";
import { getProposte, aggiungiProposta } from "@/lib/kv-proposte";

export const runtime = "nodejs";

const ADMIN_KEY = process.env.TRIGGER_KEY ?? "cilento2025";

export async function GET(request: Request) {
  // GET è riservato all'admin panel
  const url = new URL(request.url);
  const chiave = url.searchParams.get("chiave");
  const auth = request.headers.get("authorization");
  if (chiave !== ADMIN_KEY && auth !== `Bearer ${ADMIN_KEY}`) {
    return NextResponse.json({ errore: "Non autorizzato" }, { status: 401 });
  }
  const proposte = await getProposte();
  // Ordina per data invio, più recenti prima
  const ordinate = [...proposte].sort(
    (a, b) => new Date(b.dataInvio).getTime() - new Date(a.dataInvio).getTime()
  );
  return NextResponse.json(ordinate);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titolo, data, comune, categoria, descrizione, organizzatore } = body;

    if (!titolo || !data || !comune || !categoria || !descrizione || !organizzatore) {
      return NextResponse.json(
        { errore: "Campi obbligatori mancanti: titolo, data, comune, categoria, descrizione, organizzatore" },
        { status: 400 }
      );
    }

    const proposta = await aggiungiProposta({
      titolo: String(titolo).trim(),
      data: String(data),
      dataFine: body.dataFine ? String(body.dataFine) : undefined,
      orario: body.orario ? String(body.orario) : undefined,
      luogo: String(body.luogo ?? "").trim() || String(comune),
      comune: String(comune).trim(),
      categoria: String(categoria),
      descrizione: String(descrizione).trim(),
      gratuito: Boolean(body.gratuito),
      prezzo: body.prezzo ? String(body.prezzo).trim() : undefined,
      linkEsterno: body.linkEsterno ? String(body.linkEsterno).trim() : undefined,
      organizzatore: String(organizzatore).trim(),
      telefono: body.telefono ? String(body.telefono).trim() : undefined,
      email: body.email ? String(body.email).trim() : undefined,
      nota: body.nota ? String(body.nota).trim() : undefined,
    });

    return NextResponse.json({ ok: true, id: proposta.id });
  } catch (err) {
    console.error("[proposte POST]", err);
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore interno" },
      { status: 500 }
    );
  }
}
