"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIE } from "@/lib/events";
import {
  getUtente,
  salvaUtente,
  eliminaUtente,
  getLivello,
  getLivelloSuccessivo,
  LIVELLI,
  PUNTI_AZIONI,
  type UtenteProfile,
} from "@/lib/utente";
import {
  IcoArrowLeft, IcoCheck, IcoCalendar, IcoMapPin, IcoMail,
} from "@/app/components/icons";

type Tab = "profilo" | "preferenze" | "punti";

export default function PaginaProfilo() {
  const router = useRouter();
  const [utente, setUtente] = useState<UtenteProfile | null>(null);
  const [tab, setTab] = useState<Tab>("profilo");
  const [editMode, setEditMode] = useState(false);

  // Campi edit
  const [editNome, setEditNome] = useState("");
  const [editCognome, setEditCognome] = useState("");
  const [editComune, setEditComune] = useState("");
  const [editInteressi, setEditInteressi] = useState<string[]>([]);
  const [editNotEmail, setEditNotEmail] = useState(false);
  const [editNotPush, setEditNotPush] = useState(false);
  const [editNotCat, setEditNotCat] = useState<string[]>([]);

  useEffect(() => {
    const u = getUtente();
    if (!u) {
      router.replace("/registrati");
      return;
    }
    setUtente(u);
    setEditNome(u.nome);
    setEditCognome(u.cognome);
    setEditComune(u.comune);
    setEditInteressi(u.interessi);
    setEditNotEmail(u.notificheEmail);
    setEditNotPush(u.notifichePush);
    setEditNotCat(u.notificheCategorie);
  }, [router]);

  if (!utente) return null;

  const livello = getLivello(utente.punti);
  const livelloSucc = getLivelloSuccessivo(utente.punti);
  const progressoPercent = livelloSucc
    ? Math.min(
        100,
        ((utente.punti - livello.minPunti) / (livelloSucc.minPunti - livello.minPunti)) * 100
      )
    : 100;

  const iniziali = `${utente.nome[0]}${utente.cognome[0]}`.toUpperCase();
  const dataIscrizione = new Date(utente.dataRegistrazione).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function salvaProfilo() {
    if (!utente) return;
    const aggiornato: UtenteProfile = {
      ...utente,
      nome: editNome,
      cognome: editCognome,
      comune: editComune,
      interessi: editInteressi,
      notificheEmail: editNotEmail,
      notifichePush: editNotPush,
      notificheCategorie: editNotCat,
    };
    salvaUtente(aggiornato);
    setUtente(aggiornato);
    setEditMode(false);
  }

  function toggleInteresse(cat: string) {
    setEditInteressi((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleNotCat(cat: string) {
    setEditNotCat((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function logout() {
    eliminaUtente();
    router.push("/");
  }

  return (
    <main className="flex-1 pb-16" style={{ background: "#f5f3ef" }}>
      {/* ── Header profilo ── */}
      <div
        style={{ background: "linear-gradient(175deg, #0a1f12 0%, #1a3529 100%)" }}
        className="px-5 pt-10 pb-16"
      >
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
            style={{ color: "#4ade80" }}
          >
            <IcoArrowLeft size={14} />
            Torna alla home
          </Link>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
              style={{ background: "#a3e635", color: "#0f2318" }}
            >
              {iniziali}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-white leading-tight truncate">
                {utente.nome} {utente.cognome}
              </h1>
              <p className="text-sm truncate" style={{ color: "#86efac" }}>{utente.email}</p>
              {utente.comune && (
                <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>
                  📍 {utente.comune}
                </p>
              )}
            </div>
            {/* Livello badge */}
            <div
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-black"
              style={{ background: livello.sfondo, color: livello.colore }}
            >
              {livello.emoji} {livello.nome}
            </div>
          </div>

          {/* Punti e progress */}
          <div className="mt-5 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-white">{utente.punti} pt</span>
              {livelloSucc && (
                <span className="text-xs font-semibold" style={{ color: "#86efac" }}>
                  {livelloSucc.minPunti - utente.punti} pt al livello {livelloSucc.nome}
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressoPercent}%`, background: "#a3e635" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        {/* ── Tab navigation ── */}
        <div
          className="bg-white rounded-2xl p-1 flex gap-1 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)" }}
        >
          {(["profilo", "preferenze", "punti"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setEditMode(false); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all capitalize"
              style={
                tab === t
                  ? { background: "#1a3529", color: "#a3e635" }
                  : { background: "transparent", color: "#78716c" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab: Profilo ── */}
        {tab === "profilo" && (
          <div className="flex flex-col gap-4">
            <Sezione
              titolo="Dati personali"
              azione={editMode ? undefined : { label: "Modifica", onClick: () => setEditMode(true) }}
            >
              {editMode ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <CampoEdit label="Nome" value={editNome} onChange={setEditNome} />
                    <CampoEdit label="Cognome" value={editCognome} onChange={setEditCognome} />
                  </div>
                  <CampoEdit label="Comune" value={editComune} onChange={setEditComune} />
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold border-0 cursor-pointer"
                      style={{ background: "#f5f3ef", color: "#78716c" }}
                    >
                      Annulla
                    </button>
                    <button
                      onClick={salvaProfilo}
                      className="flex-[2] py-3 rounded-2xl text-sm font-black border-0 cursor-pointer"
                      style={{ background: "#a3e635", color: "#14532d" }}
                    >
                      Salva modifiche
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <InfoRiga icona={<IcoMail size={14} />} label="Email" valore={utente.email} />
                  {utente.comune && (
                    <InfoRiga icona={<IcoMapPin size={14} />} label="Comune" valore={utente.comune} />
                  )}
                  <InfoRiga
                    icona={<IcoCalendar size={14} />}
                    label="Iscritto dal"
                    valore={dataIscrizione}
                  />
                </div>
              )}
            </Sezione>

            <Sezione titolo="Interessi">
              {utente.interessi.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {utente.interessi.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "#dcfce7", color: "#166534" }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-400">Nessun interesse selezionato.</p>
              )}
            </Sezione>

            <Sezione titolo="Attività">
              <div className="grid grid-cols-2 gap-3">
                <StatBox numero={utente.recensioniInviate} label="Recensioni scritte" />
                <StatBox numero={utente.eventiProposti} label="Eventi proposti" />
                <StatBox numero={utente.punti} label="Punti totali" />
                <StatBox numero={utente.interessi.length} label="Interessi" />
              </div>
            </Sezione>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full py-3.5 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-opacity hover:opacity-70 mt-2"
              style={{ background: "#fef2f2", color: "#dc2626" }}
            >
              Esci dal profilo
            </button>
          </div>
        )}

        {/* ── Tab: Preferenze ── */}
        {tab === "preferenze" && (
          <div className="flex flex-col gap-4">
            <Sezione titolo="Notifiche">
              <div className="flex flex-col gap-3">
                <PreferenzaToggle
                  label="Email"
                  descrizione="Nuovi eventi e aggiornamenti via email"
                  value={editNotEmail}
                  onChange={(v) => { setEditNotEmail(v); }}
                />
                <PreferenzaToggle
                  label="Push"
                  descrizione="Notifiche in tempo reale sul dispositivo"
                  value={editNotPush}
                  onChange={(v) => { setEditNotPush(v); }}
                />
              </div>
            </Sezione>

            <Sezione titolo="Avvisami per queste categorie">
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIE.map((cat) => {
                  const attivo = editNotCat.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleNotCat(cat)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all"
                      style={
                        attivo
                          ? { background: "#1a3529", color: "#a3e635" }
                          : { background: "#f5f3ef", color: "#78716c" }
                      }
                    >
                      {attivo && "✓ "}{cat}
                    </button>
                  );
                })}
              </div>
            </Sezione>

            <Sezione titolo="Interessi da aggiornare">
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIE.map((cat) => {
                  const attivo = editInteressi.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleInteresse(cat)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all"
                      style={
                        attivo
                          ? { background: "#a3e635", color: "#14532d" }
                          : { background: "#f5f3ef", color: "#78716c" }
                      }
                    >
                      {attivo && "✓ "}{cat}
                    </button>
                  );
                })}
              </div>
            </Sezione>

            <button
              onClick={salvaProfilo}
              className="w-full py-4 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "#a3e635", color: "#14532d" }}
            >
              Salva preferenze
            </button>
          </div>
        )}

        {/* ── Tab: Punti ── */}
        {tab === "punti" && (
          <div className="flex flex-col gap-4">
            {/* Livello attuale */}
            <Sezione titolo="Il tuo livello">
              <div className="flex flex-col gap-3">
                {LIVELLI.map((liv) => {
                  const raggiunto = utente.punti >= liv.minPunti;
                  const corrente = liv.nome === livello.nome;
                  return (
                    <div
                      key={liv.nome}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{
                        background: corrente ? liv.sfondo : "#f5f3ef",
                        opacity: raggiunto ? 1 : 0.45,
                      }}
                    >
                      <span className="text-xl">{liv.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: corrente ? liv.colore : "#44403c" }}>
                          {liv.nome}
                          {corrente && (
                            <span className="ml-2 text-[10px] font-black uppercase tracking-wide">← attuale</span>
                          )}
                        </p>
                        <p className="text-xs text-stone-400">da {liv.minPunti} punti</p>
                      </div>
                      {raggiunto && (
                        <IcoCheck size={16} className="text-green-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Sezione>

            {/* Come guadagnare punti */}
            <Sezione titolo="Come guadagnare punti">
              <div className="flex flex-col gap-2.5">
                <AzioneConPunti
                  label="Registrazione completata"
                  punti={PUNTI_AZIONI.REGISTRAZIONE}
                  completata
                />
                <AzioneConPunti
                  label="Profilo con interessi"
                  punti={PUNTI_AZIONI.PROFILO_COMPLETO}
                  completata={utente.interessi.length > 0}
                />
                <AzioneConPunti
                  label="Scrivi una recensione verificata"
                  punti={PUNTI_AZIONI.RECENSIONE}
                  completata={utente.recensioniInviate > 0}
                  descrizione="Vai ad un evento e lascia la tua opinione"
                />
                <AzioneConPunti
                  label="Proponi un evento"
                  punti={PUNTI_AZIONI.EVENTO_PROPOSTO}
                  completata={utente.eventiProposti > 0}
                  descrizione="Segnala un evento che non è ancora nella lista"
                  link="/proponi"
                  linkLabel="Proponi →"
                />
                <AzioneConPunti
                  label="Accesso giornaliero"
                  punti={PUNTI_AZIONI.LOGIN_GIORNALIERO}
                  completata={false}
                  descrizione="Ogni giorno che visiti l'app"
                  ripetibile
                />
              </div>
            </Sezione>

            {/* Proponi evento shortcut */}
            <Link
              href="/proponi"
              className="flex items-center justify-between p-5 rounded-2xl transition-opacity hover:opacity-90"
              style={{ background: "#1a3529", color: "white" }}
            >
              <div>
                <p className="font-black text-base">Proponi un evento</p>
                <p className="text-sm mt-0.5" style={{ color: "#86efac" }}>
                  Guadagna +{PUNTI_AZIONI.EVENTO_PROPOSTO} punti
                </p>
              </div>
              <span className="text-2xl text-stone-400">›</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Componenti helper ─────────────────────────────────────────────────────────

function Sezione({
  titolo,
  children,
  azione,
}: {
  titolo: string;
  children: React.ReactNode;
  azione?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="bg-white rounded-3xl p-5"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">{titolo}</p>
        {azione && (
          <button
            onClick={azione.onClick}
            className="text-xs font-bold border-0 bg-transparent cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "#16a34a" }}
          >
            {azione.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoRiga({
  icona,
  label,
  valore,
}: {
  icona: React.ReactNode;
  label: string;
  valore: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-stone-300">{icona}</span>
      <span className="text-xs text-stone-400 w-16 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-stone-700 flex-1 truncate">{valore}</span>
    </div>
  );
}

function StatBox({ numero, label }: { numero: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3.5 rounded-2xl" style={{ background: "#f5f3ef" }}>
      <span className="text-2xl font-black text-stone-900">{numero}</span>
      <span className="text-xs text-stone-400 font-medium">{label}</span>
    </div>
  );
}

function CampoEdit({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-black uppercase tracking-wide text-stone-400 block mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-stone-800 focus:outline-none"
        style={{ background: "#f5f3ef" }}
      />
    </div>
  );
}

function PreferenzaToggle({
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
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl text-left border-0 cursor-pointer transition-all w-full"
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
        className="shrink-0"
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value ? "#a3e635" : "#e5e7eb",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          className="absolute bg-white rounded-full shadow"
          style={{
            width: 16,
            height: 16,
            top: 3,
            transition: "transform 0.2s",
            transform: value ? "translateX(21px)" : "translateX(3px)",
          }}
        />
      </div>
    </button>
  );
}

function AzioneConPunti({
  label,
  punti,
  completata,
  descrizione,
  link,
  linkLabel,
  ripetibile,
}: {
  label: string;
  punti: number;
  completata: boolean;
  descrizione?: string;
  link?: string;
  linkLabel?: string;
  ripetibile?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-2xl"
      style={{ background: completata && !ripetibile ? "#f0fdf4" : "#f5f3ef" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={
          completata && !ripetibile
            ? { background: "#dcfce7" }
            : { background: "#e5e7eb" }
        }
      >
        {completata && !ripetibile ? (
          <IcoCheck size={14} className="text-green-600" />
        ) : (
          <span className="text-xs font-black text-stone-400">+</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800 truncate">
          {label}
          {ripetibile && (
            <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#dbeafe", color: "#1e40af" }}>
              ripetibile
            </span>
          )}
        </p>
        {descrizione && <p className="text-xs text-stone-400 mt-0.5">{descrizione}</p>}
        {link && !completata && (
          <Link href={link} className="text-xs font-bold mt-1 block" style={{ color: "#16a34a" }}>
            {linkLabel}
          </Link>
        )}
      </div>
      <span className="text-sm font-black shrink-0" style={{ color: "#65a30d" }}>
        +{punti} pt
      </span>
    </div>
  );
}
