"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IcoCamera, IcoCheck, IcoSend, IcoArrowLeft,
} from "@/app/components/icons";
import { CATEGORIE } from "@/lib/events";

const gradientCategoria: Record<string, string> = {
  Sagra:     "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:    "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:   "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:     "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso: "linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:   "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:    "linear-gradient(135deg, #059669, #14b8a6)",
  Salute:    "linear-gradient(135deg, #ec4899, #f43f5e)",
};

const INPUT = "w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-400/40";
const LABEL = "text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1.5 block";

export function ProponiForm({ prefill }: { prefill?: Partial<Record<string, string>> }) {
  const [form, setForm] = useState({
    titolo:        prefill?.titolo        ?? "",
    data:          prefill?.data          ?? "",
    dataFine:      prefill?.dataFine      ?? "",
    orario:        prefill?.orario        ?? "",
    comune:        prefill?.comune        ?? "",
    luogo:         prefill?.luogo         ?? "",
    categoria:     prefill?.categoria     ?? "",
    descrizione:   prefill?.descrizione   ?? "",
    gratuito:      prefill?.gratuito === "true",
    prezzo:        prefill?.prezzo        ?? "",
    linkEsterno:   prefill?.linkEsterno   ?? "",
    organizzatore: prefill?.organizzatore ?? "",
    telefono:      prefill?.telefono      ?? "",
    email:         prefill?.email         ?? "",
    nota:          prefill?.nota          ?? "",
  });
  const [invio, setInvio] = useState<"idle" | "caricamento" | "ok" | "errore">("idle");
  const [errMsg, setErrMsg] = useState("");

  function set(campo: string, valore: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valore }));
  }

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titolo || !form.data || !form.comune || !form.categoria || !form.descrizione || !form.organizzatore) {
      setErrMsg("Compila tutti i campi obbligatori (*)");
      return;
    }
    setInvio("caricamento");
    setErrMsg("");
    try {
      const res = await fetch("/api/proposte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.errore ?? "Errore invio");
      }
      setInvio("ok");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Errore");
      setInvio("errore");
    }
  }

  if (invio === "ok") {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "#dcfce7" }}
        >
          <IcoCheck size={28} style={{ color: "#16a34a" }} />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-900 mb-2">Proposta inviata!</h2>
          <p className="text-stone-500 text-sm max-w-xs">
            Abbiamo ricevuto il tuo evento. Lo esaminiamo entro 48 ore e ti confermiamo la pubblicazione.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-2xl transition-opacity hover:opacity-80"
          style={{ background: "#a3e635", color: "#14532d" }}
        >
          <IcoArrowLeft size={14} />
          Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={invia} className="flex flex-col gap-6">

      {/* Scansiona locandina */}
      <Link
        href="/scan"
        className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #f3e8ff, #ede9fe)" }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
        >
          <IcoCamera size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: "#6b21a8" }}>Hai già una locandina?</p>
          <p className="text-xs mt-0.5" style={{ color: "#7c3aed" }}>
            Carica la foto e l&apos;AI compila il form automaticamente →
          </p>
        </div>
      </Link>

      {/* Titolo */}
      <div>
        <label className={LABEL}>Titolo dell'evento *</label>
        <input
          value={form.titolo}
          onChange={(e) => set("titolo", e.target.value)}
          placeholder="es. Sagra del Fico Bianco di Cilento"
          className={INPUT}
          style={{ background: "#f5f3ef", fontSize: 16 }}
          required
        />
      </div>

      {/* Date + orario */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Data inizio *</label>
          <input
            type="date"
            value={form.data}
            onChange={(e) => set("data", e.target.value)}
            className={INPUT}
            style={{ background: "#f5f3ef", colorScheme: "light", fontSize: 16 }}
            required
          />
        </div>
        <div>
          <label className={LABEL}>Data fine</label>
          <input
            type="date"
            value={form.dataFine}
            onChange={(e) => set("dataFine", e.target.value)}
            className={INPUT}
            style={{ background: "#f5f3ef", colorScheme: "light", fontSize: 16 }}
          />
        </div>
        <div>
          <label className={LABEL}>Orario</label>
          <input
            type="time"
            value={form.orario}
            onChange={(e) => set("orario", e.target.value)}
            className={INPUT}
            style={{ background: "#f5f3ef", colorScheme: "light", fontSize: 16 }}
          />
        </div>
      </div>

      {/* Comune + Luogo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Comune *</label>
          <input
            value={form.comune}
            onChange={(e) => set("comune", e.target.value)}
            placeholder="es. Pisciotta"
            className={INPUT}
            style={{ background: "#f5f3ef", fontSize: 16 }}
            required
          />
        </div>
        <div>
          <label className={LABEL}>Luogo specifico</label>
          <input
            value={form.luogo}
            onChange={(e) => set("luogo", e.target.value)}
            placeholder="es. Piazza Municipio"
            className={INPUT}
            style={{ background: "#f5f3ef", fontSize: 16 }}
          />
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className={LABEL}>Categoria *</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIE.map((cat) => {
            const attiva = form.categoria === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => set("categoria", cat)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all"
                style={attiva
                  ? { background: gradientCategoria[cat] ?? "#16a34a", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }
                  : { background: "#f5f3ef", color: "#78716c" }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Descrizione */}
      <div>
        <label className={LABEL}>Descrizione *</label>
        <textarea
          value={form.descrizione}
          onChange={(e) => set("descrizione", e.target.value)}
          placeholder="Descrivi l'evento in 2-3 frasi: cosa si fa, chi organizza, cosa aspettarsi…"
          rows={4}
          className={INPUT}
          style={{ background: "#f5f3ef", resize: "vertical", fontSize: 16 }}
          required
        />
      </div>

      {/* Gratuito + Prezzo + Link */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            className="relative transition-colors duration-200 shrink-0"
            style={{ width: 40, height: 22, borderRadius: 11, background: form.gratuito ? "#a3e635" : "#e5e7eb" }}
          >
            <div
              className="absolute bg-white rounded-full shadow transition-transform duration-200"
              style={{ width: 16, height: 16, top: 3, transform: form.gratuito ? "translateX(21px)" : "translateX(3px)" }}
            />
            <input
              type="checkbox"
              checked={form.gratuito}
              onChange={(e) => set("gratuito", e.target.checked)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <span className="text-sm font-bold text-stone-700">Ingresso gratuito</span>
        </label>
        {!form.gratuito && (
          <input
            value={form.prezzo}
            onChange={(e) => set("prezzo", e.target.value)}
            placeholder="es. €5, Da €10, Offerta libera"
            className={INPUT}
            style={{ background: "#f5f3ef", fontSize: 16 }}
          />
        )}
        <input
          value={form.linkEsterno}
          onChange={(e) => set("linkEsterno", e.target.value)}
          placeholder="Link sito / prenotazione (opzionale)"
          className={INPUT}
          style={{ background: "#f5f3ef", fontSize: 16 }}
          type="url"
        />
      </div>

      {/* Organizzatore */}
      <div>
        <label className={LABEL}>Organizzatore / Contatti *</label>
        <div className="flex flex-col gap-2">
          <input
            value={form.organizzatore}
            onChange={(e) => set("organizzatore", e.target.value)}
            placeholder="Nome organizzatore, associazione o Pro Loco *"
            className={INPUT}
            style={{ background: "#f5f3ef", fontSize: 16 }}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="Telefono"
              className={INPUT}
              style={{ background: "#f5f3ef", fontSize: 16 }}
              type="tel"
            />
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Email"
              className={INPUT}
              style={{ background: "#f5f3ef", fontSize: 16 }}
              type="email"
            />
          </div>
        </div>
      </div>

      {/* Nota */}
      <div>
        <label className={LABEL}>Note aggiuntive</label>
        <textarea
          value={form.nota}
          onChange={(e) => set("nota", e.target.value)}
          placeholder="Informazioni utili: parcheggio, accessibilità, programma…"
          rows={2}
          className={INPUT}
          style={{ background: "#f5f3ef", resize: "vertical", fontSize: 16 }}
        />
      </div>

      {/* Errore */}
      {errMsg && (
        <p className="text-sm font-medium px-4 py-3 rounded-2xl" style={{ background: "#fef2f2", color: "#dc2626" }}>
          ⚠️ {errMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={invio === "caricamento"}
        className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2.5 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "#16a34a", color: "white" }}
      >
        {invio === "caricamento" ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Invio in corso…
          </>
        ) : (
          <>
            <IcoSend size={16} />
            Invia proposta
          </>
        )}
      </button>
      <p className="text-xs text-center text-stone-400">
        La pubblicazione è gratuita. Il team esamina le proposte entro 48 ore.
      </p>
    </form>
  );
}
