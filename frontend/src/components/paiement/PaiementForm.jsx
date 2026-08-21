import { useState } from 'react'
import { Smartphone, Send } from 'lucide-react'
import { createPaiement } from '../../api/paiementApi.js'
import { formatAr } from '../../utils/format.js'

const METHODES = {
  mvola: 'MVola',
  orange_money: 'Orange Money',
  airtel_money: 'Airtel Money',
  especes: 'Espèces',
  virement: 'Virement bancaire',
}

export default function PaiementForm({ location, onPaid }) {
  const [mois, setMois] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [montant, setMontant] = useState(location?.montant_loyer ?? '')
  const [methode, setMethode] = useState('mvola')
  const [telephone, setTelephone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const estMobile = ['mvola', 'orange_money', 'airtel_money'].includes(methode)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDone('')
    try {
      const { data } = await createPaiement(location.id, {
        mois,
        montant: Number(montant),
        methode,
        telephone: estMobile ? telephone : undefined,
      })
      setDone(`Paiement enregistré — référence ${data.reference}. En attente de confirmation du propriétaire.`)
      onPaid?.()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement du paiement.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h2>Payer le loyer — {location.locataire?.name ? `Location avec ${location.proprietaire?.name}` : ''}</h2>
      <form className="form" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-row">
            <label>Mois concerné</label>
            <input type="month" value={mois} onChange={(e) => setMois(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Montant (Ar)</label>
            <input
              type="number"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder={location?.montant_loyer ? formatAr(location.montant_loyer) : '0'}
              required
            />
          </div>
          <div className="form-row">
            <label>Méthode de paiement</label>
            <select value={methode} onChange={(e) => setMethode(e.target.value)}>
              {Object.entries(METHODES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {estMobile ? (
            <div className="form-row">
              <label><Smartphone size={13} /> Numéro {METHODES[methode]}</label>
              <input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="034 00 000 00"
                required
              />
            </div>
          ) : (
            <div className="form-row">
              <label>Méthode</label>
              <p className="muted" style={{ margin: 0, alignSelf: 'center' }}>{METHODES[methode]}</p>
            </div>
          )}
        </div>
        {error && <div className="alert-danger">{error}</div>}
        {done && <p className="success">{done}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}>
            <Send size={15} /> {busy ? 'Envoi…' : 'Effectuer le paiement'}
          </button>
        </div>
      </form>
    </div>
  )
}