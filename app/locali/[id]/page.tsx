import { notFound } from "next/navigation";
import Link from "next/link";
import {
  locali,
  STILE_LOCALE,
  type Locale,
} from "@/lib/locali";
import { IcoArrowLeft, IcoMapPin, IcoClock, IcoGlobe, IcoPhone, IcoMail } from "@/app/components/icons";

export async function generateStaticParams() {
  return locali.map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

const emojiLocale: Record<string, string> = {
  "Bar & Aperitivo": "🍹",
  "Ristorante":      "🍽️",
  "Discoteca":       "🎉",
  "Agriturismo":     "🌾",
  "Beach Club":      "🏖️",
};

export default async function PaginaLocale({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale: Locale | undefined = locali.find((l) => l.id === id);
  if (!locale) notFound();

  const stile = STILE_LOCALE[locale.categoria];
  const emoji = emojiLocale[locale.categoria] ?? "🌿";

  return (
    <main style={{ background: "#f5f3ef" }} className="min-h-screen pb-20">
      {/* ── Breadcrumb ── */}
      <div className="max-w-4xl mx-auto px-5 pt-7 pb-3">
        <Link
          href="/notte"
          className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: "#16a34a" }}
        >
          <IcoArrowLeft size={14} />
          Torna alla lista notte
        </Link>
      </div>

      {/* ── Hero gradiente + emoji ── */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: "clamp(220px, 52vw, 360px)", background: stile.gradient }}
      >
        <span className="text-[100px] opacity-20 select-none">{emoji}</span>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Badge categoria sovrapposto */}
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <span
            className="text-[12px] font-black px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{ background: stile.bg, color: stile.color }}
          >
            {locale.categoria}
          </span>
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
                {locale.nome}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "#78716c" }}
                >
                  <IcoMapPin size={13} />
                  {locale.comune}
                </span>
                {locale.orario && (
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "#78716c" }}
                  >
                    <IcoClock size={13} />
                    {locale.orario}
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
                Il locale
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                {locale.descrizione}
              </p>
            </div>

            {/* Serate */}
            {locale.serate.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: "#78716c" }}
                >
                  Serate &amp; eventi
                </p>
                <div className="flex flex-wrap gap-2">
                  {locale.serate.map((s) => (
                    <span
                      key={s}
                      className="text-sm px-4 py-2 rounded-full font-semibold"
                      style={{ background: stile.bg, color: stile.color }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile: torna su */}
            <div className="lg:hidden">
              <Link
                href="/notte"
                className="inline-flex items-center gap-1.5 text-sm font-bold"
                style={{ color: "#78716c" }}
              >
                <IcoArrowLeft size={13} />
                Torna alla lista notte
              </Link>
            </div>
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
              {/* Categoria badge */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-2"
                  style={{ color: "#78716c" }}
                >
                  Tipo
                </p>
                <span
                  className="inline-block text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ background: stile.bg, color: stile.color }}
                >
                  {locale.categoria}
                </span>
              </div>

              {/* Orario */}
              {locale.orario && (
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: "#78716c" }}
                  >
                    Orario
                  </p>
                  <p className="text-base font-bold text-stone-900">{locale.orario}</p>
                </div>
              )}

              <div style={{ height: 1, background: "#f5f3ef" }} />

              {/* Contatti */}
              <div className="flex flex-col gap-3">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "#78716c" }}
                >
                  Contatti
                </p>

                {locale.instagram && (
                  <a
                    href={`https://instagram.com/${locale.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#16a34a" }}
                  >
                    <IcoGlobe size={14} />
                    {locale.instagram}
                  </a>
                )}

                {locale.telefono && (
                  <a
                    href={`tel:${locale.telefono}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#44403c" }}
                  >
                    <IcoPhone size={14} />
                    {locale.telefono}
                  </a>
                )}

                {!locale.instagram && !locale.telefono && (
                  <p className="text-sm" style={{ color: "#a8a29e" }}>
                    Nessun contatto disponibile
                  </p>
                )}
              </div>

              {/* CTA Maps */}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${locale.nome}, ${locale.comune}, Salerno, Campania, Italia`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-opacity hover:opacity-80"
                style={{ background: "#f5f3ef", color: "#44403c" }}
              >
                📍 Vedi su Google Maps
              </a>

              {/* CTA contatto */}
              <a
                href="mailto:eventi@cilento.it"
                className="w-full py-3.5 rounded-2xl text-center text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "#16a34a" }}
              >
                <IcoMail size={14} />
                Segnala un aggiornamento
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
