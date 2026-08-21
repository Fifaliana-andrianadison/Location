import { useState } from 'react'
import { Send } from 'lucide-react'
import DocumentUpload from './DocumentUpload.jsx'
import { createCandidature } from '../../api/candidatureApi.js'

export default function CandidatureForm({ annonceId }) {
  const [message, setMessage] = useState('')
  const [budget, setBudget] = useState('')
  const [documents, setDocuments] = useState([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const fd = new FormData()
    fd.append('annonce_id', annonceId)
    fd.append('message', message)
    if (budget) fd.append('budget', budget)
    documents.forEach((f) => fd.append('documents[]', f))
    try {
      await createCandidature(fd)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la candidature.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="card success" style={{ textAlign: 'center' }}>
        <h2>Candidature envoyée !</h2>
        <p className="success">Votre candidature a bien été transmise au propriétaire. Suivez-la dans « Mes candidatures ».</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Postuler à ce bien</h2>
      <p className="muted">Envoyez votre candidature avec éventuellement vos documents (CIN, justificatif de revenus, etc.).</p>
      <form className="form" onSubmit={submit}>
        <div className="form-row">
          <label>Message au propriétaire</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Présentez-vous, votre situation actuelle, vos besoins…"
            required
          />
        </div>
        <div className="form-row">
          <label>Budget mensuel proposé (Ar)</label>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ex : 800000"
          />
        </div>
        <DocumentUpload onChange={setDocuments} />
        {error && <div className="alert-danger">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn" disabled={busy}>
            <Send size={15} /> {busy ? 'Envoi…' : 'Envoyer ma candidature'}
          </button>
        </div>
      </form>
    </div>
  )
}