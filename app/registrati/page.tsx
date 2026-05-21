"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIE } from "@/lib/events";
import {
  UtenteProfile,
  salvaUtente,
  getUtente,
  PUNTI_AZIONI,
} from "@/lib/utente";
import { IcoArrowLeft, IcoCheck } from "@/app/components/icons";

type Step = 1 | 2 | 3 | "done";

const COMUNI_CILENTO = [
  "Agropoli", "Capaccio-Paestum", "Centola-Palinuro", "Celle di Bulgheria",
  "Controne", "Novi Velia", "Pisciotta", "Teggiano", "Vallo della Lucania",
  "Ascea", "Camerota", "Castellabate", "Laureana Cilento", "Montecorice",
  "Pollica", "Serre", "Stella Cilento", "Altavilla Silentina", "Sapri",
];

export default function PaginaRegistrazione() {
  const router = useRouter();

  useEffect(() => {
    if (getUtente()) router.replace("/profilo");
  }, [router]);

  const [step, setStep] = useState<Step>(1);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [comune, setComune] = useState("");
  const [interessi, setInteressi] = useState<string[]>([]);
  const [notificheEmail, setNotificheEmail] = useState(true);
  const [notifichePush, setNotifichePush] = useState(false);
  const [notificheCategorie, setNotificheCategorie] = useState<string[]>([]);

  function toggleInteresse(cat: string) {
    setInteressi((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleNotificaCategoria(cat: string) {
    setNotificheCategorie((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function completa() {
    const puntiBase = PUNTI_AZIONI.REGISTRAZIONE;
    const puntiProfilo = interessi.length > 0 ? PUNTI_AZIONI.PROFILO_COMPLETO : 0;
    const profilo: UtenteProfile = {
      nome, cognome, email, comune,
      interessi,
      notificheEmail,
      notifichePush,
      notificheCategorie,
      punti: puntiBase + puntiProfilo,
      recensioniInviate: 0,
      eventiProposti: 0,
      dataRegistrazione: new Date().toISOString(),
    };
    salvaUtente(profilo);
    setStep("done");
  }

  const step1Valido = nome.trim() && cognome.trim() && email.includes("@");

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10" style={{ background: "#f5f3ef" }}>
      <div className="w-full max-w-md">

        {/* Back link */}
        {step !== "done" && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold mb-6 transition-opacity hover:opacity-70"
            style={{ color: "#65a30d" }}
          >
            <IcoArrowLeft size={14} />
            Torna alla home
          </Link>
        )}

        {/* Card */}
        <div
          className="bg-white rounded-3xl p-7"
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.06)",
          }}
        >
          {step !== "done" && (
            <>
              {/* Indicatore step */}
              <div className="flex items-center gap-2 mb-7">
                {([1, 2, 3] as const).map((s) => (
                  <div
                    key={s}
                    className="h-1.5 flex-1 rounded-full transition-all"
                    style={{
                      background:
                        step >= s ? "#a3e635" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>

              {/* Etichetta step */}
              <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: "#78716c" }}>
                {step === 1 && "Passo 1 di 3"}
                {step === 2 && "Passo 2 di 3"}
                {step === 3 && "Passo 3 di 3"}
              </p>
            </>
          )}

          {/* ── Step 1: Dati personali ── */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-black text-stone-900 mb-1">Crea il tuo profilo</h1>
              <p className="text-sm text-stone-400 mb-7">Unisciti alla community del Cilento</p>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-black uppercase tracking-wide text-stone-400 block mb-1.5">Nome</label>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Mario"
                      className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none"
                      style={{ background: "#f5f3ef" }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-black uppercase tracking-wide text-stone-400 block mb-1.5">Cognome</label>
                    <input
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      placeholder="Rossi"
                      className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none"
                      style={{ background: "#f5f3ef" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide text-stone-400 block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@esempio.it"
                    className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none"
                    style={{ background: "#f5f3ef" }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide text-stone-400 block mb-1.5">
                    Il tuo comune <span className="normal-case font-normal">(opzionale)</span>
                  </label>
                  <select
                    value={comune}
                    onChange={(e) => setComune(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none appearance-none"
                    style={{ background: "#f5f3ef" }}
                  >
                    <option value="">Seleziona comune…</option>
                    {COMUNI_CILENTO.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!step1Valido}
                className="mt-7 w-full py-4 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#a3e635", color: "#14532d" }}
              >
                Avanti →
              </button>

              <p className="text-center text-xs text-stone-400 mt-4">
                Hai già un account?{" "}
                <Link href="/profilo" className="font-bold" style={{ color: "#16a34a" }}>
                  Accedi al profilo
                </Link>
              </p>
            </>
          )}

          {/* ── Step 2: Interessi ── */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-black text-stone-900 mb-1">I tuoi interessi</h1>
              <p className="text-sm text-stone-400 mb-6">
                Scegli le categorie di eventi che preferisci. Ti mostreremo ciò che ti piace di più.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-7">
                {CATEGORIE.map((cat) => {
                  const attivo = interessi.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleInteresse(cat)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left border-0 cursor-pointer transition-all"
                      style={
                        attivo
                          ? { background: "#a3e635", color: "#14532d" }
                          : { background: "#f5f3ef", color: "#44403c" }
                      }
                    >
                      {attivo && <IcoCheck size={14} />}
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-opacity hover:opacity-70"
                  style={{ background: "#f5f3ef", color: "#78716c" }}
                >
                  ← Indietro
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3.5 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "#a3e635", color: "#14532d" }}
                >
                  Avanti →
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Notifiche ── */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-black text-stone-900 mb-1">Notifiche eventi</h1>
              <p className="text-sm text-stone-400 mb-6">
                Come vuoi essere avvisato quando escono nuovi eventi del Cilento?
              </p>

              {/* Canali notifica */}
              <div className="flex flex-col gap-3 mb-6">
                <NotificaToggle
                  label="Notifiche via Email"
                  descrizione="Ricevi una email con i nuovi eventi in programma"
                  value={notificheEmail}
                  onChange={setNotificheEmail}
                />
                <NotificaToggle
                  label="Notifiche Push"
                  descrizione="Avvisi in tempo reale sul browser o dispositivo"
                  value={notifichePush}
                  onChange={setNotifichePush}
                />
              </div>

              {/* Categorie di interesse per notifiche */}
              {(notificheEmail || notifichePush) && (
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-wide text-stone-400 mb-3">
                    Avvisami per
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIE.map((cat) => {
                      const attivo = notificheCategorie.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleNotificaCategoria(cat)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all"
                          style={
                            attivo
                              ? { background: "#1a3529", color: "#a3e635" }
                              : { background: "#f5f3ef", color: "#78716c" }
                          }
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-opacity hover:opacity-70"
                  style={{ background: "#f5f3ef", color: "#78716c" }}
                >
                  ← Indietro
                </button>
                <button
                  onClick={completa}
                  className="flex-[2] py-3.5 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "#a3e635", color: "#14532d" }}
                >
                  Completa registrazione
                </button>
              </div>
            </>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#dcfce7" }}
              >
                <IcoCheck size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-stone-900 mb-2">
                Benvenuto/a, {nome}! 👋
              </h1>
              <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                Il tuo profilo è pronto. Hai guadagnato{" "}
                <span className="font-black text-green-600">
                  {PUNTI_AZIONI.REGISTRAZIONE + (interessi.length > 0 ? PUNTI_AZIONI.PROFILO_COMPLETO : 0)} punti
                </span>{" "}
                per la registrazione!
              </p>

              {/* Punti guadagnati */}
              <div className="flex flex-col gap-2 text-sm text-left rounded-2xl p-4 mb-6" style={{ background: "#f5f3ef" }}>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Registrazione completata</span>
                  <span className="font-black text-green-600">+{PUNTI_AZIONI.REGISTRAZIONE} pt</span>
                </div>
                {interessi.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Profilo con interessi</span>
                    <span className="font-black text-green-600">+{PUNTI_AZIONI.PROFILO_COMPLETO} pt</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/profilo")}
                className="w-full py-4 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90 mb-3"
                style={{ background: "#a3e635", color: "#14532d" }}
              >
                Vai al tuo profilo
              </button>
              <Link
                href="/"
                className="block text-sm font-semibold text-stone-400 hover:text-stone-600 transition-colors"
              >
                Torna agli eventi →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function NotificaToggle({
  label,
  descrizione,
  value,
  onChange,
}: {
  label: string;
  descrizione: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-3 p-4 rounded-2xl text-left border-0 cursor-pointer transition-all w-full"
      style={
        value
          ? { background: "#f0fdf4", border: "1.5px solid #bbf7d0" }
          : { background: "#f5f3ef", border: "1.5px solid transparent" }
      }
    >
      <div>
        <p className="text-sm font-bold text-stone-800">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{descrizione}</p>
      </div>
      <div
        className="shrink-0 transition-colors"
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value ? "#a3e635" : "#e5e7eb",
          position: "relative",
        }}
      >
        <div
          className="absolute bg-white rounded-full shadow transition-transform"
          style={{
            width: 16,
            height: 16,
            top: 3,
            transform: value ? "translateX(21px)" : "translateX(3px)",
          }}
        />
      </div>
    </button>
  );
}
