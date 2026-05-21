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

const gradientCategoria: Record<string, string> = {
  Sagra: "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica: "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura: "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport: "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso: "linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato: "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura: "linear-gradient(135deg, #059669, #14b8a6)",
};

const emojiCategoria: Record<string, string> = {
  Sagra: "🍽️",
  Musica: "🎶",
  Cultura: "🏛️",
  Sport: "🏆",
  Religioso: "⛪",
  Mercato: "🛍️",
  Natura: "🌿",
};

function ServiziStrip({ evento }: { evento: Evento }) {
  const { servizi } = evento;
  const voci: { icona: string; etichetta: string; colore: string }[] = [];

  if (servizi.accessibileDisabili)
    voci.push({ icona: "♿", etichetta: "Accessibile", colore: "bg-blue-50 text-blue-700" });
  if (servizi.parcheggio)
    voci.push({ icona: "🅿️", etichetta: "Parcheggio", colore: "bg-stone-100 text-stone-600" });
  if (servizi.ingressoGratuito)
    voci.push({ icona: "✓", etichetta: "Gratuito", colore: "bg-green-50 text-green-700" });
  else if (servizi.costoDescrizione)
    voci.push({ icona: "🎟️", etichetta: servizi.costoDescrizione, colore: "bg-amber-50 text-amber-700" });
  else
    voci.push({ icona: "🎟️", etichetta: "A pagamento", colore: "bg-amber-50 text-amber-700" });
  if (servizi.prenotazioneRichiesta)
    voci.push({ icona: "📋", etichetta: "Prenotazione", colore: "bg-violet-50 text-violet-700" });
  if (servizi.petFriendly)
    voci.push({ icona: "🐾", etichetta: "Pet friendly", colore: "bg-stone-100 text-stone-600" });

  return (
    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
      {voci.map((v) => (
        <span
          key={v.etichetta}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${v.colore}`}
        >
          <span>{v.icona}</span>
          <span>{v.etichetta}</span>
        </span>
      ))}
    </div>
  );
}

export function EventCard({ evento }: { evento: Evento }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col hover:shadow-md transition-shadow overflow-hidden">
      {/* Area immagine / video */}
      <div
        className="relative h-40 flex items-center justify-center"
        style={{ background: gradientCategoria[evento.categoria] }}
      >
        {evento.immagine ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.immagine}
            alt={evento.titolo}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-80">{emojiCategoria[evento.categoria]}</span>
        )}
        {evento.video && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            ▶ Video
          </span>
        )}
      </div>

      {/* Corpo della card */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${coloriCategoria[evento.categoria]}`}>
            {evento.categoria}
          </span>
          <span className="text-xs text-stone-400 whitespace-nowrap pt-1">
            {formattaData(evento.data)}
            {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
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

        <ServiziStrip evento={evento} />

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
