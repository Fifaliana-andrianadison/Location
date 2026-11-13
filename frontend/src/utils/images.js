/**
 * Images de secours (Unsplash) — utilisées quand le backend ne renvoie aucune photo.
 * Garantit qu'il y a TOUJOURS une image, comme sur seloger.com.
 */

const U = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`

export const HERO_IMAGE = U('photo-1600596542815-ffad4c1539a9', 1600)
export const HERO_IMAGE_2 = U('photo-1600585154340-be6161a56a0c', 1600)
export const HERO_INTERIOR = U('photo-1600607687939-ce8a6c25118c', 1600)

export const FALLBACK_BY_TYPE = {
  maison: [
    U('photo-1568605114967-8130f3a36994'),
    U('photo-1600596542815-ffad4c1539a9'),
    U('photo-1600585154340-be6161a56a0c'),
    U('photo-1570129477492-45c003edd2be'),
    U('photo-1600585154526-990dced4db0d'),
  ],
  appartement: [
    U('photo-1522708323590-d24dbb6b0267'),
    U('photo-1502672260266-1c1ef2d93688'),
    U('photo-1554995207-c18c203602cb'),
    U('photo-1493809842364-78817add7ffb'),
    U('photo-1560448204-e02f11c3d0e2'),
  ],
  terrain: [
    U('photo-1500382017468-9049fed747ef'),
    U('photo-1625246333195-78d9c38ad449'),
    U('photo-1500076656116-558758c991c1'),
    U('photo-1464082354059-27db6ce50048'),
  ],
}

export const FALLBACK_ALL = [
  ...FALLBACK_BY_TYPE.maison,
  ...FALLBACK_BY_TYPE.appartement,
  ...FALLBACK_BY_TYPE.terrain,
]

export const TYPE_IMAGES = {
  maison: FALLBACK_BY_TYPE.maison[1],
  appartement: FALLBACK_BY_TYPE.appartement[0],
  terrain: FALLBACK_BY_TYPE.terrain[0],
}

export const CITY_IMAGES = {
  Antananarivo: U('photo-1568605114967-8130f3a36994'),
  Toamasina: U('photo-1507525428034-b723cf961d3e'),
  Antsirabe: U('photo-1449844908441-8829872d2607'),
  Mahajanga: U('photo-1519046904884-53103b34b206'),
  Fianarantsoa: U('photo-1470071459604-3b5ec3a7fe05'),
  'Nosy Be': U('photo-1559128010-7c1ad6e1b6a5'),
  Toliara: U('photo-1507525428034-b723cf961d3e'),
  'Diégo-Suarez': U('photo-1507525428034-b723cf961d3e'),
}

/** Image déterministe selon l'id (évite que toutes les cartes aient la même photo). */
export function fallbackFor(type, seed = 0) {
  const list = FALLBACK_BY_TYPE[type] || FALLBACK_ALL
  const i = Math.abs(Number(seed) || 0) % list.length
  return list[i]
}

/** 3-4 photos pour la galerie détail quand le backend n'en a pas. */
export function fallbackGallery(type, seed = 0) {
  const list = FALLBACK_BY_TYPE[type] || FALLBACK_ALL
  const start = Math.abs(Number(seed) || 0) % list.length
  return [0, 1, 2, 3].map((k) => list[(start + k) % list.length])
}

export function cityImage(ville, seed = 0) {
  if (ville && CITY_IMAGES[ville]) return CITY_IMAGES[ville]
  return FALLBACK_ALL[Math.abs(Number(seed) || ville?.length || 0) % FALLBACK_ALL.length]
}
