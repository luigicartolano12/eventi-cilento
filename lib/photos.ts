/**
 * lib/photos.ts
 *
 * Strategia immagini:
 *   1. Se l'evento/esperienza ha un campo `immagine` → mostra quello (foto ufficiale)
 *   2. Altrimenti → restituisce "" → il componente mostra il gradiente di categoria
 *
 * Nessun servizio esterno casuale (Unsplash, LoremFlickr, ecc.) perché
 * danno sempre foto non pertinenti. Il gradiente di categoria è sempre corretto.
 *
 * La funzione hashSig è mantenuta per uso futuro (es. gallery con più foto per evento).
 */

/** Hash numerico stabile dall'ID stringa — utile per scegliere immagini da array */
export function hashSig(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 8000 + 1;
}

/**
 * Restituisce "" — il componente che chiama questa funzione
 * mostrerà il gradiente di categoria come fallback visivo.
 * Solo gli eventi con campo `immagine` esplicito mostreranno una foto.
 */
export function fotoEvento(
  _id: string,
  _categoria: string,
  _w = 800,
  _h = 450
): string {
  return "";
}

/** Stesso comportamento per le esperienze */
export function fotoEsperienza(
  _id: string,
  _categoria: string,
  _w = 800,
  _h = 450
): string {
  return "";
}

/** Restituisce "" — le gallery mostrano il gradiente se non c'è una foto esplicita */
export function fotoGallery(
  _id: string,
  _categoria: string,
  _indice: number,
  _w = 700,
  _h = 500,
  _tipo: "evento" | "esperienza" = "evento"
): string {
  return "";
}
