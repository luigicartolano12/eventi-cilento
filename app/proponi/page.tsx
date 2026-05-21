import Link from "next/link";
import { IcoArrowLeft, IcoSend, IcoCalendar, IcoMapPin, IcoMail } from "@/app/components/icons";
import { ProponiPunti } from "@/app/components/ProponiPunti";

export const metadata = {
  title: "Proponi un evento — Eventi Cilento",
};

const campi = [
  { icona: <IcoCalendar size={16} />, titolo: "Nome e data dell'evento", desc: "Titolo, data di inizio e fine (se plurigiorno), orario" },
  { icona: <IcoMapPin size={16} />, titolo: "Luogo", desc: "Indirizzo, comune e provincia" },
  { icona: <IcoSend size={16} />, titolo: "Descrizione", desc: "Breve descrizione (2-3 righe) e testo completo" },
  { icona: <IcoMail size={16} />, titolo: "Contatto organizzatore", desc: "Nome, telefono, email e sito web (se disponibile)" },
];

export default function ProponiEvento() {
  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
          style={{ color: "#65a30d" }}
        >
          <IcoArrowLeft size={14} />
          Torna alla lista
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
          {/* Banner */}
          <div
            className="h-36 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a3529, #065f46)" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#a3e635" }}
              >
                <IcoSend size={28} className="text-green-900" />
              </div>
              <p className="text-white font-black text-xl">Proponi un evento</p>
            </div>
          </div>

          <div className="p-6 sm:p-9 flex flex-col gap-7">

            <div>
              <h1 className="text-xl font-black text-stone-900 mb-2">
                Il tuo evento nel Cilento?
              </h1>
              <p className="text-stone-600 leading-relaxed text-[15px]">
                Se organizzi un evento nella zona del Cilento e Vallo di Diano,
                scrivici e lo pubblichiamo gratuitamente sulla piattaforma.
                Sagre, concerti, mostre, sport, mercati: tutte le categorie sono benvenute.
              </p>
            </div>

            {/* Cosa inviare */}
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
                Cosa includere nell&apos;email
              </p>
              <div className="flex flex-col gap-3">
                {campi.map((c) => (
                  <div
                    key={c.titolo}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: "#f5f3ef" }}
                  >
                    <span className="text-green-600 mt-0.5 shrink-0">{c.icona}</span>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{c.titolo}</p>
                      <p className="text-sm text-stone-500 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "#f0fdf4" }}
            >
              <p className="text-sm text-stone-600 leading-relaxed">
                Inviaci un&apos;email con tutte le informazioni e risponderemo entro 48 ore.
                La pubblicazione è completamente gratuita.
              </p>
              <a
                href="mailto:eventi@cilento.it?subject=Proposta%20evento%20Cilento"
                className="inline-flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base transition-opacity hover:opacity-90"
                style={{ background: "#a3e635", color: "#14532d" }}
              >
                <IcoMail size={18} />
                Scrivi a eventi@cilento.it
              </a>
              <p className="text-xs text-stone-400 text-center">
                Risposta garantita entro 48 ore lavorative
              </p>
            </div>

          </div>
        </article>

        <ProponiPunti />
      </div>
    </main>
  );
}
