import { useEffect, useState } from 'react'
import { Check, X, ShieldCheck, FileText, Search, Mail, Phone } from 'lucide-react'
import { getValidations, validerPropriete, rejeterPropriete, verifierProprietaire, getProprietaires } from '../../api/adminApi.js'
import { assetUrl, formatAr, formatDate, label, TYPE_LABELS, MODE_LABELS } from '../../utils/format.js'

const VERIF_BADGE = { verifiee: 'badge-green', rejetee: 'badge-red', en_attente: 'badge-amber' }

export default function ValidationBiens() {
  const [tab, setTab] = useState('biens')
  const [proprietes, setProprietes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [proprietaires, setProprietaires] = useState([])
  const [loadingProps, setLoadingProps] = useState(false)
  const [filtreVerif, setFiltreVerif] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [apercu, setApercu] = useState(null)
  const [rejet, setRejet] = useState(null)
  const [motif, setMotif] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadBiens = (p = page) => {
    getValidations({ page: p, per_page: 12 })
      .then(({ data }) => {
        setProprietes(data.data ?? [])
        setMeta(data.meta)
      })
      .catch(() => setError('Erreur de chargement des validations.'))
  }

  const loadProprietaires = () => {
    setLoadingProps(true)
    getProprietaires()
      .then(({ data }) => setProprietaires(data.data ?? []))
      .catch((err) => setError(err.response?.data?.message || 'Erreur de chargement des propriétaires.'))
      .finally(() => setLoadingProps(false))
  }

  useEffect(() => {
    setError('')
    if (tab === 'biens') loadBiens(1)
    else loadProprietaires()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useEffect(() => {
    // Compteur de l'onglet disponible dès l'ouverture de la page.
    loadProprietaires()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const proprietairesFiltres = proprietaires.filter((u) => {
    if (filtreVerif !== 'tous' && (u.verification_status || 'en_attente') !== filtreVerif) return false
    const q = recherche.trim().toLowerCase()
    if (!q) return true
    return [u.name, u.email, u.telephone].some((v) => v?.toLowerCase().includes(q))
  })
  const nbEnAttente = proprietaires.filter((u) => (u.verification_status || 'en_attente') === 'en_attente').length
  const isPdf = (path) => /\.pdf$/i.test(path || '')

  const valider = async (id) => {
    setBusy(id)
    setError('')
    setSuccess('')
    try {
      await validerPropriete(id)
      setSuccess('Annonce validée et mise en ligne.')
      loadBiens()
    } catch (err) {
      setError(err.response?.data?.message || 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  const confirmerRejet = async (e) => {
    e.preventDefault()
    setBusy(rejet.id)
    try {
      await rejeterPropriete(rejet.id, motif)
      setSuccess('Annonce rejetée. Le propriétaire a été notifié.')
      setRejet(null)
      setMotif('')
      loadBiens()
    } catch (err) {
      setError(err.response?.data?.message || 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  const verifier = async (userId, action) => {
    setBusy(userId)
    setError('')
    setSuccess('')
    try {
      await verifierProprietaire(userId, action)
      setSuccess(`Propriétaire ${action === 'valider' ? 'validé' : 'rejeté'}.`)
      loadProprietaires()
    } catch (err) {
      setError(err.response?.data?.message || 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="page">
      <h1 className="page">Validation &amp; modération</h1>
      {error && <div className="alert-danger">{error}</div>}
      {success && <p className="success">{success}</p>}

      <div className="tabs">
        <button className={`tab ${tab === 'biens' ? 'active' : ''}`} onClick={() => setTab('biens')}>
          Biens en attente {meta ? `(${meta.total})` : ''}
        </button>
        <button className={`tab ${tab === 'proprietaires' ? 'active' : ''}`} onClick={() => setTab('proprietaires')}>
          Propriétaires ({proprietaires.length}){nbEnAttente > 0 ? ` · ${nbEnAttente} à vérifier` : ''}
        </button>
      </div>

      {tab === 'biens' && (
        <>
          {proprietes.length === 0 ? (
            <div className="card empty">Aucun bien en attente de validation.</div>
          ) : (
            <div className="grid prop-grid">
              {proprietes.map((p) => (
                <div key={p.id} className="card prop-card">
                  <img className="prop-img" src={assetUrl(p.images?.[0]?.path, p.type, p.id)} alt={p.titre} loading="lazy" />
                  <div className="prop-body">
                    <div className="prop-badges">
                      <span className="badge badge-indigo">{TYPE_LABELS[p.type]}</span>
                      <span className="badge badge-blue">{MODE_LABELS[p.mode]}</span>
                    </div>
                    <h3>{p.titre}</h3>
                    <p className="prop-prix">{formatAr(p.prix)}</p>
                    <p className="muted">{p.localisation?.ville || 'Ville inconnue'} · {p.description?.slice(0, 100) || 'Sans description'}</p>
                    <div className="form-actions">
                      <button className="btn small" disabled={busy === p.id} onClick={() => valider(p.id)}>
                        <Check size={14} /> Valider
                      </button>
                      <button className="btn small danger" disabled={busy === p.id} onClick={() => setRejet(p)}>
                        <X size={14} /> Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta && meta.last_page > 1 && (
            <div className="pagination">
              <button className="btn small secondary" disabled={page <= 1} onClick={() => { setPage(page - 1); loadBiens(page - 1) }}>Précédent</button>
              <span className="muted">Page {meta.current_page}/{meta.last_page}</span>
              <button className="btn small secondary" disabled={page >= meta.last_page} onClick={() => { setPage(page + 1); loadBiens(page + 1) }}>Suivant</button>
            </div>
          )}
        </>
      )}

      {tab === 'proprietaires' && (
        <>
          <div className="card">
            <h2><ShieldCheck size={16} /> Vérification des propriétaires</h2>
            <p className="muted">
              Les propriétaires listés ci-dessous publient des annonces sur la plateforme. Vous pouvez valider ou rejeter leur dossier d'identité.
            </p>
          </div>
          <div className="toolbar moderation-toolbar">
            <div className="moderation-search">
              <Search size={15} />
              <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher par nom, email, téléphone…" />
            </div>
            <select value={filtreVerif} onChange={(e) => setFiltreVerif(e.target.value)}>
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="verifiee">Vérifiés</option>
              <option value="rejetee">Rejetés</option>
            </select>
          </div>
          {loadingProps ? (
            <div className="card empty">Chargement des propriétaires…</div>
          ) : proprietairesFiltres.length === 0 ? (
            <div className="card empty">Aucun propriétaire trouvé.</div>
          ) : (
            <div className="table-wrap card">
              <table>
                <thead>
                  <tr>
                    <th>Propriétaire</th>
                    <th>Contact</th>
                    <th>Pièce d'identité</th>
                    <th>Biens</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proprietairesFiltres.map((u) => {
                    const statut = u.verification_status || 'en_attente'
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="owner-cell">
                            {u.photo
                              ? <img className="owner-avatar" src={assetUrl(u.photo)} alt="" />
                              : <span className="owner-avatar initials">{u.name?.charAt(0)?.toUpperCase()}</span>}
                            <div>
                              <strong>{u.name}</strong>
                              <div className="muted owner-sub">Inscrit le {formatDate(u.created_at)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="muted owner-sub"><Mail size={11} /> {u.email}</div>
                          <div className="muted owner-sub"><Phone size={11} /> {u.telephone || '—'}</div>
                        </td>
                        <td>
                          {u.document_path ? (
                            isPdf(u.document_path) ? (
                              <a className="btn small secondary" href={assetUrl(u.document_path)} target="_blank" rel="noreferrer">
                                <FileText size={13} /> Voir le PDF
                              </a>
                            ) : (
                              <button type="button" className="doc-thumb" onClick={() => setApercu(u)} title="Agrandir">
                                <img src={assetUrl(u.document_path)} alt={`Pièce d'identité de ${u.name}`} />
                              </button>
                            )
                          ) : (
                            <span className="muted owner-sub">Non fournie</span>
                          )}
                        </td>
                        <td>{u.nb_proprietes ?? 0}</td>
                        <td><span className={`badge ${VERIF_BADGE[statut] || 'badge-gray'}`}>{label(statut)}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn small" disabled={busy === u.id || statut === 'verifiee'} onClick={() => verifier(u.id, 'valider')}>
                              <Check size={13} /> Valider
                            </button>
                            <button className="btn small danger" disabled={busy === u.id || statut === 'rejetee'} onClick={() => verifier(u.id, 'rejeter')}>
                              <X size={13} /> Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {apercu && (
        <div className="modal-overlay" onClick={() => setApercu(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3><ShieldCheck size={16} /> Pièce d'identité — {apercu.name}</h3>
              <button type="button" className="icon-btn" onClick={() => setApercu(null)}>✕</button>
            </div>
            <div className="modal-body">
              <img className="doc-full" src={assetUrl(apercu.document_path)} alt={`Pièce d'identité de ${apercu.name}`} />
              <div className="form-actions">
                <button className="btn" disabled={busy === apercu.id} onClick={() => { verifier(apercu.id, 'valider'); setApercu(null) }}>
                  <Check size={14} /> Valider l'identité
                </button>
                <button className="btn danger" disabled={busy === apercu.id} onClick={() => { verifier(apercu.id, 'rejeter'); setApercu(null) }}>
                  <X size={14} /> Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejet && (
        <div className="modal-overlay" onClick={() => setRejet(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmerRejet}>
            <div className="modal-head">
              <h3>Rejeter « {rejet.titre} »</h3>
              <button type="button" className="icon-btn" onClick={() => setRejet(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Motif du rejet (envoyé au propriétaire)</label>
                <textarea rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex : photos non conformes, informations incomplètes…" />
              </div>
              <div className="form-actions">
                <button className="btn danger" disabled={busy === rejet.id}>Confirmer le rejet</button>
                <button type="button" className="btn secondary" onClick={() => setRejet(null)}>Annuler</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
