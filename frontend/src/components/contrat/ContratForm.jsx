import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, FilePlus2, FilePen, Save } from 'lucide-react'
import { getCandidatures } from '../../api/candidatureApi.js'
import { createContrat, updateContrat } from '../../api/contratApi.js'
import { formatAr, label } from '../../utils/format.js'

const toInputDate = (d) => (d ? String(d).slice(0, 10) : '')

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

/**
 * Création (à partir d'une candidature) ou modification d'un contrat de bail.
 */
export default function ContratForm({ contrat = null, onClose, onSaved }) {
  const edition = Boolean(contrat)
  const aujourdHui = new Date().toISOString().slice(0, 10)

  const [candidatures, setCandidatures] = useState([])
  const [candidatureId, setCandidatureId] = useState('')
  const [form, setForm] = useState(() => ({
    date_debut: toInputDate(contrat?.date_debut) || aujourdHui,
    date_fin: toInputDate(contrat?.date_fin) || addMonths(aujourdHui, 12),
    loyer_mensuel: contrat?.loyer_mensuel ?? '',
    caution: contrat?.caution ?? '',
    conditions: contrat?.conditions ?? '',
  }))
  const [loading, setLoading] = useState(!edition)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (edition) return
    getCandidatures({ per_page: 100 })
      .then(({ data }) => {
        const list = (data.data ?? []).filter((c) => c.statut !== 'refusee' && c.annonce && c.locataire)
        // Candidatures acceptées en premier.
        list.sort((a, b) => (a.statut === 'acceptee' ? -1 : 0) - (b.statut === 'acceptee' ? -1 : 0))
        setCandidatures(list)
      })
      .catch(() => setError('Impossible de charger vos candidatures.'))
      .finally(() => setLoading(false))
  }, [edition])

  const candidature = useMemo(
    () => candidatures.find((c) => String(c.id) === String(candidatureId)),
    [candidatures, candidatureId]
  )

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const choisirCandidature = (e) => {
    const id = e.target.value
    setCandidatureId(id)
    const c = candidatures.find((x) => String(x.id) === String(id))
    if (c?.annonce) {
      setForm((f) => ({
        ...f,
        loyer_mensuel: f.loyer_mensuel || c.annonce.prix || '',
        caution: f.caution || (c.annonce.prix ? c.annonce.prix * 2 : ''),
      }))
    }
  }

  const duree = (mois) => setForm((f) => ({ ...f, date_fin: addMonths(f.date_debut, mois) }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!edition && !candidature) {
      setError('Choisissez le locataire et le bien concernés.')
      return
    }
    setBusy(true)
    const payload = {
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      loyer_mensuel: Number(form.loyer_mensuel),
      caution: form.caution === '' ? 0 : Number(form.caution),
      conditions: form.conditions?.trim() || null,
    }
    try {
      const { data } = edition
        ? await updateContrat(contrat.id, payload)
        : await createContrat({ ...payload, annonce_id: candidature.annonce.id, locataire_id: candidature.locataire.id })
      onSaved?.(data)
    } catch (err) {
      const errs = err.response?.data?.errors
      setError((errs && Object.values(errs).flat()[0]) || err.response?.data?.message || "L'enregistrement a échoué.")
    } finally {
      setBusy(false)
    }
  }

  const dejaSigne = edition && (contrat.signe_proprietaire || contrat.signe_locataire)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal-wide contrat-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>
            {edition ? <FilePen size={17} /> : <FilePlus2 size={17} />}
            {edition ? `Modifier le contrat CB-${String(contrat.id).padStart(5, '0')}` : 'Nouveau contrat de bail'}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modal-body">
          {dejaSigne && (
            <div className="contrat-warning">
              <AlertTriangle size={16} />
              <span>Ce contrat a déjà été signé par une partie. L'enregistrement des modifications <strong>annulera les signatures</strong> : les deux parties devront signer à nouveau.</span>
            </div>
          )}

          <section className="contrat-form-section">
            <h4><span>1</span> Parties et bien</h4>
            {edition ? (
              <div className="contrat-form-recap">
                <div><span className="muted">Bien</span><strong>{contrat.annonce?.titre || '—'}</strong></div>
                <div><span className="muted">Locataire</span><strong>{contrat.locataire?.name || '—'}</strong></div>
              </div>
            ) : loading ? (
              <p className="muted">Chargement de vos candidatures…</p>
            ) : candidatures.length === 0 ? (
              <div className="card empty">Aucune candidature reçue pour le moment. Un contrat se crée à partir de la candidature d'un locataire.</div>
            ) : (
              <div className="form-row">
                <label>Candidature (locataire · bien)</label>
                <select value={candidatureId} onChange={choisirCandidature} required>
                  <option value="">— Sélectionnez une candidature —</option>
                  {candidatures.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.locataire.name} · {c.annonce.titre} ({label(c.statut)})
                    </option>
                  ))}
                </select>
                {candidature && (
                  <div className="contrat-form-recap">
                    <div><span className="muted">Locataire</span><strong>{candidature.locataire.name}</strong><small className="muted">{candidature.locataire.email}</small></div>
                    <div><span className="muted">Bien</span><strong>{candidature.annonce.titre}</strong><small className="muted">Prix affiché : {formatAr(candidature.annonce.prix)}</small></div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="contrat-form-section">
            <h4><span>2</span> Durée du bail</h4>
            <div className="form-grid">
              <div className="form-row">
                <label>Date de début</label>
                <input type="date" value={form.date_debut} onChange={set('date_debut')} required />
              </div>
              <div className="form-row">
                <label>Date de fin</label>
                <input type="date" value={form.date_fin} min={form.date_debut} onChange={set('date_fin')} required />
              </div>
            </div>
            <div className="duree-chips">
              <span className="muted">Durée rapide :</span>
              {[6, 12, 24, 36].map((m) => (
                <button type="button" key={m} className="chip-btn" onClick={() => duree(m)}>{m} mois</button>
              ))}
            </div>
          </section>

          <section className="contrat-form-section">
            <h4><span>3</span> Conditions financières</h4>
            <div className="form-grid">
              <div className="form-row">
                <label>Loyer mensuel (Ar)</label>
                <input type="number" min="0" step="1000" value={form.loyer_mensuel} onChange={set('loyer_mensuel')} required />
              </div>
              <div className="form-row">
                <label>Caution (Ar)</label>
                <input type="number" min="0" step="1000" value={form.caution} onChange={set('caution')} placeholder="0" />
              </div>
              <div className="form-row full">
                <label>Conditions particulières (facultatif)</label>
                <textarea
                  rows={4}
                  value={form.conditions}
                  onChange={set('conditions')}
                  placeholder="Ex : charges d'eau incluses, animaux non autorisés, paiement avant le 5 de chaque mois…"
                />
              </div>
            </div>
          </section>

          {error && <div className="alert-danger">{error}</div>}

          <div className="form-actions">
            <button className="btn" disabled={busy || (!edition && candidatures.length === 0)}>
              <Save size={14} /> {busy ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Créer et envoyer au locataire'}
            </button>
            <button type="button" className="btn secondary" onClick={onClose}>Annuler</button>
          </div>
        </div>
      </form>
    </div>
  )
}
