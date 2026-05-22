/**
 * lib/photos.ts
 * Foto contestuali via Unsplash Source API — gratuito, nessuna API key.
 *
 * L'URL include un "sig" calcolato dall'ID stringa, così:
 *   • stesso evento/esperienza → sempre stessa foto (cache HTTP stabile)
 *   • eventi diversi → foto diverse (hash diverso → URL diverso → immagine diversa)
 *   • le keyword garantiscono pertinenza visiva (es. "sagra,food,festival,italy")
 */

/** Hash numerico stabile dall'ID stringa */
export function hashSig(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 8000 + 1;
}

// ─── Keyword per categoria EVENTO ─────────────────────────────────────────────
const KW_EVENTO: Record<string, string> = {
  Sagra:     "sagra,food,festival,italy,cuisine",
  Musica:    "concert,music,festival,outdoor,stage",
  Cultura:   "ruins,ancient,history,italy,monument",
  Sport:     "sport,trail,outdoor,cycling,italy",
  Religioso: "church,procession,italy,religion,tradition",
  Mercato:   "market,craft,artisan,italy,stalls",
  Natura:    "nature,trail,mountain,forest,italy",
  Salute:    "wellness,yoga,spa,relax,nature",
};

// ─── Keyword per categoria ESPERIENZA ─────────────────────────────────────────
const KW_ESPERIENZA: Record<string, string> = {
  Avventura:   "adventure,hiking,trekking,canyon,outdoor",
  Mare:        "sea,coast,mediterranean,beach,italy",
  Gastronomia: "food,cooking,cuisine,italy,gastronomy",
  Cultura:     "museum,history,ruins,italy,ancient",
  Benessere:   "wellness,spa,relax,thermal,nature",
  Sport:       "sport,cycling,outdoor,italy,activity",
  Natura:      "nature,forest,trail,italy,park",
};

/** URL foto evento — w×h pixel, pertinente alla categoria */
export function fotoEvento(
  id: string,
  categoria: string,
  w = 800,
  h = 450
): string {
  const kw = KW_EVENTO[categoria] ?? "italy,landscape,festival";
  const sig = hashSig(id);
  return `https://source.unsplash.com/${w}x${h}/?${kw}&sig=${sig}`;
}

/** URL foto esperienza — w×h pixel, pertinente alla categoria */
export function fotoEsperienza(
  id: string,
  categoria: string,
  w = 800,
  h = 450
): string {
  const kw = KW_ESPERIENZA[categoria] ?? "italy,landscape,nature";
  const sig = hashSig(id);
  return `https://source.unsplash.com/${w}x${h}/?${kw}&sig=${sig}`;
}

/** Variante con offset: per gallery (stesso ID, foto diversa) */
export function fotoGallery(
  id: string,
  categoria: string,
  indice: number,
  w = 700,
  h = 500,
  tipo: "evento" | "esperienza" = "evento"
): string {
  const kw =
    tipo === "esperienza"
      ? (KW_ESPERIENZA[categoria] ?? "italy,landscape,nature")
      : (KW_EVENTO[categoria] ?? "italy,landscape,festival");
  const sig = hashSig(id) + indice * 17; // offset deterministico per ogni foto gallery
  return `https://source.unsplash.com/${w}x${h}/?${kw}&sig=${sig}`;
}
