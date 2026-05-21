import Link from "next/link";
import { Evento, formattaData } from "@/lib/events";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoMapPin, IcoCalendar, IcoClock,
  IcoWheelchair, IcoParking, IcoCheck, IcoTicket, IcoCalendarCheck, IcoPaw, IcoPlay,
} from "./icons";

const testoCategoriaColore: Record<string, string> = {
  Sagra:    "#9a3412",
  Musica:   "#6b21a8",
  Cultura:  "#1e40af",
  Sport:    "#166534",
  Religioso:"#92400e",
  Mercato:  "#9d174d",
  Natura:   "#065f46",
};

const gradientCategoria: Record<string, string> = {
  Sagra:    "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:   "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:  "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:    "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso:"linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:  "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:   "linear-gradient(135deg, #059669, #14b8a6)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura,
};

function ServiziStrip({ evento }: { evento: Evento }) {
  const { servizi } = evento;

  type Voce = { icona: React.ReactNode; etichetta: string };
  const voci: Voce[] = [];

  if (servizi.accessibileDisabili)
    voci.push({ icona: <IcoWheelchair size={11} />, etichetta: "Accessibile" });
  if (servizi.parcheggio)
    voci.push({ icona: <IcoParking size={11} />, etichetta: "Parcheggio" });
  if (servizi.ingressoGratuito)
    voci.push({ icona: <IcoCheck size={11} />, etichetta: "Gratuito" });
  else if (servizi.costoDescrizione)
    voci.push({ icona: <IcoTicket size={11} />, etichetta: servizi.costoDescrizione });
  else
    voci.push({ icona: <IcoTicket size={11} />, etichetta: "A pagamento" });
  if (servizi.prenotazioneRichiesta)
    voci.push({ icona: <IcoCalendarCheck size={11} />, etichetta: "Prenotazione" });
  if (servizi.petFriendly)
    voci.push({ icona: <IcoPaw size={11} />, etichetta: "Pet friendly" });

  return (
    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
      {voci.map((v) => (
        <span
          key={v.etichetta}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium"
        >
          {v.icona}
          <span>{v.etichetta}</span>
        </span>
      ))}
    </div>
  );
}

export function EventCard({ evento }: { evento: Evento }) {
  const IcoCategoria = IconeCategoria[evento.categoria];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Area visuale */}
      <div
        className="relative h-44 flex items-center justify-center"
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
          <IcoCategoria size={44} strokeWidth={1.25} className="text-white opacity-70" />
        )}

        {/* Badge categoria */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm"
            style={{ color: testoCategoriaColore[evento.categoria] }}
          >
            {evento.categoria}
          </span>
          {evento.video && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-black/50 text-white">
              <IcoPlay size={10} />
              Video
            </span>
          )}
        </div>
      </div>

      {/* Corpo */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-[15px] font-bold text-stone-900 leading-snug">
          {evento.titolo}
        </h2>

        {/* Metadati */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span className="inline-flex items-center gap-1 text-xs text-stone-400">
            <IcoMapPin size={11} />
            {evento.comune}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-stone-400">
            <IcoCalendar size={11} />
            {formattaData(evento.data)}
            {evento.dataFine && ` – ${formattaData(evento.dataFine)}`}
          </span>
          {evento.orario && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              <IcoClock size={11} />
              {evento.orario}
            </span>
          )}
        </div>

        <p className="text-sm text-stone-600 leading-relaxed flex-1 mt-1">
          {evento.descrizioneBreve}
        </p>

        <ServiziStrip evento={evento} />

        <Link
          href={`/events/${evento.id}`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold transition-colors"
          style={{ color: "#65a30d" }}
        >
          Scopri di più
          <span className="text-base leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}
