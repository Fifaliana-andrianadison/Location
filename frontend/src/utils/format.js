import { FALLBACK_ALL, fallbackFor } from './images.js'

const API_URL = 'http://127.0.0.1:8000'

export function assetUrl(path, type = null, seed = 0) {
  if (!path) {
    if (type) return fallbackFor(type, seed)
    return FALLBACK_ALL[Math.abs(Number(seed) || 0) % FALLBACK_ALL.length]
  }
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Meilleure image d'une annonce, avec repli garanti (style seloger : toujours une photo). */
export function annonceImage(annonce, index = 0) {
  const imgs = annonce?.images || []
  const path = annonce?.image_principale || imgs[index]?.path || imgs[0]?.path || null
  if (path) return assetUrl(typeof path === 'string' ? path : path?.path, annonce?.type, annonce?.id ?? index)
  return fallbackFor(annonce?.type, annonce?.id ?? index)
}

/** Toutes les images d'une annonce (galerie), avec repli garanti. */
export function annonceImages(annonce) {
  const imgs = (annonce?.images || []).map((i) => (typeof i === 'string' ? i : i?.path)).filter(Boolean)
  if (annonce?.image_principale) imgs.unshift(annonce.image_principale)
  const urls = [...new Set(imgs)].map((p) => assetUrl(p, annonce?.type, annonce?.id))
  if (urls.length > 0) return urls
  return [0, 1, 2, 3].map((k) => fallbackFor(annonce?.type, (Number(annonce?.id) || 0) + k))
}

export function formatAr(n) {
  const nombre = Number(n) || 0
  return `${new Intl.NumberFormat('fr-FR').format(nombre)} Ar`
}

export function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatMois(mois) {
  if (!mois) return '—'
  if (typeof mois === 'string' && mois.length === 10) mois = mois.slice(0, 7)
  const [annee, num] = String(mois).split('-')
  if (!annee || !num) return mois
  const noms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  return `${noms[Number(num) - 1]} ${annee}`
}

export const TYPE_LABELS = { maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain' }
export const MODE_LABELS = { location: 'Location', vente: 'Vente' }

export const STATUT_LABELS = {
  en_attente: 'En attente',
  verifiee: 'Vérifiée',
  rejetee: 'Rejetée',
  disponible: 'Disponible',
  occupe: 'Occupé',
  vendu: 'Vendu',
  indisponible: 'Indisponible',
  actif: 'Actif',
  termine: 'Terminé',
  resilie: 'Résilié',
  brouillon: 'Brouillon',
  signe: 'Signé',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
  confirme: 'Confirmé',
  rejete: 'Rejeté',
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Résolu',
  paye: 'Payé',
  impaye: 'Impayé',
  partiel: 'Partiel',
  en_ligne: 'En ligne',
  hors_ligne: 'Hors ligne',
}

export const BADGE_CLASS = {
  en_attente: 'partial',
  verifiee: 'paid',
  rejetee: 'unpaid',
  disponible: 'paid',
  occupe: 'blue',
  vendu: 'gray',
  indisponible: 'inactive',
  actif: 'paid',
  termine: 'gray',
  resilie: 'unpaid',
  brouillon: 'inactive',
  signe: 'paid',
  acceptee: 'paid',
  refusee: 'unpaid',
  confirme: 'paid',
  rejete: 'unpaid',
  ouvert: 'partial',
  en_cours: 'blue',
  resolu: 'paid',
  paye: 'paid',
  impaye: 'unpaid',
  partiel: 'partial',
  en_ligne: 'paid',
  hors_ligne: 'inactive',
}

export function label(key) {
  if (!key) return '—'
  return STATUT_LABELS[key] ?? key
}
