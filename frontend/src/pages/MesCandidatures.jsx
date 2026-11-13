import { useEffect, useState } from 'react'
import { FileText, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCandidatures, updateCandidature } from '../api/candidatureApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { assetUrl, formatAr, formatDate, label, annonceImage } from '../utils/format.js'

export default function MesCandidatures() {
  const { user } = useAuth()
  const [candidatures, setCandidatures] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const load = (p = page) => {
    getCandidatures({ page: p, per_page: 12 })
      .then(({ data }) => {
        setCandidatures(data.data ?? [])
        setMeta(data.meta)
      })
      .catch((err) => setError(err.response?.data?.message || 'Erreur de chargement.'))
  }

  useEffect(() => {
    load(1)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changerStatut = async (c, statut) => {
    setBusy(c.id)
    try {
      await updateCandidature(c.id, { statut })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  const jeSuisProprietaire = user?.role === 'proprietaire'

  return (
    <div className="page">
      <h1 className="page">Mes candidatures</h1>
      {error && <div className="alert-danger">{error}</div>}
      {candidatures.length === 0 ? (
        <div className="card empty">
          {jeSuisProprietaire
            ? 'Aucune candidature reçue sur vos annonces pour le moment.'
            : "Vous n'avez pas encore postulé. Parcourez les annonces et candidatez !"}
        </div>
      ) : (
        <div className="grid candidature-grid">
          {candidatures.map((c) => (
            <div key={c.id} className="card candidature-card">
              <div className="cand-head">
                <img src={c.annonce ? annonceImage(c.annonce) : assetUrl(null, null, c.id)} alt="" loading="lazy" />
                <div>
                  <Link to={`/annonces/${c.annonce?.id}`}><strong>{c.annonce?.titre || 'Annonce'}</strong></Link>
                  <p className="muted">
                    {jeSuisProprietaire
                      ? `${c.locataire?.name} (${c.locataire?.telephone || 'sans téléphone'})`
                      : `Candidature du ${formatDate(c.created_at)}`}
                  </p>
                </div>
                <span className={`badge ${c.statut === 'acceptee' ? 'badge-green' : c.statut === 'refusee' ? 'badge-red' : 'badge-amber'}`}>
                  {label(c.statut)}
                </span>
              </div>
              {c.message && <p className="muted">{c.message}</p>}
              <p>
                <strong>Budget :</strong> {formatAr(c.budget)}
              </p>
              {c.documents?.length > 0 && (
                <p className="muted">
                  <FileText size={13} /> Documents : {c.documents.map((d) => d.type).join(', ')}
                </p>
              )}
              {jeSuisProprietaire && c.statut === 'en_attente' && (
                <div className="form-actions">
                  <button className="btn small" disabled={busy === c.id} onClick={() => changerStatut(c, 'acceptee')}>
                    <Check size={14} /> Accepter
                  </button>
                  <button className="btn small danger" disabled={busy === c.id} onClick={() => changerStatut(c, 'refusee')}>
                    <X size={14} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button className="btn small secondary" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1) }}>
            Précédent
          </button>
          <span className="muted">Page {meta.current_page}/{meta.last_page}</span>
          <button className="btn small secondary" disabled={page >= meta.last_page} onClick={() => { setPage(page + 1); load(page + 1) }}>
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}
