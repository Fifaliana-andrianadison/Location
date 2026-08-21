import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFavoris, removeFavori } from '../api/favoriApi.js'
import { assetUrl, formatAr, TYPE_LABELS } from '../utils/format.js'

export default function MesFavoris() {
  const [favoris, setFavoris] = useState([])
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    getFavoris()
      .then(({ data }) => setFavoris(data.data ?? []))
      .catch(() => setError('Erreur de chargement des favoris.'))
  }

  useEffect(() => {
    load()
  }, [])

  const supprimer = async (annonceId) => {
    setBusy(annonceId)
    try {
      await removeFavori(annonceId)
      load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="page">
      <h1 className="page">Mes favoris</h1>
      {error && <div className="alert-danger">{error}</div>}
      {favoris.length === 0 ? (
        <div className="card empty">
          <Heart size={18} />
          <p>Vous n'avez encore aucun favori. Ajoutez des annonces à vos favoris pour les retrouver ici.</p>
          <Link to="/recherche" className="btn small">Parcourir les annonces</Link>
        </div>
      ) : (
        <div className="grid">
          {favoris.map((f) => (
            <div key={f.id} className="card favori-card">
              <Link to={`/annonces/${f.annonce?.id}`} className="favori-link">
                {f.annonce?.image_principale || f.annonce?.images?.[0]?.path ? (
                  <img src={assetUrl(f.annonce?.image_principale || f.annonce?.images?.[0]?.path)} alt={f.annonce?.titre} />
                ) : (
                  <div className="prop-img-empty">Aucune photo</div>
                )}
                <div className="favori-body">
                  <span className="badge badge-indigo">{TYPE_LABELS[f.annonce?.type] ?? f.annonce?.type}</span>
                  <h3>{f.annonce?.titre}</h3>
                  <p className="prop-prix">{formatAr(f.annonce?.prix)}</p>
                  <p className="muted">{f.annonce?.localisation?.ville || ''}</p>
                </div>
              </Link>
              <button
                className="btn small danger"
                disabled={busy === f.annonce?.id}
                onClick={() => f.annonce?.id && supprimer(f.annonce.id)}
              >
                <Trash2 size={13} /> Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}