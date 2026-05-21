"use client";

import { useState } from "react";
import { IcoShare, IcoClipboard, IcoCheck } from "./icons";

interface Props {
  titolo: string;
}

export function ShareButton({ titolo }: Props) {
  const [aperto, setAperto] = useState(false);
  const [copiato, setCopiato] = useState(false);

  function getUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function condividi() {
    const url = getUrl();
    const testo = `${titolo} — Eventi Cilento`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titolo, text: testo, url });
        return;
      } catch {
        // utente ha annullato o API non disponibile
      }
    }
    setAperto((v) => !v);
  }

  async function copiaLink() {
    await navigator.clipboard.writeText(getUrl());
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  }

  const url = typeof window !== "undefined" ? window.location.href : "";
  const testo = `${titolo} — Eventi Cilento`;

  return (
    <div className="relative">
      <button
        onClick={condividi}
        className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border-0 cursor-pointer transition-opacity hover:opacity-80"
        style={{ background: "#f5f3ef", color: "#57534e" }}
      >
        <IcoShare size={15} />
        Condividi
      </button>

      {aperto && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAperto(false)}
          />
          <div
            className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 flex flex-col gap-1 z-50"
            style={{ minWidth: 220 }}
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${testo} ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-stone-50"
              style={{ color: "#166534" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: "#25d366" }}
              >
                W
              </span>
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-stone-50"
              style={{ color: "#1877f2" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: "#1877f2" }}
              >
                f
              </span>
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(testo)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-stone-50"
              style={{ color: "#111" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: "#111" }}
              >
                𝕏
              </span>
              X / Twitter
            </a>
            <button
              onClick={copiaLink}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-stone-50 text-left border-0 cursor-pointer w-full"
              style={{ color: "#57534e" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#f5f3ef" }}
              >
                {copiato ? <IcoCheck size={15} /> : <IcoClipboard size={15} />}
              </span>
              {copiato ? "Copiato!" : "Copia link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
