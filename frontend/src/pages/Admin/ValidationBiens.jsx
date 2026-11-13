import { useEffect, useState } from 'react'
import { Check, X, ShieldCheck } from 'lucide-react'
import { getValidations, validerPropriete, rejeterPropriete, verifierProprietaire } from '../../api/adminApi.js'
import { getAnnonces } from '../../api/annonceApi.js'
import { assetUrl, formatAr, TYPE_LABELS, MODE_LABELS } from '../../utils/format.js'

export default function ValidationBiens() {
  const [tab, setTab] = useState('biens')
  const [proprietes, setProprietes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [proprietaires, setProprietaires] = useState([])
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

  const loadProprietaires = async () => {
    let page = 1
    let all = []
    try {
      while (true) {
        const { data } = await getAnnonces({ page, per_page: 100 })
        all = all.concat(data.data ?? [])
        if (!data.meta || page >= data.meta.last_page) break
        page++
      }
      const uniques = new Map()
      all.forEach((a) => {
        if (a.proprietaire?.id) {
          if (!uniques.has(a.proprietaire.id)) {
            uniques.set(a.proprietaire.id, { ...a.proprietaire, nb_annonces: 0 })
          }
          uniques.get(a.proprietaire.id).nb_annonces++
        }
      })
      setProprietaires([...uniques.values()])
    } catch {
      setError('Erreur de chargement des propriétaires.')
    }
  }

  useEffect(() => {
    if (tab === 'biens') loadBiens(1)
    else loadProprietaires()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

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
          Propriétaires ({proprietaires.length})
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
          {proprietaires.length === 0 ? (
            <div className="card empty">Aucun propriétaire trouvé.</div>
          ) : (
            <div className="table-wrap card">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Annonces publiées</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proprietaires.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.telephone || '—'}</td>
                      <td>{u.nb_annonces}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn small" disabled={busy === u.id} onClick={() => verifier(u.id, 'valider')}>
                            <Check size={13} /> Valider
                          </button>
                          <button className="btn small danger" disabled={busy === u.id} onClick={() => verifier(u.id, 'rejeter')}>
                            <X size={13} /> Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
