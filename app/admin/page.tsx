"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUtente } from "@/lib/utente";
import {
  getEventiDinamici,
  aggiungiEventiDinamici,
  approvaEvento,
  rifiutaEvento,
  svuotaPendenti,
  type EventoDinamico,
} from "@/lib/eventi-dinamici";
import { IcoArrowLeft, IcoCheck, IcoCalendar, IcoMapPin } from "@/app/components/icons";

type Messaggio = { tipo: "status" | "avviso" | "errore"; testo: string };

const COLORI_CAT: Record<string, { bg: string; color: string }> = {
  Sagra:     { bg: "#fff7ed", color: "#c2410c" },
  Musica:    { bg: "#faf5ff", color: "#7c3aed" },
  Cultura:   { bg: "#eff6ff", color: "#1d4ed8" },
  Sport:     { bg: "#f0fdf4", color: "#15803d" },
  Religioso: { bg: "#fefce8", color: "#a16207" },
  Mercato:   { bg: "#fdf2f8", color: "#be185d" },
  Natura:    { bg: "#ecfdf5", color: "#065f46" },
};

function EventoCard({
  evento,
  pendente,
  onApprova,
  onRifiuta,
}: {
  evento: EventoDinamico;
  pendente: boolean;
  onApprova?: () => void;
  onRifiuta?: () => void;
}) {
  const stile = COLORI_CAT[evento.categoria] ?? { bg: "#f5f3ef", color: "#44403c" };
  return (
    <div
      className="bg-white rounded-3xl p-5 flex flex-col gap-3"
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        opacity: pendente ? 1 : 0.75,
      }}
    >
      {/* Categoria + data */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ background: stile.bg, color: stile.color }}
        >
          {evento.categoria}
        </span>
        <span className="text-[11px] font-semibold text-stone-400">
          {evento.data}{evento.dataFine ? ` → ${evento.dataFine}` : ""}
          {evento.orario ? ` · ${evento.orario}` : ""}
        </span>
      </div>

      {/* Titolo */}
      <h3 className="text-[15px] font-black text-stone-900 leading-snug">{evento.titolo}</h3>

      {/* Luogo */}
      <div className="flex items-center gap-1.5 text-[12px] text-stone-400 font-medium">
        <IcoMapPin size={11} />
        {evento.luogo ? `${evento.luogo} · ` : ""}{evento.comune}
        {evento.gratuito && (
          <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: "#dcfce7", color: "#166534" }}>
            Gratuito
          </span>
        )}
      </div>

      {/* Descrizione */}
      <p className="text-[13px] text-stone-500 leading-relaxed">{evento.descrizione}</p>

      {/* Fonte */}
      {evento.sorgente && (
        <a
          href={evento.sorgente}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-stone-400 underline truncate hover:text-stone-600"
        >
          {evento.sorgente}
        </a>
      )}

      {/* Azioni */}
      {pendente && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={onRifiuta}
            className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-opacity hover:opacity-70"
            style={{ background: "#fef2f2", color: "#dc2626" }}
          >
            Rifiuta
          </button>
          <button
            onClick={onApprova}
            className="flex-[2] py-2.5 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: "#a3e635", color: "#14532d" }}
          >
            ✓ Approva
          </button>
        </div>
      )}

      {!pendente && (
        <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "#16a34a" }}>
          <IcoCheck size={12} />
          Approvato e pubblicato
        </div>
      )}
    </div>
  );
}

export default function PaginaAdmin() {
  const router = useRouter();
  const [autorizzato, setAutorizzato] = useState(false);
  const [query, setQuery] = useState("");
  const [cercando, setCercando] = useState(false);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [eventi, setEventi] = useState<EventoDinamico[]>([]);
  const [tab, setTab] = useState<"pendenti" | "approvati">("pendenti");

  useEffect(() => {
    const u = getUtente();
    if (!u) { router.replace("/registrati"); return; }
    setAutorizzato(true);
    setEventi(getEventiDinamici());
  }, [router]);

  function ricarica() {
    setEventi(getEventiDinamici());
  }

  async function cercaEventi() {
    setCercando(true);
    setMessaggi([]);

    try {
      const res = await fetch("/api/ai-eventi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok || !res.body) throw new Error("Errore connessione API");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const righe = buffer.split("\n");
        buffer = righe.pop() ?? "";

        for (const riga of righe) {
          if (!riga.trim()) continue;
          try {
            const data = JSON.parse(riga) as {
              tipo: string;
              msg?: string;
              eventi?: object[];
              totale?: number;
            };

            if (data.tipo === "status" || data.tipo === "avviso") {
              setMessaggi((prev) => [
                ...prev,
                { tipo: data.tipo as "status" | "avviso", testo: data.msg ?? "" },
              ]);
            } else if (data.tipo === "errore") {
              setMessaggi((prev) => [
                ...prev,
                { tipo: "errore", testo: data.msg ?? "Errore" },
              ]);
            } else if (data.tipo === "eventi" && data.eventi) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              aggiungiEventiDinamici(data.eventi as any[]);
              ricarica();
              setMessaggi((prev) => [
                ...prev,
                { tipo: "status", testo: `✓ Trovati ${data.totale ?? 0} eventi — in attesa di approvazione` },
              ]);
              setTab("pendenti");
            }
          } catch {
            /* riga non JSON, ignora */
          }
        }
      }
    } catch (err) {
      setMessaggi((prev) => [
        ...prev,
        { tipo: "errore", testo: err instanceof Error ? err.message : "Errore sconosciuto" },
      ]);
    } finally {
      setCercando(false);
    }
  }

  const pendenti = eventi.filter((e) => !e.approvato);
  const approvati = eventi.filter((e) => e.approvato);

  if (!autorizzato) return null;

  return (
    <main className="flex-1 pb-20" style={{ background: "#f5f3ef" }}>
      {/* Hero */}
      <div
        style={{ background: "#f5f3ef" }}
        className="px-5 pt-10 pb-14"
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
            style={{ color: "#16a34a" }}
          >
            <IcoArrowLeft size={14} />
            Torna alla home
          </Link>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#16a34a" }}>
            Pannello Admin
          </p>
          <h1 className="font-black text-stone-900 mb-2" style={{ fontSize: "clamp(32px, 6vw, 56px)" }}>
            AI Trova<br />
            <span style={{ color: "#65a30d" }}>Eventi</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#44403c" }}>
            Lascia che Claude cerchi sul web gli eventi del Cilento, poi revisiona e approva quelli da pubblicare.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 flex flex-col gap-5">

        {/* Box ricerca */}
        <div
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)" }}
        >
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-4">
            Ricerca AI
          </p>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !cercando && cercaEventi()}
              placeholder="es. sagre agosto, concerti estate, eventi sportivi…"
              className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none"
              style={{ background: "#f5f3ef" }}
              disabled={cercando}
            />
            <button
              onClick={cercaEventi}
              disabled={cercando}
              className="shrink-0 px-5 py-3 rounded-2xl text-sm font-black border-0 cursor-pointer transition-opacity disabled:opacity-50"
              style={{ background: "#a3e635", color: "#14532d" }}
            >
              {cercando ? "…" : "Cerca"}
            </button>
          </div>

          {/* Log messaggi */}
          {messaggi.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              {messaggi.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[12px] font-medium px-3 py-2 rounded-xl"
                  style={
                    m.tipo === "errore"
                      ? { background: "#fef2f2", color: "#dc2626" }
                      : m.tipo === "avviso"
                      ? { background: "#fefce8", color: "#a16207" }
                      : { background: "#f0fdf4", color: "#166534" }
                  }
                >
                  <span className="shrink-0 mt-0.5">
                    {m.tipo === "errore" ? "✕" : m.tipo === "avviso" ? "⚠" : "→"}
                  </span>
                  {m.testo}
                </div>
              ))}
            </div>
          )}

          {/* Spinner */}
          {cercando && (
            <div className="mt-3 flex items-center gap-2 text-sm text-stone-400">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Claude sta cercando eventi sul web…
            </div>
          )}
        </div>

        {/* Statistiche */}
        {eventi.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: eventi.length, label: "Trovati", bg: "#f5f3ef", col: "#78716c" },
              { n: pendenti.length, label: "Da approvare", bg: "#fef3c7", col: "#92400e" },
              { n: approvati.length, label: "Pubblicati", bg: "#dcfce7", col: "#166534" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3.5 flex flex-col gap-0.5"
                style={{ background: s.bg }}
              >
                <span className="text-2xl font-black" style={{ color: s.col }}>{s.n}</span>
                <span className="text-[11px] font-semibold text-stone-500">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab pendenti / approvati */}
        {eventi.length > 0 && (
          <>
            <div
              className="bg-white rounded-2xl p-1 flex gap-1"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {(["pendenti", "approvati"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all capitalize"
                  style={
                    tab === t
                      ? { background: "#1a3529", color: "#a3e635" }
                      : { background: "transparent", color: "#78716c" }
                  }
                >
                  {t === "pendenti" ? `Da approvare (${pendenti.length})` : `Pubblicati (${approvati.length})`}
                </button>
              ))}
            </div>

            {/* Lista eventi */}
            {tab === "pendenti" && (
              <>
                {pendenti.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-8">
                    Nessun evento in attesa. Usa la ricerca AI per trovarne di nuovi.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                        {pendenti.length} da esaminare
                      </p>
                      <button
                        onClick={() => { svuotaPendenti(); ricarica(); }}
                        className="text-xs font-bold text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Rifiuta tutti
                      </button>
                    </div>
                    {pendenti.map((e) => (
                      <EventoCard
                        key={e.id}
                        evento={e}
                        pendente
                        onApprova={() => { approvaEvento(e.id); ricarica(); }}
                        onRifiuta={() => { rifiutaEvento(e.id); ricarica(); }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "approvati" && (
              <>
                {approvati.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-8">
                    Nessun evento ancora approvato.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                      {approvati.length} pubblicati nella home
                    </p>
                    {approvati.map((e) => (
                      <EventoCard
                        key={e.id}
                        evento={e}
                        pendente={false}
                        onRifiuta={() => { rifiutaEvento(e.id); ricarica(); }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Istruzioni primo accesso */}
        {eventi.length === 0 && !cercando && (
          <div
            className="rounded-3xl p-6 flex flex-col gap-3"
            style={{ background: "rgba(26,53,41,0.06)", border: "1.5px dashed rgba(26,53,41,0.15)" }}
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Come funziona</p>
            {[
              { ico: "🔍", testo: "Clicca Cerca — Claude cercherà automaticamente eventi nel Cilento sul web" },
              { ico: "📋", testo: "Revisiona gli eventi trovati e approva quelli che vuoi pubblicare" },
              { ico: "✅", testo: "Gli eventi approvati appaiono subito nella home dell'app" },
            ].map((s) => (
              <div key={s.testo} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{s.ico}</span>
                <p className="text-sm text-stone-500 leading-relaxed">{s.testo}</p>
              </div>
            ))}
            <div className="mt-2 p-3.5 rounded-2xl text-sm" style={{ background: "#fef3c7", color: "#92400e" }}>
              <strong>Nota:</strong> la ricerca AI usa la tua API key Anthropic e consuma crediti.
              Usa la ricerca con query specifica per risultati migliori.
            </div>

            {/* Link alla home per aggiungere la api key */}
            <div className="flex items-center gap-2">
              <IcoCalendar size={14} className="text-stone-400 shrink-0" />
              <p className="text-xs text-stone-400">
                Assicurati di aver configurato{" "}
                <code className="text-stone-600 font-bold">ANTHROPIC_API_KEY</code>{" "}
                nel file <code className="text-stone-600 font-bold">.env.local</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
