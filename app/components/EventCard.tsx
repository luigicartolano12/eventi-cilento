import Link from "next/link";
import { Evento, formattaData } from "@/lib/events";
import {
  IcoMapPin, IcoCalendar, IcoClock, IcoPlay,
  IcoCheck, IcoWheelchair, IcoParking, IcoPaw,
} from "./icons";

const testoCategoriaColore: Record<string, string> = {
  Sagra:    "#ea580c",
  Musica:   "#9333ea",
  Cultura:  "#2563eb",
  Sport:    "#16a34a",
  Religioso:"#d97706",
  Mercato:  "#db2777",
  Natura:   "#059669",
};

const gradientCategoria: Record<string, string> = {
  Sagra:    "linear-gradient(160deg, #fb923c 0%, #fbbf24 100%)",
  Musica:   "linear-gradient(160deg, #a855f7 0%, #818cf8 100%)",
  Cultura:  "linear-gradient(160deg, #3b82f6 0%, #22d3ee 100%)",
  Sport:    "linear-gradient(160deg, #22c55e 0%, #10b981 100%)",
  Religioso:"linear-gradient(160deg, #facc15 0%, #f59e0b 100%)",
  Mercato:  "linear-gradient(160deg, #f472b6 0%, #fb7185 100%)",
  Natura:   "linear-gradient(160deg, #059669 0%, #14b8a6 100%)",
};

/**
 * Keyword primarie (2 parole) per categoria evento.
 * Usate con loremflickr /all → la foto deve contenere ENTRAMBE le keyword.
 */
const kwCategoria: Record<string, string> = {
  Sagra:    "food,festival",
  Musica:   "concert,music",
  Cultura:  "ruins,columns",
  Sport:    "sport,outdoor",
  Religioso:"church,procession",
  Mercato:  "market,stalls",
  Natura:   "nature,trail",
  Salute:   "health,wellness",
};

/** Numero coerente da ID stringa (lock loremflickr) */
function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 9999 + 1;
}

/** loremflickr /all: richiede ENTRAMBE le keyword → molto più coerente */
function placeholderImg(id: string, categoria: string) {
  const kw = kwCategoria[categoria] ?? "italy,landscape";
  return `https://loremflickr.com/600/300/${kw}/all?lock=${hashId(id)}`;
}

export function EventCard({ evento }: { evento: Evento }) {
  const { servizi } = evento;
  const imgSrc = evento.immagine || placeholderImg(evento.id, evento.categoria);

  const hasBadge =
    servizi.ingressoGratuito ||
    servizi.accessibileDisabili ||
    servizi.parcheggio ||
    servizi.petFriendly;

  return (
    <div
      className="group flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#fff",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Immagine — cliccabile verso la scheda ── */}
      <Link
        href={`/events/${evento.id}`}
        className="block relative overflow-hidden"
        style={{ height: 200, background: gradientCategoria[evento.categoria] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={evento.titolo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // fallback: mostra icona categoria se l'immagine non carica
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Overlay sfumato in basso */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Badge video */}
        {evento.video && (
          <span
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
            style={{
              background: "rgba(0,0,0,0.38)",
              backdropFilter: "blur(8px)",
            }}
          >
            <IcoPlay size={9} />
            Video
          </span>
        )}
      </Link>

      {/* ── Corpo ── */}
      <div className="flex flex-col gap-1.5 px-5 pt-4 pb-5 flex-1">

        {/* Categoria */}
        <span
          className="text-[11px] font-black uppercase tracking-widest"
          style={{ color: testoCategoriaColore[evento.categoria] }}
        >
          {evento.categoria}
        </span>

        {/* Titolo */}
        <h2 className="text-[17px] font-bold text-black leading-snug tracking-tight">
          {evento.titolo}
        </h2>

        {/* Data + Orario + Comune */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          <span className="inline-flex items-center gap-1 text-[13px] text-stone-400 font-medium">
            <IcoCalendar size={11} className="text-stone-300" />
            <span className="capitalize">
              {formattaData(evento.data)}
              {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
            </span>
          </span>
          {evento.orario && (
            <span className="inline-flex items-center gap-1 text-[13px] text-stone-400 font-medium">
              <IcoClock size={11} className="text-stone-300" />
              {evento.orario}
            </span>
          )}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${evento.luogo}, ${evento.comune}, Salerno, Campania, Italia`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[13px] text-stone-400 font-medium hover:text-stone-600 transition-colors"
          >
            <IcoMapPin size={11} className="text-stone-300" />
            {evento.comune}
          </a>
        </div>

        {/* ── Badge servizi ── */}
        {hasBadge && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {servizi.ingressoGratuito && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                <IcoCheck size={9} />
                Gratuito
              </span>
            )}
            {servizi.accessibileDisabili && (
              <span
                className="inline-flex items-center justify-center rounded-full"
                title="Accessibile ai disabili"
                style={{
                  width: 22,
                  height: 22,
                  background: "#dbeafe",
                  color: "#1e40af",
                }}
              >
                <IcoWheelchair size={12} />
              </span>
            )}
            {servizi.parcheggio && (
              <span
                className="inline-flex items-center justify-center rounded-full"
                title="Parcheggio disponibile"
                style={{
                  width: 22,
                  height: 22,
                  background: "#f5f3ef",
                  color: "#78716c",
                }}
              >
                <IcoParking size={12} />
              </span>
            )}
            {servizi.petFriendly && (
              <span
                className="inline-flex items-center justify-center rounded-full"
                title="Pet friendly"
                style={{
                  width: 22,
                  height: 22,
                  background: "#fef3c7",
                  color: "#92400e",
                }}
              >
                <IcoPaw size={12} />
              </span>
            )}
          </div>
        )}

        {/* CTA Apple-style */}
        <Link
          href={`/events/${evento.id}`}
          className="mt-auto pt-4 flex items-center justify-between group/cta"
        >
          <span className="text-[13px] font-semibold" style={{ color: "#16a34a" }}>
            Scopri di più
          </span>
          <span className="text-[18px] text-stone-300 font-light leading-none">›</span>
        </Link>
      </div>
    </div>
  );
}
