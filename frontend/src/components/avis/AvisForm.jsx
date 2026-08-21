import { useState } from 'react'
import { Star } from 'lucide-react'
import { createAvis } from '../../api/avisApi.js'

export default function AvisForm({ cibleUserId, locationId, onSubmitted }) {
  const [note, setNote] = useState(0)
  const [hover, setHover] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!note) {
      setError('Veuillez choisir une note de 1 à 5 étoiles.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createAvis({
        cible_user_id: cibleUserId,
        location_id: locationId || undefined,
        note,
        commentaire,
      })
      setDone(true)
      onSubmitted?.()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'avis.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return <p className="success">Merci, votre avis a été enregistré.</p>
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h2>Laisser un avis</h2>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star ${n <= (hover || note) ? 'on' : ''}`}
            onClick={() => setNote(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
          >
            <Star size={22} fill="currentColor" />
          </button>
        ))}
        <span className="muted">{note ? `${note}/5` : 'Choisissez une note'}</span>
      </div>
      <div className="form-row">
        <label>Commentaire</label>
        <textarea
          rows={3}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Votre expérience avec cette personne…"
        />
      </div>
      {error && <div className="alert-danger">{error}</div>}
      <div className="form-actions">
        <button className="btn" disabled={busy}>{busy ? 'Envoi…' : "Publier l'avis"}</button>
      </div>
    </form>
  )
}