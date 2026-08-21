import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AnnonceDetail from '../components/annonce/AnnonceDetail.jsx'
import AvisForm from '../components/avis/AvisForm.jsx'
import { getAnnonce } from '../api/annonceApi.js'
import { checkFavori } from '../api/favoriApi.js'
import { getAvis } from '../api/avisApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Star } from 'lucide-react'
import { formatDate } from '../utils/format.js'

export default function DetailBien() {
  const { id } = useParams()
  const { user } = useAuth()
  const [annonce, setAnnonce] = useState(null)
  const [favori, setFavori] = useState(false)
  const [avis, setAvis] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    getAnnonce(id)
      .then(({ data }) => {
        setAnnonce(data)
        const ownerId = data.proprietaire?.id
        if (ownerId) {
          return getAvis({ user_id: ownerId })
        }
        return null
      })
      .then((res) => res && setAvis(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Annonce introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    checkFavori(id)
      .then(({ data }) => setFavori(Boolean(data.favori)))
      .catch(() => {})
  }, [user, id])

  const reloadAvis = () => {
    const ownerId = annonce?.proprietaire?.id
    if (!ownerId) return
    getAvis({ user_id: ownerId }).then(({ data }) => setAvis(data))
  }

  if (loading) {
    return (
      <div className="app-loading" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (error || !annonce) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
        <h2>Annonce indisponible</h2>
        <p className="muted">{error || "Cette annonce n'existe pas ou n'est plus en ligne."}</p>
        <a className="btn" href="/recherche">Retour à la recherche</a>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <AnnonceDetail annonce={annonce} isFavori={favori} onToggleFavori={setFavori} />

      <div className="detail-avis">
        <div className="card">
          <h2>Avis sur le propriétaire {annonce.proprietaire?.name || ''}</h2>
          {avis && avis.note_moyenne ? (
            <p className="avis-score">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(avis.note_moyenne) ? 'currentColor' : 'none'}
                  className={i < Math.round(avis.note_moyenne) ? 'star on' : 'star'}
                />
              ))}
              <strong> {Number(avis.note_moyenne).toFixed(1)}/5</strong>
              <span className="muted"> · {avis.data.length} avis</span>
            </p>
          ) : (
            <p className="muted">Aucun avis pour le moment.</p>
          )}
          {avis?.data?.length > 0 && (
            <ul className="simple-list">
              {avis.data.map((a) => (
                <li key={a.id}>
                  <span className="avatar">{a.auteur?.name?.charAt(0)}</span>
                  <div>
                    <strong>{a.auteur?.name}</strong>
                    <span className="muted"> · {a.note}/5 · {formatDate(a.created_at)}</span>
                    <p>{a.commentaire}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {user && user.role !== 'proprietaire' && annonce.proprietaire && (
            <AvisForm
              cibleUserId={annonce.proprietaire.id}
              onSubmitted={reloadAvis}
            />
          )}
        </div>
      </div>
    </div>
  )
}
