"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Evento, Categoria, CATEGORIE, formattaData } from "@/lib/events";
import { getEventiApprovati, type EventoDinamico } from "@/lib/eventi-dinamici";
import { getInEvidenza, STILE_CATEGORIA, IMG_KEYWORDS_CATEGORIA, type Esperienza } from "@/lib/esperienze";
import { getLocaliInEvidenza, STILE_LOCALE, type Locale } from "@/lib/locali";
import { EventiList } from "./components/EventiList";
import {
  IcoSagra, IcoMusica, IcoCultura, IcoSport, IcoReligioso, IcoMercato, IcoNatura,
  IcoCalendar, IcoMapPin, IcoClock, IcoSearch,
} from "./components/icons";

// ── Mappatura aree geografiche ────────────────────────────────────────────────

const COMUNI_VALLO = new Set([
  "Atena Lucana", "Buonabitacolo", "Casalbuono", "Monte San Giacomo",
  "Montesano sulla Marcellana", "Padula", "Pertosa", "Polla",
  "Sala Consilina", "San Pietro al Tanagro", "San Rufo", "Sant'Arsenio",
  "Sassano", "Sanza", "Teggiano",
]);

const COMUNI_GOLFO = new Set([
  "Ispani", "Sapri", "Vibonati", "Scario", "Santa Marina",
  "Santa Marina di Camerota", "San Giovanni a Piro", "Torre Orsaia", "Torraca",
]);

type Area = "tutti" | "cilento" | "vallo" | "golfo";

const AREE: { id: Area; label: string }[] = [
  { id: "tutti",   label: "Tutti" },
  { id: "cilento", label: "Cilento" },
  { id: "vallo",   label: "Vallo di Diano" },
  { id: "golfo",   label: "Golfo di Policastro" },
];

// ── Gradient / icone per le categorie ────────────────────────────────────────

const gradientCategoria: Record<string, string> = {
  Sagra:     "linear-gradient(135deg, #fb923c, #fbbf24)",
  Musica:    "linear-gradient(135deg, #a855f7, #818cf8)",
  Cultura:   "linear-gradient(135deg, #3b82f6, #22d3ee)",
  Sport:     "linear-gradient(135deg, #22c55e, #10b981)",
  Religioso: "linear-gradient(135deg, #facc15, #f59e0b)",
  Mercato:   "linear-gradient(135deg, #f472b6, #fb7185)",
  Natura:    "linear-gradient(135deg, #059669, #14b8a6)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconeCategoria: Record<string, React.ComponentType<any>> = {
  Sagra: IcoSagra, Musica: IcoMusica, Cultura: IcoCultura, Sport: IcoSport,
  Religioso: IcoReligioso, Mercato: IcoMercato, Natura: IcoNatura,
};

const descCategoria: Record<string, string> = {
  Sagra: "Gusto locale", Musica: "Concerti", Cultura: "Arte e mostre",
  Sport: "Competizioni", Religioso: "Fede e storia", Mercato: "Artigianato", Natura: "Trekking",
};

// ── Immagini ─────────────────────────────────────────────────────────────────

const kwLocale: Record<string, string> = {
  "Bar & Aperitivo": "bar,aperitivo",
  "Ristorante":      "restaurant,food",
  "Discoteca":       "nightclub,dance",
  "Agriturismo":     "farmhouse,countryside",
  "Beach Club":      "beach,club",
};

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 9999 + 1;
}

function flickrUrl(keywords: string, lockNum: number, w = 400, h = 300): string {
  const parts = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  const primary = parts.slice(0, 2).join(",");
  return `https://loremflickr.com/${w}/${h}/${primary}/all?lock=${lockNum}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function oggiISO() {
  return new Date().toISOString().split("T")[0];
}

function eventiDiOggi(eventi: Evento[]): Evento[] {
  const oggi = oggiISO();
  return eventi.filter((e) => oggi >= e.data && oggi <= (e.dataFine ?? e.data));
}

// ── Mini card: evento di oggi ─────────────────────────────────────────────────
function MiniCard({ evento }: { evento: Evento }) {
  const Ico = IconeCategoria[evento.categoria];
  return (
    <a
      href={`/events/${evento.id}`}
      className="shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 152,
        background: "white",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex items-center justify-center relative"
        style={{ height: 88, background: gradientCategoria[evento.categoria] }}
      >
        <Ico size={36} strokeWidth={1.2} className="text-white opacity-80" />
        <span
          className="absolute top-2.5 left-2.5 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.28)", color: "white", backdropFilter: "blur(8px)" }}
        >
          {evento.categoria}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p
          className="text-[12px] font-bold leading-snug text-stone-900"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evento.titolo}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#78716c" }}>
          <IcoMapPin size={9} />
          {evento.comune}
        </span>
        {evento.orario && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#16a34a" }}>
            <IcoClock size={9} />
            {evento.orario}
          </span>
        )}
      </div>
    </a>
  );
}

// ── Mini card: locale ─────────────────────────────────────────────────────────
function LocaleMiniCard({ locale }: { locale: Locale }) {
  const stile = STILE_LOCALE[locale.categoria];
  return (
    <Link
      href="/locali"
      className="shrink-0 relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end"
      style={{ width: 160, height: 200, background: stile.gradient }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flickrUrl(
          kwLocale[locale.categoria] ?? "restaurant,italy",
          hashId(locale.id),
          400, 300
        )}
        alt={locale.nome}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.75) 100%)" }}
      />
      <div className="relative p-3.5 flex flex-col gap-1">
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full w-fit"
          style={{ background: stile.bg, color: stile.color }}
        >
          {locale.categoria}
        </span>
        <p
          className="text-[13px] font-bold text-white leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {locale.nome}
        </p>
        <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
          {locale.comune}
        </span>
      </div>
    </Link>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export function HomeContent({ eventi }: { eventi: Evento[] }) {
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria | null>(null);
  const [cerca, setCerca] = useState("");
  const [area, setArea] = useState<Area>("tutti");
  const listaRef = useRef<HTMLDivElement>(null);
  const [eventiExtra, setEventiExtra] = useState<Evento[]>([]);

  function convertiDinamico(d: EventoDinamico): Evento {
    return {
      id: d.id,
      titolo: d.titolo,
      data: d.data,
      dataFine: d.dataFine,
      orario: d.orario,
      luogo: d.luogo ?? d.comune,
      comune: d.comune,
      categoria: d.categoria,
      descrizioneBreve: d.descrizione.slice(0, 120),
      descrizione: d.descrizione,
      pubblico: "Tutti",
      servizi: {
        accessibileDisabili: false,
        parcheggio: false,
        ingressoGratuito: d.gratuito ?? false,
        prenotazioneRichiesta: false,
        petFriendly: false,
      },
    };
  }

  useEffect(() => {
    const locali = getEventiApprovati().map(convertiDinamico);
    setEventiExtra(locali);
    fetch("/api/eventi-live")
      .then((r) => r.json())
      .then((kvEventi: EventoDinamico[]) => {
        if (kvEventi.length > 0) {
          const idLocali = new Set(locali.map((e) => e.id));
          const nuovi = kvEventi.filter((e) => !idLocali.has(e.id)).map(convertiDinamico);
          setEventiExtra((prev) => [...prev, ...nuovi]);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tutti gli eventi uniti e ordinati per data ────────────────────────────
  const tuttiGliEventi = [...eventiExtra, ...eventi].sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  // ── Pre-filtra per area geografica + testo ricerca ────────────────────────
  const eventiPerLista = tuttiGliEventi.filter((e) => {
    if (area === "vallo" && !COMUNI_VALLO.has(e.comune)) return false;
    if (area === "golfo" && !COMUNI_GOLFO.has(e.comune)) return false;
    if (area === "cilento" && (COMUNI_VALLO.has(e.comune) || COMUNI_GOLFO.has(e.comune))) return false;
    if (cerca) {
      const q = cerca.toLowerCase();
      if (
        !e.titolo.toLowerCase().includes(q) &&
        !e.comune.toLowerCase().includes(q) &&
        !e.categoria.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const comuniCount = new Set(tuttiGliEventi.map((e) => e.comune)).size;
  const oggi = eventiDiOggi(tuttiGliEventi);
  const localiEvidenza = getLocaliInEvidenza();

  function selezionaCategoria(cat: Categoria | null) {
    setCategoriaAttiva(cat);
    setTimeout(() => {
      listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── HERO: solo headline ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pt-14 pb-10">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
            style={{ color: "#16a34a" }}
          >
            Cilento &amp; Vallo di Diano
          </p>
          <h1
            className="font-black leading-[0.88] tracking-tight text-stone-900 mb-6"
            style={{ fontSize: "clamp(52px, 9vw, 96px)" }}
          >
            Scopri gli<br />
            <span style={{ color: "#65a30d" }}>eventi</span><br />
            del Cilento.
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-sm"
            style={{ color: "#78716c" }}
          >
            Sagre, concerti, mostre, sport e natura nel Parco Nazionale del Cilento.
          </p>
        </div>
      </div>

      {/* ── OGGI ── */}
      {oggi.length > 0 && (
        <div style={{ background: "#f5f3ef" }} className="px-5 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[11px] font-black uppercase tracking-[0.15em]"
                style={{ color: "#16a34a" }}
              >
                Oggi
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                {formattaData(oggiISO())}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {oggi.map((e) => <MiniCard key={e.id} evento={e} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── BARRA DI RICERCA + FILTRO AREA ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pb-4">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "white",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Input testo */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#f5f3ef" }}>
              <IcoSearch size={18} className="text-stone-400 shrink-0" />
              <input
                type="search"
                value={cerca}
                onChange={(e) => setCerca(e.target.value)}
                placeholder="Cerca eventi, comuni, categorie…"
                className="flex-1 bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none font-medium"
                /* fontSize 16 previene lo zoom automatico su iOS */
                style={{ fontSize: 16 }}
              />
              {cerca && (
                <button
                  onClick={() => setCerca("")}
                  className="text-stone-400 hover:text-stone-600 border-0 bg-transparent cursor-pointer text-2xl leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Pills area geografica */}
            <div className="flex gap-2 px-5 py-3.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {AREE.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setArea(id)}
                  className="shrink-0 text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer transition-all whitespace-nowrap"
                  style={
                    area === id
                      ? { background: "#16a34a", color: "white" }
                      : { background: "#f5f3ef", color: "#78716c" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ESPLORA CATEGORIA ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pb-4">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em] mb-4"
            style={{ color: "#78716c" }}
          >
            Esplora per categoria
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIE.map((cat) => {
              const Ico = IconeCategoria[cat];
              const attivo = categoriaAttiva === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selezionaCategoria(attivo ? null : cat)}
                  className="shrink-0 flex flex-col rounded-2xl border-0 cursor-pointer transition-all duration-200 overflow-hidden"
                  style={{
                    width: 108,
                    background: attivo ? "#a3e635" : "white",
                    boxShadow: attivo
                      ? "0 0 0 2.5px #65a30d, 0 4px 12px rgba(101,163,13,0.25)"
                      : "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
                    transform: attivo ? "translateY(-2px)" : "translateY(0)",
                  }}
                >
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      height: 68,
                      background: attivo ? "rgba(20,83,45,0.12)" : gradientCategoria[cat],
                    }}
                  >
                    <Ico
                      size={30}
                      strokeWidth={1.4}
                      className={attivo ? "text-green-800" : "text-white"}
                    />
                  </div>
                  <div className="py-3 flex flex-col items-center gap-0.5">
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: attivo ? "#14532d" : "#1c1c1e" }}
                    >
                      {cat}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: attivo ? "#166534" : "#8e8e93" }}
                    >
                      {descCategoria[cat]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STATISTICHE ── */}
      <div style={{ background: "#f5f3ef" }} className="px-5 pb-6">
        <div className="max-w-6xl mx-auto flex gap-3">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <IcoCalendar size={15} style={{ color: "#16a34a" }} />
            <div>
              <p className="text-xl font-black text-stone-900 leading-none">{tuttiGliEventi.length}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#78716c" }}>eventi in programma</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <IcoMapPin size={15} style={{ color: "#16a34a" }} />
            <div>
              <p className="text-xl font-black text-stone-900 leading-none">{comuniCount}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#78716c" }}>comuni del territorio</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOCALI & SERATE ── */}
      {localiEvidenza.length > 0 && (
        <div style={{ background: "#f5f3ef" }} className="px-5 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#78716c" }}>
                  Locali &amp; Serate
                </p>
                <h2 className="text-xl font-black text-stone-900">Dove uscire stanotte</h2>
              </div>
              <Link
                href="/locali"
                className="text-sm font-bold transition-opacity hover:opacity-70"
                style={{ color: "#16a34a" }}
              >
                Tutti i locali →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {localiEvidenza.map((l) => (
                <LocaleMiniCard key={l.id} locale={l} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LISTA EVENTI (pre-filtrata per area + testo) ── */}
      <div ref={listaRef} style={{ background: "#f5f3ef" }} className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Indicatore filtri attivi */}
          {(cerca || area !== "tutti") && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-stone-500 font-medium">
                Filtro attivo:
              </span>
              {area !== "tutti" && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534" }}
                >
                  {AREE.find((a) => a.id === area)?.label}
                </span>
              )}
              {cerca && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#e0f2fe", color: "#0c4a6e" }}
                >
                  &ldquo;{cerca}&rdquo;
                </span>
              )}
              <button
                onClick={() => { setCerca(""); setArea("tutti"); }}
                className="text-xs font-bold border-0 bg-transparent cursor-pointer"
                style={{ color: "#dc2626" }}
              >
                × Azzera
              </button>
            </div>
          )}

          <EventiList eventi={eventiPerLista} categoriaEsterna={categoriaAttiva} />
        </div>
      </div>
    </>
  );
}
