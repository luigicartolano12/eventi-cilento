import Link from "next/link";
import { notFound } from "next/navigation";
import { eventi, formattaData } from "@/lib/events";

const gradientCategoria: Record<string, string> = {
  Sagra:    "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:   "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:  "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:    "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso:"linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:  "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:   "linear-gradient(135deg, #059669, #14b8a6)",
};

const emojiCategoria: Record<string, string> = {
  Sagra: "🍽️", Musica: "🎶", Cultura: "🏛️", Sport: "🏆",
  Religioso: "⛪", Mercato: "🛍️", Natura: "🌿",
};

const testoCategoriaColore: Record<string, string> = {
  Sagra: "#9a3412", Musica: "#6b21a8", Cultura: "#1e40af",
  Sport: "#166534", Religioso: "#92400e", Mercato: "#9d174d", Natura: "#065f46",
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

  const { servizi, contatto, biglietteria } = evento;

  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors"
          style={{ color: "#16a34a" }}
        >
          ← Torna alla lista
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
          {/* Banner */}
          <div
            className="relative h-56 sm:h-72 flex items-center justify-center"
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
              <span className="text-8xl opacity-60 select-none">
                {emojiCategoria[evento.categoria]}
              </span>
            )}
            <div className="absolute bottom-4 left-4">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90"
                style={{ color: testoCategoriaColore[evento.categoria] }}
              >
                {evento.categoria}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-9 flex flex-col gap-6">
            {/* Titolo e info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-4">
                {evento.titolo}
              </h1>
              <div className="flex flex-col gap-2 text-sm text-stone-500">
                <span>
                  📅 <span className="capitalize">
                    {formattaData(evento.data)}
                    {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
                  </span>
                  {evento.orario && <span> · ore {evento.orario}</span>}
                </span>
                <span>📍 {evento.luogo}, {evento.comune}</span>
                <span>👥 Pubblico: {evento.pubblico}</span>
              </div>
            </div>

            {/* Descrizione */}
            <p className="text-stone-700 leading-relaxed text-[15px]">
              {evento.descrizione}
            </p>

            {/* Video */}
            {evento.video && (
              <a
                href={evento.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white w-fit transition-opacity hover:opacity-90"
                style={{ background: "#1a3529" }}
              >
                ▶ Guarda il video
              </a>
            )}

            {/* Informazioni pratiche */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                Informazioni pratiche
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                  icona={servizi.ingressoGratuito ? "✓" : "🎟️"}
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

            {/* ─── BIGLIETTERIA ─── */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                Biglietti
              </p>
              {servizi.ingressoGratuito && !biglietteria?.url ? (
                <div
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold"
                  style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
                >
                  <span className="text-xl">✓</span>
                  <div>
                    <p>Evento gratuito</p>
                    <p className="font-normal text-xs mt-0.5" style={{ color: "#4ade80" }}>
                      Nessun biglietto richiesto
                    </p>
                  </div>
                </div>
              ) : biglietteria?.url ? (
                <div className="flex flex-col gap-3">
                  {biglietteria.prezzo && (
                    <p className="text-sm text-stone-500">
                      💶 {biglietteria.prezzo}
                      {biglietteria.note && (
                        <span className="block text-xs text-stone-400 mt-0.5">
                          {biglietteria.note}
                        </span>
                      )}
                    </p>
                  )}
                  <a
                    href={biglietteria.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-base transition-opacity hover:opacity-90"
                    style={{ background: "#ea580c" }}
                  >
                    🎟️ Acquista il biglietto
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {biglietteria?.prezzo && (
                    <p className="text-sm text-stone-500">
                      💶 {biglietteria.prezzo}
                      {biglietteria.note && (
                        <span className="block text-xs text-stone-400 mt-0.5">
                          {biglietteria.note}
                        </span>
                      )}
                    </p>
                  )}
                  <div
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm"
                    style={{ background: "#f5f3ef", color: "#a8a29e" }}
                  >
                    🎟️ Biglietteria online non ancora disponibile
                  </div>
                </div>
              )}
            </div>

            {/* ─── CONTATTO ORGANIZZATORE ─── */}
            {contatto && (
              <div className="border-t border-stone-100 pt-5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                  Contatta l&apos;organizzatore
                </p>
                <div
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: "#f0fdf4" }}
                >
                  {contatto.nome && (
                    <p className="font-bold text-stone-800">{contatto.nome}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {contatto.telefono && (
                      <a
                        href={`tel:${contatto.telefono}`}
                        className="flex items-center gap-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="text-lg">📞</span>
                        {contatto.telefono}
                      </a>
                    )}
                    {contatto.email && (
                      <a
                        href={`mailto:${contatto.email}`}
                        className="flex items-center gap-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="text-lg">✉️</span>
                        {contatto.email}
                      </a>
                    )}
                    {contatto.sito && (
                      <a
                        href={contatto.sito}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="text-lg">🌐</span>
                        Sito web →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

function InfoBox({
  icona, etichetta, valore, positivo,
}: {
  icona: string; etichetta: string; valore: string; positivo: boolean;
}) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "#f5f3ef" }}>
      <span className="text-lg">{icona}</span>
      <span className="text-[11px] text-stone-400 font-medium">{etichetta}</span>
      <span className={`text-sm font-semibold ${positivo ? "text-stone-800" : "text-stone-400"}`}>
        {valore}
      </span>
    </div>
  );
}
