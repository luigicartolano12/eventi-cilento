/**
 * foto-fallback.ts
 * Immagini generiche di alta qualità (Unsplash, royalty-free) da mostrare
 * nelle schede evento / esperienza quando non è disponibile un'immagine ufficiale.
 *
 * Selezione deterministica basata sull'ID, così ogni evento mostra sempre
 * la stessa immagine (non cambia a ogni ricarica).
 *
 * Attribution Unsplash: https://unsplash.com/license
 */

// ─────────────────────────────────────────────────────────────────────────────
// EVENTI — per categoria
// ─────────────────────────────────────────────────────────────────────────────

const FOTO_EVENTI: Record<string, string[]> = {
  Sagra: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
  ],
  Musica: [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900&q=80&auto=format&fit=crop",
  ],
  Cultura: [
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80&auto=format&fit=crop",
  ],
  Sport: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop",
  ],
  Religioso: [
    "https://images.unsplash.com/photo-1519500099198-fd81846b8fd5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548625361-58a9d4394c6c?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=80&auto=format&fit=crop",
  ],
  Mercato: [
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80&auto=format&fit=crop",
  ],
  Natura: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80&auto=format&fit=crop",
  ],
  Salute: [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=900&q=80&auto=format&fit=crop",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPERIENZE — per categoria
// ─────────────────────────────────────────────────────────────────────────────

const FOTO_ESPERIENZE: Record<string, string[]> = {
  Mare: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=900&q=80&auto=format&fit=crop",
  ],
  Gastronomia: [
    "https://images.unsplash.com/photo-1540189549336-e6e99eb4b951?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
  ],
  Natura: [
    "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80&auto=format&fit=crop",
  ],
  Cultura: [
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=900&q=80&auto=format&fit=crop",
  ],
  Benessere: [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598257006626-48b0c252070d?w=900&q=80&auto=format&fit=crop",
  ],
  Sport: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530143311094-34d807799e8f?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80&auto=format&fit=crop",
  ],
  Artigianato: [
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&q=80&auto=format&fit=crop",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — selezione deterministica per ID
// ─────────────────────────────────────────────────────────────────────────────

/** Hash semplice e stabile: somma dei char codes dell'ID */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
  return h;
}

/**
 * Restituisce un'immagine generica per un evento.
 * Se l'evento ha già un campo `immagine`, usalo invece di questa.
 */
export function fotoFallbackEvento(categoria: string, id: string): string {
  const imgs = FOTO_EVENTI[categoria] ?? FOTO_EVENTI.Natura;
  return imgs[hashId(id) % imgs.length];
}

/**
 * Restituisce un'immagine generica per un'esperienza.
 * Se l'esperienza ha già una foto, usala invece di questa.
 */
export function fotoFallbackEsperienza(categoria: string, id: string): string {
  const imgs = FOTO_ESPERIENZE[categoria] ?? FOTO_ESPERIENZE.Natura;
  return imgs[hashId(id) % imgs.length];
}
