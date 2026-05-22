import { notFound } from "next/navigation";
import Link from "next/link";
import { esperienze, STILE_CATEGORIA } from "@/lib/esperienze";
import { fotoEsperienza, fotoGallery } from "@/lib/photos";
import { IcoArrowLeft, IcoMapPin, IcoClock, IcoGlobe, IcoFacebook, IcoInstagram, IcoPhone, IcoMail, IcoExternalLink } from "@/app/components/icons";

export async function generateStaticParams() {
  return esperienze.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;


function etaConsigliata(difficolta?: string): string {
  if (difficolta === "Facile") return "Adatto a tutti · famiglie e bambini";
  if (difficolta === "Media") return "Da 12 anni in su";
  if (difficolta === "Difficile") return "Da 16 anni · buona forma fisica";
  return "Adatto a tutti";
}

export default async function PaginaEsperienza({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const esp = esperienze.find((e) => e.id === id);
  if (!esp) notFound();

  const stile = STILE_CATEGORIA[esp.categoria];

  /* 5 immagini Unsplash contestuali: 1 hero + 4 gallery */
  const galleryImgs = [
    fotoEsperienza(esp.id, esp.categoria, 1400, 700),
    fotoGallery(esp.id, esp.categoria, 1, 700, 500, "esperienza"),
    fotoGallery(esp.id, esp.categoria, 2, 700, 500, "esperienza"),
    fotoGallery(esp.id, esp.categoria, 3, 700, 500, "esperienza"),
    fotoGallery(esp.id, esp.categoria, 4, 700, 500, "esperienza"),
  ];

  return (
    <main style={{ background: "#f5f3ef" }} className="min-h-screen pb-20">
      {/* ── Breadcrumb ── */}
      <div className="max-w-4xl mx-auto px-5 pt-7 pb-3">
        <Link
          href="/esperienze"
          className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: "#16a34a" }}
        >
          <IcoArrowLeft size={14} />
          Tutte le esperienze
        </Link>
      </div>

      {/* ── Hero immagine ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(220px, 52vw, 460px)", background: stile.gradient }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={galleryImgs[0]}
          alt={esp.titolo}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Badges sovrapposti all'hero */}
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <span
            className="text-[12px] font-black px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{ background: stile.bg, color: stile.color }}
          >
            {esp.categoria}
          </span>
          {esp.difficolta && (
            <span
              className="text-[12px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={
                esp.difficolta === "Facile"
                  ? { background: "#dcfce7", color: "#166534" }
                  : esp.difficolta === "Media"
                  ? { background: "#fef3c7", color: "#92400e" }
                  : { background: "#fee2e2", color: "#991b1b" }
              }
            >
              {esp.difficolta}
            </span>
          )}
        </div>
      </div>

      {/* ── Mini Gallery (4 foto) ── */}
      <div className="max-w-4xl mx-auto px-5 mt-2.5">
        <div className="grid grid-cols-4 gap-2" style={{ height: "clamp(64px, 14vw, 112px)" }}>
          {galleryImgs.slice(1).map((src, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden relative"
              style={{ background: stile.gradient }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${esp.titolo} — immagine ${i + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Layout contenuto ── */}
      <div className="max-w-4xl mx-auto px-5 mt-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Colonna sinistra (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Titolo + metadati */}
            <div>
              <h1
                className="font-black text-stone-900 leading-tight tracking-tight mb-3"
                style={{ fontSize: "clamp(24px, 5vw, 36px)" }}
              >
                {esp.titolo}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "#78716c" }}
                >
                  <IcoMapPin size={13} />
                  {esp.luogo}, {esp.comune}
                </span>
                {esp.durata && (
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "#78716c" }}
                  >
                    <IcoClock size={13} />
                    {esp.durata}
                  </span>
                )}
              </div>
            </div>

            {/* Descrizione */}
            <div
              className="rounded-3xl p-6"
              style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: "#78716c" }}
              >
                L'esperienza
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                {esp.descrizione}
              </p>
            </div>

            {/* Mobile: torna su */}
            <div className="lg:hidden">
              <Link
                href="/esperienze"
                className="inline-flex items-center gap-1.5 text-sm font-bold"
                style={{ color: "#78716c" }}
              >
                <IcoArrowLeft size={13} />
                Tutte le esperienze
              </Link>
            </div>

            {/* Tags — in fondo alla colonna sinistra */}
            {esp.tags && esp.tags.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: "#78716c" }}
                >
                  Parole chiave
                </p>
                <div className="flex flex-wrap gap-2">
                  {esp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold"
                      style={{ background: "#e7f3e8", color: "#166534" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar destra (1/3) ── */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-3xl p-6 flex flex-col gap-5"
              style={{
                background: "white",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
              }}
            >
              {/* Prezzo */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-1"
                  style={{ color: "#78716c" }}
                >
                  Prezzo
                </p>
                <p className="text-2xl font-black text-stone-900">{esp.prezzo}</p>
              </div>

              {/* Durata */}
              {esp.durata && (
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: "#78716c" }}
                  >
                    Durata
                  </p>
                  <p className="text-base font-bold text-stone-900">{esp.durata}</p>
                </div>
              )}

              {/* Difficoltà */}
              {esp.difficolta && (
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: "#78716c" }}
                  >
                    Difficoltà
                  </p>
                  <span
                    className="inline-block text-sm font-bold px-3 py-1 rounded-full"
                    style={
                      esp.difficolta === "Facile"
                        ? { background: "#dcfce7", color: "#166534" }
                        : esp.difficolta === "Media"
                        ? { background: "#fef3c7", color: "#92400e" }
                        : { background: "#fee2e2", color: "#991b1b" }
                    }
                  >
                    {esp.difficolta}
                  </span>
                </div>
              )}

              <div style={{ height: 1, background: "#f5f3ef" }} />

              {/* CTA Maps */}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${esp.luogo}, ${esp.comune}, Salerno, Campania, Italia`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-opacity hover:opacity-80"
                style={{ background: "#f5f3ef", color: "#44403c" }}
              >
                📍 Vedi su Google Maps
              </a>

              {/* CTA Prenota */}
              {esp.linkEsterno ? (
                <a
                  href={esp.linkEsterno}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl text-center text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "#16a34a" }}
                >
                  <IcoGlobe size={14} />
                  Prenota / Info
                </a>
              ) : (
                <p
                  className="text-center text-xs font-medium"
                  style={{ color: "#a8a29e" }}
                >
                  Esperienza libera — nessuna prenotazione richiesta
                </p>
              )}

              <div style={{ height: 1, background: "#f5f3ef" }} />

              {/* Età consigliata */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-1"
                  style={{ color: "#78716c" }}
                >
                  👥 Età consigliata
                </p>
                <p className="text-sm font-semibold text-stone-700">
                  {etaConsigliata(esp.difficolta)}
                </p>
              </div>

              {/* Social & Contatti */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#78716c" }}>
                  Contatti & Social
                </p>
                <div className="flex flex-col gap-2">
                  {esp.facebook && (
                    <a href={esp.facebook} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "#e7f3ff", color: "#1877f2" }}>
                      <IcoFacebook size={15} />
                      <span className="flex-1">Facebook</span>
                      <IcoExternalLink size={11} style={{ opacity: 0.5 }} />
                    </a>
                  )}
                  {esp.instagram && (
                    <a href={esp.instagram} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "#fdf2f8", color: "#c2185b" }}>
                      <IcoInstagram size={15} />
                      <span className="flex-1">Instagram</span>
                      <IcoExternalLink size={11} style={{ opacity: 0.5 }} />
                    </a>
                  )}
                  {esp.linkEsterno && (
                    <a href={esp.linkEsterno} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <IcoGlobe size={15} />
                      <span className="flex-1">Sito ufficiale</span>
                      <IcoExternalLink size={11} style={{ opacity: 0.5 }} />
                    </a>
                  )}
                  {esp.telefono && (
                    <a href={`tel:${esp.telefono}`}
                      className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "#f5f3ef", color: "#44403c" }}>
                      <IcoPhone size={15} />
                      <span className="flex-1">{esp.telefono}</span>
                    </a>
                  )}
                  {esp.email && (
                    <a href={`mailto:${esp.email}`}
                      className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "#f5f3ef", color: "#44403c" }}>
                      <IcoMail size={15} />
                      <span className="flex-1">{esp.email}</span>
                    </a>
                  )}
                  {!esp.facebook && !esp.instagram && !esp.linkEsterno && !esp.telefono && !esp.email && (
                    <p className="text-xs" style={{ color: "#a8a29e" }}>Contatto non disponibile</p>
                  )}
                </div>
                {esp.linkEsterno && (
                  <p className="text-xs leading-relaxed mt-2" style={{ color: "#a8a29e" }}>
                    Per informazioni contatta direttamente il gestore tramite il sito ufficiale.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
