import Link from "next/link";
import { notFound } from "next/navigation";
import { eventi, formattaData } from "@/lib/events";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoMapPin, IcoCalendar, IcoClock, IcoUsers,
  IcoWheelchair, IcoParking, IcoCheck, IcoTicket, IcoCalendarCheck, IcoPaw, IcoXCircle,
  IcoPhone, IcoMail, IcoGlobe,
  IcoArrowLeft, IcoPlay,
} from "@/app/components/icons";
import { ShareButton } from "@/app/components/ShareButton";

const gradientCategoria: Record<string, string> = {
  Sagra:    "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:   "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:  "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:    "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso:"linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:  "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:   "linear-gradient(135deg, #059669, #14b8a6)",
};

const testoCategoriaColore: Record<string, string> = {
  Sagra: "#9a3412", Musica: "#6b21a8", Cultura: "#1e40af",
  Sport: "#166534", Religioso: "#92400e", Mercato: "#9d174d", Natura: "#065f46",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura,
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
  const IcoCategoria = IconeCategoria[evento.categoria];

  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold mb-6 transition-opacity hover:opacity-70"
          style={{ color: "#65a30d" }}
        >
          <IcoArrowLeft size={14} />
          Torna alla lista
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
          {/* Banner */}
          <div
            className="relative h-56 sm:h-72 flex items-center justify-center"
            style={{ background: gradientCategoria[evento.categoria] }}
          >
            {evento.immagine ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={evento.immagine} alt={evento.titolo}
                className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <IcoCategoria size={72} strokeWidth={1.1} className="text-white opacity-60" />
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm"
                style={{ color: testoCategoriaColore[evento.categoria] }}
              >
                {evento.categoria}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-9 flex flex-col gap-7">

            {/* Titolo */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                  {evento.titolo}
                </h1>
                <ShareButton titolo={evento.titolo} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-stone-500">
                  <IcoCalendar size={14} className="text-stone-400 shrink-0" />
                  <span className="capitalize">
                    {formattaData(evento.data)}
                    {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
                  </span>
                  {evento.orario && (
                    <>
                      <IcoClock size={14} className="text-stone-400 shrink-0 ml-1" />
                      <span>ore {evento.orario}</span>
                    </>
                  )}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${evento.luogo}, ${evento.comune}, Salerno, Campania, Italia`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <IcoMapPin size={14} className="text-stone-400 shrink-0" />
                  {evento.luogo}, {evento.comune}
                </a>
                <span className="inline-flex items-center gap-2 text-sm text-stone-500">
                  <IcoUsers size={14} className="text-stone-400 shrink-0" />
                  Pubblico: {evento.pubblico}
                </span>
              </div>
            </div>

            {/* Video */}
            {evento.video && (
              <a href={evento.video} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white w-fit transition-opacity hover:opacity-80"
                style={{ background: "#1a3529" }}
              >
                <IcoPlay size={14} />
                Guarda il video
              </a>
            )}

            {/* ── Informazioni pratiche ── */}
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                Informazioni pratiche
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <InfoBox
                  icona={servizi.accessibileDisabili
                    ? <IcoWheelchair size={18} />
                    : <IcoXCircle size={18} />}
                  etichetta="Accessibilità"
                  valore={servizi.accessibileDisabili ? "Accessibile" : "Non accessibile"}
                  positivo={servizi.accessibileDisabili}
                />
                <InfoBox
                  icona={<IcoParking size={18} />}
                  etichetta="Parcheggio"
                  valore={servizi.parcheggio ? "Disponibile" : "Non disponibile"}
                  positivo={servizi.parcheggio}
                />
                <InfoBox
                  icona={servizi.ingressoGratuito ? <IcoCheck size={18} /> : <IcoTicket size={18} />}
                  etichetta="Ingresso"
                  valore={servizi.ingressoGratuito ? "Gratuito" : servizi.costoDescrizione ?? "A pagamento"}
                  positivo={servizi.ingressoGratuito}
                />
                <InfoBox
                  icona={<IcoCalendarCheck size={18} />}
                  etichetta="Prenotazione"
                  valore={servizi.prenotazioneRichiesta ? "Richiesta" : "Non richiesta"}
                  positivo={!servizi.prenotazioneRichiesta}
                />
                <InfoBox
                  icona={<IcoPaw size={18} />}
                  etichetta="Pet friendly"
                  valore={servizi.petFriendly ? "Sì" : "No"}
                  positivo={servizi.petFriendly}
                />
              </div>
            </div>

            {/* Descrizione */}
            <p className="text-stone-600 leading-relaxed text-[15px]">
              {evento.descrizione}
            </p>

            {/* ── Biglietti ── */}
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                Biglietti
              </p>
              {servizi.ingressoGratuito && !biglietteria?.url ? (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold"
                  style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>
                  <IcoCheck size={20} />
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
                      <span className="font-bold text-stone-700">{biglietteria.prezzo}</span>
                      {biglietteria.note && (
                        <span className="block text-xs text-stone-400 mt-0.5">{biglietteria.note}</span>
                      )}
                    </p>
                  )}
                  <a href={biglietteria.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base transition-opacity hover:opacity-90"
                    style={{ background: "#a3e635", color: "#14532d" }}
                  >
                    <IcoTicket size={18} />
                    Acquista il biglietto
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {biglietteria?.prezzo && (
                    <p className="text-sm text-stone-500">
                      <span className="font-bold text-stone-700">{biglietteria.prezzo}</span>
                      {biglietteria.note && (
                        <span className="block text-xs text-stone-400 mt-0.5">{biglietteria.note}</span>
                      )}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm"
                    style={{ background: "#f5f3ef", color: "#a8a29e" }}>
                    <IcoTicket size={16} />
                    Biglietteria online non ancora disponibile
                  </div>
                </div>
              )}
            </div>

            {/* ── Contatto organizzatore ── */}
            {contatto && (
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                  Contatta l&apos;organizzatore
                </p>
                <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#f0fdf4" }}>
                  {contatto.nome && (
                    <p className="font-black text-stone-800 text-base">{contatto.nome}</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {contatto.telefono && (
                      <a href={`tel:${contatto.telefono}`}
                        className="flex items-center gap-3 text-sm font-semibold group transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: "#dcfce7" }}>
                          <IcoPhone size={15} />
                        </span>
                        {contatto.telefono}
                      </a>
                    )}
                    {contatto.email && (
                      <a href={`mailto:${contatto.email}`}
                        className="flex items-center gap-3 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: "#dcfce7" }}>
                          <IcoMail size={15} />
                        </span>
                        {contatto.email}
                      </a>
                    )}
                    {contatto.sito && (
                      <a href={contatto.sito} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "#166534" }}
                      >
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: "#dcfce7" }}>
                          <IcoGlobe size={15} />
                        </span>
                        Sito web ufficiale →
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

function InfoBox({ icona, etichetta, valore, positivo }: {
  icona: React.ReactNode; etichetta: string; valore: string; positivo: boolean;
}) {
  return (
    <div className="rounded-xl p-3.5 flex flex-col gap-2" style={{ background: "#f5f3ef" }}>
      <span className={positivo ? "text-green-600" : "text-stone-400"}>{icona}</span>
      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">{etichetta}</span>
      <span className={`text-sm font-bold ${positivo ? "text-stone-800" : "text-stone-400"}`}>
        {valore}
      </span>
    </div>
  );
}
