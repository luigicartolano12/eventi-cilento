import Link from "next/link";
import { Evento, formattaData } from "@/lib/events";
import { fotoFallbackEvento } from "@/lib/foto-fallback";
import {
  IcoMapPin, IcoCalendar, IcoClock, IcoPlay,
  IcoWheelchair, IcoParking, IcoPaw, IcoBooking,
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura, IcoSalute,
} from "./icons";

const categoriaColore: Record<string, string> = {
  Sagra:     "#ea580c",
  Musica:    "#9333ea",
  Cultura:   "#2563eb",
  Sport:     "#16a34a",
  Religioso: "#d97706",
  Mercato:   "#db2777",
  Natura:    "#059669",
  Salute:    "#be185d",
};

const gradientCategoria: Record<string, string> = {
  Sagra:     "linear-gradient(160deg, #fb923c 0%, #fbbf24 100%)",
  Musica:    "linear-gradient(160deg, #a855f7 0%, #818cf8 100%)",
  Cultura:   "linear-gradient(160deg, #3b82f6 0%, #22d3ee 100%)",
  Sport:     "linear-gradient(160deg, #22c55e 0%, #10b981 100%)",
  Religioso: "linear-gradient(160deg, #facc15 0%, #f59e0b 100%)",
  Mercato:   "linear-gradient(160deg, #f472b6 0%, #fb7185 100%)",
  Natura:    "linear-gradient(160deg, #059669 0%, #14b8a6 100%)",
  Salute:    "linear-gradient(160deg, #ec4899 0%, #f43f5e 100%)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura, Salute: IcoSalute,
};

export function EventCard({ evento }: { evento: Evento }) {
  const { servizi } = evento;
  const imgSrc = evento.immagine || fotoFallbackEvento(evento.categoria, evento.id);
  const IcoCategoria = IconeCategoria[evento.categoria];
  const colore = categoriaColore[evento.categoria] ?? "#16a34a";

  // Luogo da mostrare: "Luogo, Comune" oppure solo "Comune"
  const luogoLabel = evento.luogo && evento.luogo !== evento.comune
    ? `${evento.luogo}, ${evento.comune}`
    : evento.comune;

  return (
    <Link
      href={`/events/${evento.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.07)",
      }}
    >
      {/* ── Copertina ── */}
      <div
        className="relative overflow-hidden flex items-center justify-center shrink-0"
        style={{ height: 176, background: gradientCategoria[evento.categoria] }}
      >
        {/* Foto (reale o fallback per categoria) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={evento.titolo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Se anche il fallback non carica, mostra l'icona categoria
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Overlay sfumato basso */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.26) 100%)" }}
        />

        {/* Pill categoria + gratuito — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
            style={{ background: colore + "dd", backdropFilter: "blur(6px)" }}
          >
            {evento.categoria}
          </span>
          {servizi.ingressoGratuito && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(220,252,231,0.92)", color: "#166534" }}
            >
              Gratis
            </span>
          )}
        </div>

        {/* Badge video — top right */}
        {evento.video && (
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white z-10"
            style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)" }}
          >
            <IcoPlay size={9} /> Video
          </span>
        )}
      </div>

      {/* ── Corpo ── */}
      <div className="flex flex-col gap-2.5 px-4 pt-4 pb-4 flex-1">

        {/* Titolo — gerarchia principale */}
        <h2
          className="text-[15px] font-bold text-stone-900 leading-snug tracking-tight"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </h2>

        {/* Meta: data · orario */}
        <div className="flex items-center gap-2.5 text-[12px] text-stone-400 font-medium">
          <span className="inline-flex items-center gap-1">
            <IcoCalendar size={10} className="text-stone-300" />
            <span className="capitalize">
              {formattaData(evento.data)}
              {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
            </span>
          </span>
          {evento.orario && (
            <>
              <span className="text-stone-200">·</span>
              <span className="inline-flex items-center gap-1">
                <IcoClock size={10} className="text-stone-300" />
                {evento.orario}
              </span>
            </>
          )}
        </div>

        {/* Meta: luogo */}
        <span className="inline-flex items-center gap-1 text-[12px] text-stone-400 font-medium">
          <IcoMapPin size={10} className="text-stone-300" />
          {luogoLabel}
        </span>

        {/* Badge accessibilità — compatti, solo icone */}
        {(servizi.accessibileDisabili || servizi.parcheggio || servizi.petFriendly || servizi.prenotazioneRichiesta) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {servizi.accessibileDisabili && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                title="Accessibile ai disabili"
                style={{ background: "#dbeafe", color: "#1e40af" }}
              >
                <IcoWheelchair size={11} />
              </span>
            )}
            {servizi.parcheggio && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                title="Parcheggio disponibile"
                style={{ background: "#f5f3ef", color: "#78716c" }}
              >
                <IcoParking size={11} />
              </span>
            )}
            {servizi.petFriendly && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                title="Pet friendly"
                style={{ background: "#fef3c7", color: "#92400e" }}
              >
                <IcoPaw size={11} />
              </span>
            )}
            {servizi.prenotazioneRichiesta && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#dbeafe", color: "#1e40af" }}
              >
                Prenota
              </span>
            )}
          </div>
        )}

        {/* Separatore + CTA */}
        <div
          className="mt-auto pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid #f5f3ef" }}
        >
          <span
            className="text-[12px] font-semibold"
            style={{ color: colore }}
          >
            Scopri l&apos;evento
          </span>
          <span className="text-stone-300 text-base leading-none">›</span>
        </div>
      </div>
    </Link>
  );
}
