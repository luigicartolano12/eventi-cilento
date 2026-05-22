"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  IcoArrowLeft, IcoCamera, IcoSparkle, IcoDownload,
  IcoCalendar, IcoMapPin, IcoClock, IcoMail, IcoPhone, IcoGlobe, IcoCheck,
} from "@/app/components/icons";

interface EventoEstratto {
  titolo?: string;
  data?: string;
  dataFine?: string;
  orario?: string;
  luogo?: string;
  comune?: string;
  categoria?: string;
  descrizione?: string;
  gratuito?: boolean;
  prezzo?: string;
  organizzatore?: string;
  telefono?: string;
  email?: string;
  sito?: string;
  note?: string;
}

function formattaDataIT(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export function ScanLocandina() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [risultato, setRisultato] = useState<EventoEstratto | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [copiato, setCopiato] = useState(false);

  function handleFile(file: File) {
    setRisultato(null);
    setErrore(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  async function analizza() {
    if (!preview) return;
    setCaricamento(true);
    setErrore(null);
    setRisultato(null);

    try {
      // Estrai base64 e mediaType dal data URL
      const [header, base64] = preview.split(",");
      const mediaType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";

      const res = await fetch("/api/leggi-locandina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrore(data.errore ?? "Errore durante l'analisi");
      } else {
        setRisultato(data.evento);
      }
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Errore di rete");
    } finally {
      setCaricamento(false);
    }
  }

  function copiaJSON() {
    if (!risultato) return;
    navigator.clipboard.writeText(JSON.stringify(risultato, null, 2));
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  }

  function reset() {
    setPreview(null);
    setRisultato(null);
    setErrore(null);
  }

  return (
    <main style={{ background: "#f5f3ef" }} className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-12">

        {/* Breadcrumb */}
        <Link
          href="/proponi"
          className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
          style={{ color: "#65a30d" }}
        >
          <IcoArrowLeft size={14} />
          Proponi evento
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
            >
              <IcoCamera size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 leading-tight">Scansiona locandina</h1>
              <p className="text-sm" style={{ color: "#78716c" }}>L'AI legge la foto e compila i dati per te</p>
            </div>
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: "#78716c" }}>
            Carica una foto della locandina, del volantino o dello screenshot del post social.
            L'intelligenza artificiale estrae automaticamente titolo, data, luogo, orario e tutti i dettagli.
          </p>
        </div>

        {/* Upload zone */}
        {!preview ? (
          <div
            className="rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-purple-400"
            style={{
              height: 220,
              borderColor: "rgba(0,0,0,0.15)",
              background: "white",
            }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#f3e8ff" }}
            >
              <IcoCamera size={28} style={{ color: "#a855f7" }} />
            </div>
            <div className="text-center">
              <p className="font-bold text-stone-700">Trascina qui la locandina</p>
              <p className="text-sm mt-1" style={{ color: "#78716c" }}>oppure clicca per scegliere dal dispositivo</p>
              <p className="text-xs mt-2" style={{ color: "#a8a29e" }}>JPG, PNG, WEBP · max 10MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Preview immagine */}
            <div className="relative rounded-3xl overflow-hidden" style={{ background: "#e7e5e4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Locandina caricata"
                className="w-full object-contain"
                style={{ maxHeight: 420 }}
              />
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
              >
                ×
              </button>
            </div>

            {/* Bottone analizza */}
            {!risultato && (
              <button
                onClick={analizza}
                disabled={caricamento}
                className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2.5 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
              >
                {caricamento ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block"
                    />
                    Analisi in corso…
                  </>
                ) : (
                  <>
                    <IcoSparkle size={16} />
                    Analizza con AI
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Errore */}
        {errore && (
          <div
            className="mt-4 p-4 rounded-2xl text-sm font-medium"
            style={{ background: "#fef2f2", color: "#dc2626" }}
          >
            ⚠️ {errore}
          </div>
        )}

        {/* Risultato */}
        {risultato && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-stone-900 flex items-center gap-2">
                <IcoSparkle size={16} style={{ color: "#a855f7" }} />
                Dati estratti
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copiaJSON}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer transition-all flex items-center gap-1.5"
                  style={copiato
                    ? { background: "#dcfce7", color: "#166534" }
                    : { background: "#f5f3ef", color: "#78716c" }
                  }
                >
                  {copiato ? <><IcoCheck size={11} /> Copiato</> : <><IcoDownload size={11} /> JSON</>}
                </button>
                <button
                  onClick={reset}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer"
                  style={{ background: "#f5f3ef", color: "#78716c" }}
                >
                  Nuova scansione
                </button>
              </div>
            </div>

            <div
              className="rounded-3xl p-6 flex flex-col gap-5"
              style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
            >
              {/* Titolo */}
              {risultato.titolo && (
                <div>
                  {risultato.categoria && (
                    <span
                      className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
                      style={{ background: "#f3e8ff", color: "#7e22ce" }}
                    >
                      {risultato.categoria}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-stone-900 leading-tight">{risultato.titolo}</h3>
                </div>
              )}

              {/* Data + Orario */}
              {(risultato.data || risultato.orario) && (
                <div className="flex flex-wrap gap-4">
                  {risultato.data && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <IcoCalendar size={14} style={{ color: "#a855f7" }} />
                      {formattaDataIT(risultato.data)}
                      {risultato.dataFine && ` – ${formattaDataIT(risultato.dataFine)}`}
                    </span>
                  )}
                  {risultato.orario && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <IcoClock size={14} style={{ color: "#a855f7" }} />
                      {risultato.orario}
                    </span>
                  )}
                </div>
              )}

              {/* Luogo */}
              {(risultato.luogo || risultato.comune) && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <IcoMapPin size={14} style={{ color: "#a855f7" }} />
                  {[risultato.luogo, risultato.comune].filter(Boolean).join(", ")}
                </span>
              )}

              {/* Prezzo */}
              {(risultato.prezzo || risultato.gratuito !== undefined) && (
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full self-start"
                  style={risultato.gratuito
                    ? { background: "#dcfce7", color: "#166534" }
                    : { background: "#fef3c7", color: "#92400e" }
                  }
                >
                  <IcoCheck size={11} />
                  {risultato.gratuito ? "Ingresso gratuito" : risultato.prezzo}
                </span>
              )}

              {/* Descrizione */}
              {risultato.descrizione && (
                <p className="text-[14px] leading-relaxed text-stone-600 border-t border-stone-100 pt-4">
                  {risultato.descrizione}
                </p>
              )}

              {/* Organizzatore + contatti */}
              {(risultato.organizzatore || risultato.telefono || risultato.email || risultato.sito) && (
                <div className="border-t border-stone-100 pt-4 flex flex-col gap-2">
                  {risultato.organizzatore && (
                    <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: "#78716c" }}>
                      {risultato.organizzatore}
                    </p>
                  )}
                  {risultato.telefono && (
                    <a href={`tel:${risultato.telefono}`} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-900">
                      <IcoPhone size={13} style={{ color: "#a855f7" }} />
                      {risultato.telefono}
                    </a>
                  )}
                  {risultato.email && (
                    <a href={`mailto:${risultato.email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-900">
                      <IcoMail size={13} style={{ color: "#a855f7" }} />
                      {risultato.email}
                    </a>
                  )}
                  {risultato.sito && (
                    <a href={risultato.sito} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80" style={{ color: "#a855f7" }}>
                      <IcoGlobe size={13} />
                      {risultato.sito}
                    </a>
                  )}
                </div>
              )}

              {/* Note aggiuntive */}
              {risultato.note && (
                <p className="text-[12px] text-stone-400 border-t border-stone-100 pt-3">
                  📌 {risultato.note}
                </p>
              )}
            </div>

            {/* CTA proponi */}
            <Link
              href="/proponi"
              className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
              style={{ background: "#16a34a" }}
            >
              <IcoSparkle size={15} />
              Proponi questo evento
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
