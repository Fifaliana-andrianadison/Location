import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { deletePropriete, getProprietes, changerPrix } from '../api/proprieteApi.js'
import { assetUrl, formatAr, TYPE_LABELS, MODE_LABELS, label } from '../utils/format.js'

export default function MesProprietes() {
  const [proprietes, setProprietes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [prixModal, setPrixModal] = useState(null)
  const [nouveauPrix, setNouveauPrix] = useState('')

  const load = (p = page) => {
    getProprietes({ page: p, per_page: 12 })
      .then(({ data }) => {
        setProprietes(data.data ?? [])
        setMeta(data.meta)
      })
      .catch((err) => setError(err.response?.data?.message || 'Erreur de chargement.'))
  }

  useEffect(() => {
    load(1)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const supprimer = async (p) => {
    if (!window.confirm(`Supprimer « ${p.titre} » ? Cette action est irréversible.`)) return
    try {
      await deletePropriete(p.id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Suppression impossible.')
    }
  }

  const enregistrerPrix = async (e) => {
    e.preventDefault()
    try {
      await changerPrix(prixModal.id, nouveauPrix)
      setPrixModal(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Mise à jour du prix impossible.')
    }
  }

  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page" style={{ margin: 0 }}>Mes propriétés</h1>
        <Link to="/ajouter-propriete" className="btn"><Plus size={15} /> Ajouter une propriété</Link>
      </div>
      {error && <div className="alert-danger">{error}</div>}
      {proprietes.length === 0 ? (
        <div className="card empty">
          Aucune propriété. Cliquez sur « Ajouter une propriété » pour publier votre premier bien.
        </div>
      ) : (
        <div className="grid prop-grid">
          {proprietes.map((p) => (
            <div key={p.id} className="card prop-card">
              {p.images?.[0] ? (
                <img className="prop-img" src={assetUrl(p.images[0].path)} alt={p.titre} />
              ) : (
                <div className="prop-img-empty">Aucune photo</div>
              )}
              <div className="prop-body">
                <div className="prop-badges">
                  <span className="badge badge-indigo">{TYPE_LABELS[p.type]}</span>
                  <span className={`badge ${p.verification === 'verifiee' ? 'badge-green' : p.verification === 'rejetee' ? 'badge-red' : 'badge-amber'}`}>
                    {p.verification === 'verifiee' ? 'En ligne' : p.verification === 'rejetee' ? 'Rejetée' : 'En attente de validation'}
                  </span>
                </div>
                <h3>{p.titre}</h3>
                <p className="prop-prix">{formatAr(p.prix)}</p>
                <p className="muted">
                  {MODE_LABELS[p.mode]} · {p.localisation?.ville || 'Localisation non renseignée'}
                </p>
                <p className="muted">
                  Statut : <span className={`badge ${p.statut === 'disponible' ? 'badge-green' : 'badge-amber'}`}>{label(p.statut)}</span>
                </p>
                <div className="form-actions">
                  <Link to={`/ajouter-propriete?id=${p.id}`} className="btn small secondary"><Pencil size={13} /> Modifier</Link>
                  <button className="btn small secondary" onClick={() => { setPrixModal(p); setNouveauPrix(p.prix) }}>
                    <Tag size={13} /> Prix
                  </button>
                  <button className="btn small danger" onClick={() => supprimer(p)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button className="btn small secondary" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1) }}>Précédent</button>
          <span className="muted">Page {meta.current_page}/{meta.last_page}</span>
          <button className="btn small secondary" disabled={page >= meta.last_page} onClick={() => { setPage(page + 1); load(page + 1) }}>Suivant</button>
        </div>
      )}

      {prixModal && (
        <div className="modal-overlay" onClick={() => setPrixModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={enregistrerPrix}>
            <div className="modal-head">
              <h3>Changer le prix — {prixModal.titre}</h3>
              <button type="button" className="icon-btn" onClick={() => setPrixModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Nouveau prix (Ar)</label>
                <input type="number" min="0" value={nouveauPrix} onChange={(e) => setNouveauPrix(e.target.value)} required autoFocus />
              </div>
              <p className="muted">Un historique du prix sera automatiquement enregistré.</p>
              <div className="form-actions">
                <button className="btn">Enregistrer</button>
                <button type="button" className="btn secondary" onClick={() => setPrixModal(null)}>Annuler</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
