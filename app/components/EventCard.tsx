import Link from "next/link";
import { Evento, formattaData } from "@/lib/events";

const coloriCategoria: Record<string, string> = {
  Sagra: "bg-orange-100 text-orange-800",
  Musica: "bg-purple-100 text-purple-800",
  Cultura: "bg-blue-100 text-blue-800",
  Sport: "bg-green-100 text-green-800",
  Religioso: "bg-yellow-100 text-yellow-800",
  Mercato: "bg-pink-100 text-pink-800",
  Natura: "bg-emerald-100 text-emerald-800",
};

export function EventCard({ evento }: { evento: Evento }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${coloriCategoria[evento.categoria]}`}
          >
            {evento.categoria}
          </span>
          <span className="text-xs text-stone-400 whitespace-nowrap pt-1">
            {formattaData(evento.data)}
          </span>
        </div>

        <h2 className="text-base font-bold text-stone-800 leading-snug">
          {evento.titolo}
        </h2>

        <p className="text-sm text-stone-500">
          {evento.comune}
          {evento.orario && <span> · ore {evento.orario}</span>}
        </p>

        <p className="text-sm text-stone-600 leading-relaxed flex-1">
          {evento.descrizioneBreve}
        </p>

        <Link
          href={`/events/${evento.id}`}
          className="mt-1 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          Scopri di più →
        </Link>
      </div>
    </div>
  );
}
