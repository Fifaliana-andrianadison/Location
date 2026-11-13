import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, BedDouble, Ruler, MapPin, Bath } from 'lucide-react'
import { addFavori, checkFavori, removeFavori } from '../../api/favoriApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { annonceImage, formatAr, TYPE_LABELS, MODE_LABELS } from '../../utils/format.js'

export default function AnnonceCard({ annonce }) {
  const { user } = useAuth()
  const [favori, setFavori] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    checkFavori(annonce.id)
      .then(({ data }) => {
        if (active) setFavori(Boolean(data.favori))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user, annonce.id])

  const toggleFavori = async (e) => {
    e.preventDefault()
    if (!user || busy) return
    setBusy(true)
    try {
      if (favori) {
        await removeFavori(annonce.id)
        setFavori(false)
      } else {
        await addFavori(annonce.id)
        setFavori(true)
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const loc = annonce.localisation
  const ville = loc?.ville || 'Antananarivo'
  const img = annonceImage(annonce)
  const isVente = annonce.mode === 'vente'

  return (
    <Link to={`/annonces/${annonce.id}`} className="sl-card">
      <div className="sl-card-img">
        <img src={img} alt={annonce.titre} loading="lazy" onError={(e) => { e.currentTarget.src = annonceImage({ ...annonce, image_principale: null, images: [] }) }} />
        <div className="sl-card-badges">
          <span className={`sl-badge ${isVente ? 'vente' : 'location'}`}>
            {MODE_LABELS[annonce.mode] ?? annonce.mode}
          </span>
          <span className="sl-badge type">{TYPE_LABELS[annonce.type] ?? annonce.type}</span>
        </div>
        {user && (
          <button
            className={`sl-fav ${favori ? 'active' : ''}`}
            onClick={toggleFavori}
            title={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            type="button"
          >
            <Heart size={16} fill={favori ? 'currentColor' : 'none'} />
          </button>
        )}
        <span className="sl-card-photos">{(annonce.images?.length || 1)} photos</span>
      </div>
      <div className="sl-card-body">
        <p className="sl-card-price">
          {formatAr(annonce.prix)}
          {!isVente && <span className="sl-per"> /mois</span>}
        </p>
        <h3 className="sl-card-title">{annonce.titre}</h3>
        <p className="sl-card-loc"><MapPin size={13} /> {ville}{loc?.quartier ? ` · ${loc.quartier}` : ''}</p>
        <div className="sl-card-meta">
          {annonce.superficie != null && (
            <span><Ruler size={14} /> {new Intl.NumberFormat('fr-FR').format(annonce.superficie)} m²</span>
          )}
          {annonce.nb_pieces != null && (
            <span><BedDouble size={14} /> {annonce.nb_pieces} p.</span>
          )}
          {annonce.nb_chambres != null && (
            <span><BedDouble size={14} /> {annonce.nb_chambres} ch.</span>
          )}
          {annonce.nb_salles_bain != null && (
            <span><Bath size={14} /> {annonce.nb_salles_bain} Sdb</span>
          )}
          {!annonce.superficie && !annonce.nb_pieces && <span>Bien vérifié</span>}
        </div>
      </div>
    </Link>
  )
}
