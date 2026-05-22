/**
 * POST /api/eventi-admin → crea un evento direttamente nel KV (usato dall'admin)
 * DELETE /api/eventi-admin?id=... → rimuove un evento dal KV
 */
import { NextResponse } from "next/server";
import { aggiungiEventiKV, getEventiKV, svuotaEventiKV } from "@/lib/kv-store";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function GET() {
  const eventi = await getEventiKV();
  const ordinati = [...eventi].sort((a, b) => a.data.localeCompare(b.data));
  return NextResponse.json(ordinati);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titolo, data, comune, categoria, descrizione } = body;

    if (!titolo || !data || !comune || !categoria || !descrizione) {
      return NextResponse.json(
        { errore: "Campi obbligatori: titolo, data, comune, categoria, descrizione" },
        { status: 400 }
      );
    }

    const aggiunti = await aggiungiEventiKV([{
      titolo: String(titolo).trim(),
      data: String(data),
      dataFine: body.dataFine || undefined,
      orario: body.orario || undefined,
      comune: String(comune).trim(),
      luogo: body.luogo ? String(body.luogo).trim() : String(comune),
      categoria: String(categoria) as never,
      descrizione: String(descrizione).trim(),
      gratuito: Boolean(body.gratuito),
      sorgente: body.linkEsterno || undefined,
    }]);

    return NextResponse.json({ ok: true, aggiunti });
  } catch (err) {
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      // Se nessun ID → svuota tutto (reset)
      await svuotaEventiKV();
      return NextResponse.json({ ok: true, azione: "reset" });
    }

    // Rimuove solo l'evento con quell'ID
    const eventi = await getEventiKV();
    const filtrati = eventi.filter((e) => e.id !== id);
    await kv.set("eventi:pubblicati", filtrati);
    return NextResponse.json({ ok: true, rimasti: filtrati.length });
  } catch (err) {
    return NextResponse.json(
      { errore: err instanceof Error ? err.message : "Errore" },
      { status: 500 }
    );
  }
}
