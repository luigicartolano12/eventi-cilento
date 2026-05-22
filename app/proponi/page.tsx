import Link from "next/link";
import { IcoArrowLeft, IcoSend } from "@/app/components/icons";
import { ProponiForm } from "./ProponiForm";
import { ProponiPunti } from "@/app/components/ProponiPunti";

export const metadata = {
  title: "Proponi un evento — Eventi Cilento",
  description: "Invia il tuo evento: sagre, concerti, mostre, sport. Pubblicazione gratuita entro 48 ore.",
};

export default function ProponiEvento() {
  return (
    <main className="flex-1" style={{ background: "#f5f3ef" }}>
      <div className="max-w-2xl mx-auto px-4 py-10 pb-24">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
          style={{ color: "#65a30d" }}
        >
          <IcoArrowLeft size={14} />
          Torna alla lista
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "#16a34a" }}
          >
            <IcoSend size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900">Proponi un evento</h1>
            <p className="text-sm mt-0.5" style={{ color: "#78716c" }}>
              Compilalo tu, lo pubblichiamo noi — gratis
            </p>
          </div>
        </div>

        <div
          className="bg-white rounded-3xl p-6 sm:p-8"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}
        >
          <ProponiForm />
        </div>

        <ProponiPunti />
      </div>
    </main>
  );
}
