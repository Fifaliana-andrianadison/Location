import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, Power } from 'lucide-react'
import { getAlertes, createAlerte, updateAlerte, deleteAlerte } from '../api/alerteApi.js'
import { formatAr, TYPE_LABELS, MODE_LABELS } from '../utils/format.js'
import { useAuth } from '../context/AuthContext.jsx'

const VIDES = { budget_min: '', budget_max: '', type: '', mode: '', ville: '', quartier: '' }

export default function MesAlertes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [alertes, setAlertes] = useState([])
  const [form, setForm] = useState(VIDES)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    getAlertes()
      .then(({ data }) => setAlertes(data ?? []))
      .catch(() => setError('Erreur de chargement des alertes.'))
  }

  useEffect(() => {
    load()
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    const payload = { ...form }
    if (!payload.budget_min) delete payload.budget_min
    if (!payload.budget_max) delete payload.budget_max
    try {
      await createAlerte(payload)
      setForm(VIDES)
      setSuccess("Alerte créée : vous serez notifié dès qu'un bien correspond à vos critères.")
      load()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'alerte.")
    } finally {
      setBusy(false)
    }
  }

  const toggleActif = async (a) => {
    await updateAlerte(a.id, { actif: !a.actif })
    load()
  }

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cette alerte ?')) return
    await deleteAlerte(id)
    load()
  }

  return (
    <div className="page">
      <h1 className="page">Mes alertes de recherche</h1>
      {isAdmin ? (
        <form className="card" onSubmit={submit}>
          <h2><Bell size={16} /> Créer une alerte</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Budget min (Ar)</label>
            <input type="number" min="0" value={form.budget_min} onChange={set('budget_min')} placeholder="100 000" />
          </div>
          <div className="form-row">
            <label>Budget max (Ar)</label>
            <input type="number" min="0" value={form.budget_max} onChange={set('budget_max')} placeholder="5 000 000" />
          </div>
          <div className="form-row">
            <label>Type</label>
            <select value={form.type} onChange={set('type')}>
              <option value="">Tous</option>
              <option value="maison">Maison</option>
              <option value="appartement">Appartement</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div className="form-row">
            <label>Mode</label>
            <select value={form.mode} onChange={set('mode')}>
              <option value="">Tous</option>
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>
          </div>
          <div className="form-row">
            <label>Ville</label>
            <input value={form.ville} onChange={set('ville')} placeholder="Antananarivo" />
          </div>
          <div className="form-row">
            <label>Quartier</label>
            <input value={form.quartier} onChange={set('quartier')} placeholder="Ivandry" />
          </div>
        </div>
        {error && <div className="alert-danger">{error}</div>}
        {success && <p className="success">{success}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}><Plus size={15} /> {busy ? 'Création…' : "Créer l'alerte"}</button>
        </div>
      </form>
      ) : (
        <div className="card empty">Seul l'administrateur peut créer des alertes.</div>
      )}

      {alertes.length > 0 ? (
        <div className="grid">
          {alertes.map((a) => (
            <div key={a.id} className="card alerte-card">
              <div className="alerte-head">
                <strong>
                  {a.budget_min || a.budget_max
                    ? `${a.budget_min ? formatAr(a.budget_min) : '—'} – ${a.budget_max ? formatAr(a.budget_max) : '∞'}`
                    : 'Sans budget'}
                </strong>
                <span className={`badge ${a.actif ? 'badge-green' : 'badge-gray'}`}>{a.actif ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="muted">
                {[TYPE_LABELS[a.type], MODE_LABELS[a.mode], a.ville, a.quartier].filter(Boolean).join(' · ') || 'Tous les biens'}
              </p>
              <div className="form-actions">
                <button className="btn small secondary" onClick={() => toggleActif(a)}>
                  <Power size={13} /> {a.actif ? 'Désactiver' : 'Activer'}
                </button>
                <button className="btn small danger" onClick={() => supprimer(a.id)}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty">Aucune alerte. Créez-en une pour être prévenu automatiquement.</div>
      )}
    </div>
  )
}