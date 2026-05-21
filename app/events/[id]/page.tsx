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

  if (!evento) notFound();

  const { servizi } = evento;

  return (
    <main className="flex-1 bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium mb-8"
        >
          ← Torna alla lista
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Immagine / banner */}
          <div
            className="relative h-52 sm:h-64 flex items-center justify-center"
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
              <span className="text-7xl opacity-75">
                {emojiCategoria[evento.categoria]}
              </span>
            )}
          </div>

          <div className="p-7 sm:p-10">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${coloriCategoria[evento.categoria]}`}
            >
              {evento.categoria}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mt-5 mb-5 leading-tight">
              {evento.titolo}
            </h1>

            {/* Dettagli pratici */}
            <div className="flex flex-col gap-2 mb-6 text-stone-600 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="capitalize">
                  {formattaData(evento.data)}
                  {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
                </span>
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

            {/* Descrizione */}
            <p className="text-stone-700 leading-relaxed mb-8">
              {evento.descrizione}
            </p>

            {/* Video */}
            {evento.video && (
              <a
                href={evento.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors mb-8"
              >
                ▶ Guarda il video
              </a>
            )}

            {/* Sezione servizi */}
            <div className="border-t border-stone-100 pt-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
                Informazioni pratiche
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoBox
                  icona={servizi.accessibileDisabili ? "♿" : "🚫"}
                  etichetta="Accessibilità"
                  valore={servizi.accessibileDisabili ? "Accessibile" : "Non accessibile"}
                  positivo={servizi.accessibileDisabili}
                />
                <InfoBox
                  icona="🅿️"
                  etichetta="Parcheggio"
                  valore={servizi.parcheggio ? "Disponibile" : "Non disponibile"}
                  positivo={servizi.parcheggio}
                />
                <InfoBox
                  icona={servizi.ingressoGratuito ? "✓" : "€"}
                  etichetta="Ingresso"
                  valore={
                    servizi.ingressoGratuito
                      ? "Gratuito"
                      : servizi.costoDescrizione ?? "A pagamento"
                  }
                  positivo={servizi.ingressoGratuito}
                />
                <InfoBox
                  icona="📋"
                  etichetta="Prenotazione"
                  valore={servizi.prenotazioneRichiesta ? "Richiesta" : "Non richiesta"}
                  positivo={!servizi.prenotazioneRichiesta}
                />
                <InfoBox
                  icona="🐾"
                  etichetta="Pet friendly"
                  valore={servizi.petFriendly ? "Sì" : "No"}
                  positivo={servizi.petFriendly}
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

function InfoBox({
  icona,
  etichetta,
  valore,
  positivo,
}: {
  icona: string;
  etichetta: string;
  valore: string;
  positivo: boolean;
}) {
  return (
    <div className="bg-stone-50 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-lg">{icona}</span>
      <span className="text-xs text-stone-400 font-medium">{etichetta}</span>
      <span
        className={`text-sm font-semibold ${positivo ? "text-stone-800" : "text-stone-400"}`}
      >
        {valore}
      </span>
    </div>
  );
}
