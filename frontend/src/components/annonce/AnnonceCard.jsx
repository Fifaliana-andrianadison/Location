import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, BedDouble, Ruler, MapPin } from 'lucide-react'
import { addFavori, checkFavori, removeFavori } from '../../api/favoriApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { assetUrl, formatAr, TYPE_LABELS, MODE_LABELS } from '../../utils/format.js'

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
  const ville = loc?.ville || 'Localisation non renseignée'

  return (
    <Link to={`/annonces/${annonce.id}`} className="annonce-card">
      <div className="annonce-img">
        {annonce.image_principale ? (
          <img src={assetUrl(annonce.image_principale)} alt={annonce.titre} loading="lazy" />
        ) : (
          <div className="annonce-img-empty">Aucune photo</div>
        )}
        <div className="annonce-badges">
          <span className={`badge ${annonce.type === 'terrain' ? 'badge-green' : 'badge-indigo'}`}>
            {TYPE_LABELS[annonce.type] ?? annonce.type}
          </span>
          <span className={`badge ${annonce.mode === 'vente' ? 'badge-amber' : 'badge-blue'}`}>
            {MODE_LABELS[annonce.mode] ?? annonce.mode}
          </span>
        </div>
        {user && (
          <button
            className={`fav-btn ${favori ? 'is-fav' : ''}`}
            onClick={toggleFavori}
            title={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            type="button"
          >
            <Heart size={16} fill={favori ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="annonce-body">
        <h3 className="annonce-titre">{annonce.titre}</h3>
        <p className="annonce-prix">{formatAr(annonce.prix)}</p>
        <p className="annonce-loc"><MapPin size={13} /> {ville}{loc?.quartier ? ` · ${loc.quartier}` : ''}</p>
        <div className="annonce-meta">
          {annonce.superficie != null && (
            <span><Ruler size={13} /> {new Intl.NumberFormat('fr-FR').format(annonce.superficie)} m²</span>
          )}
          {annonce.nb_pieces != null && (
            <span><BedDouble size={13} /> {annonce.nb_pieces} pièce{annonce.nb_pieces > 1 ? 's' : ''}</span>
          )}
          {annonce.type_loyer && <span className="badge badge-gray">{annonce.type_loyer}</span>}
        </div>
      </div>
    </Link>
  )
}