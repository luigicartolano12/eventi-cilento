import Link from "next/link";
import { notFound } from "next/navigation";
import { eventi, formattaData } from "@/lib/events";

const coloriCategoria: Record<string, string> = {
  Sagra: "bg-orange-100 text-orange-800",
  Musica: "bg-purple-100 text-purple-800",
  Cultura: "bg-blue-100 text-blue-800",
  Sport: "bg-green-100 text-green-800",
  Religioso: "bg-yellow-100 text-yellow-800",
  Mercato: "bg-pink-100 text-pink-800",
  Natura: "bg-emerald-100 text-emerald-800",
};

export function generateStaticParams() {
  return eventi.map((e) => ({ id: e.id }));
}

export default async function PaginaEvento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = eventi.find((e) => e.id === id);

  if (!evento) {
    notFound();
  }

  return (
    <main className="flex-1 bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium mb-8"
        >
          ← Torna alla lista
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7 sm:p-10">
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${coloriCategoria[evento.categoria]}`}
          >
            {evento.categoria}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mt-5 mb-5 leading-tight">
            {evento.titolo}
          </h1>

          <div className="flex flex-col gap-2 mb-8 text-stone-600 text-sm">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span className="capitalize">{formattaData(evento.data)}</span>
              {evento.orario && <span>· ore {evento.orario}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>
                {evento.luogo}, {evento.comune}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>Pubblico: {evento.pubblico}</span>
            </div>
          </div>

          <p className="text-stone-700 leading-relaxed">{evento.descrizione}</p>
        </article>
      </div>
    </main>
  );
}
