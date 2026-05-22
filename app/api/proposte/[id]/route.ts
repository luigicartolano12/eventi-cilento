/**
 * PATCH /api/proposte/[id]  → aggiorna stato (approva/rifiuta) o campi
 * DELETE /api/proposte/[id] → elimina
 */
import { NextResponse } from "next/server";
import { aggiornaProposta, eliminaProposta, getProposte } from "@/lib/kv-proposte";
import { aggiungiEventiKV } from "@/lib/kv-store";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Se l'azione è "approva", sposta l'evento anche nel KV pubblicati
    if (body.stato === "approvata") {
      const proposte = await getProposte();
      const proposta = proposte.find((p) => p.id === id);
      if (proposta) {
        await aggiungiEventiKV([{
          titolo: proposta.titolo,
          data: proposta.data,
          dataFine: proposta.dataFine,
          orario: proposta.orario,
          comune: proposta.comune,
          luogo: proposta.luogo,
          categoria: proposta.categoria as never,
          descrizione: proposta.descrizione,
          gratuito: proposta.gratuito,
          sorgente: proposta.linkEsterno,
        }]);
      }
    }

    await aggiornaProposta(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await eliminaProposta(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
