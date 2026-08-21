import { useEffect, useState } from 'react'
import { Scale, Plus } from 'lucide-react'
import { getLitiges, createLitige } from '../api/litigeApi.js'
import { getLocations } from '../api/paiementApi.js'
import { formatDate, label } from '../utils/format.js'

const MOTIFS = [
  'Non-paiement de loyer',
  'Dégradation du bien',
  'Problème de caution',
  'Harcèlement',
  'Autre',
]

export default function MonLitiges() {
  const [litiges, setLitiges] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ location_id: '', motif: MOTIFS[0], description: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    getLitiges({ per_page: 50 })
      .then(({ data }) => setLitiges(data.data ?? []))
      .catch(() => {})
    getLocations({ per_page: 50 })
      .then(({ data }) => setLocations(data.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await createLitige({
        location_id: form.location_id || undefined,
        motif: form.motif,
        description: form.description,
      })
      setSuccess('Litige ouvert. Notre équipe va vous recontacter.')
      setForm({ location_id: '', motif: MOTIFS[0], description: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ouverture du litige.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page">Mes litiges</h1>

      <form className="card" onSubmit={submit}>
        <h2><Scale size={16} /> Ouvrir un litige</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Location concernée</label>
            <select
              value={form.location_id}
              onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))}
            >
              <option value="">— Sans objet —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  Location #{l.id} · {l.proprietaire?.name} / {l.locataire?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Motif</label>
            <select value={form.motif} onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}>
              {MOTIFS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-row full">
            <label>Description détaillée *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez les faits, les dates, les personnes concernées…"
              required
            />
          </div>
        </div>
        {error && <div className="alert-danger">{error}</div>}
        {success && <p className="success">{success}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}><Plus size={15} /> {busy ? 'Envoi…' : 'Ouvrir le litige'}</button>
        </div>
      </form>

      <h2 style={{ margin: '1rem 0 0.5rem' }}>Mes réclamations</h2>
      {litiges.length === 0 ? (
        <div className="card empty">Aucun litige ouvert.</div>
      ) : (
        <div className="grid">
          {litiges.map((l) => (
            <div key={l.id} className="card">
              <div className="alerte-head">
                <strong>{l.motif}</strong>
                <span className={`badge ${l.statut === 'resolu' ? 'badge-green' : l.statut === 'en_cours' ? 'badge-blue' : 'badge-amber'}`}>
                  {label(l.statut)}
                </span>
              </div>
              <p className="muted">{l.description}</p>
              <p className="muted">
                Ouvert le {formatDate(l.created_at)}
                {l.location ? ` · Location #${l.location.id}` : ''}
              </p>
              {l.resolution && (
                <p><strong>Résolution :</strong> {l.resolution}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}