import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, KeyRound, MapPin, Search, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SearchBar({ initial = {}, compact = false, authRequired = false, onSubmit }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [budgetMin, setBudgetMin] = useState(initial.budget_min ?? '')
  const [budgetMax, setBudgetMax] = useState(initial.budget_max ?? '')
  const [type, setType] = useState(initial.type ?? '')
  const [mode, setMode] = useState(initial.mode ?? '')
  const [ville, setVille] = useState(initial.ville ?? '')
  const [quartier, setQuartier] = useState(initial.quartier ?? '')

  const submit = (e) => {
    e.preventDefault()
    if (authRequired && !user) {
      navigate('/login')
      return
    }
    if (onSubmit) {
      onSubmit({
        budget_min: budgetMin || undefined,
        budget_max: budgetMax || undefined,
        type: type || undefined,
        mode: mode || undefined,
        ville: ville.trim() || undefined,
        quartier: quartier.trim() || undefined,
      })
      return
    }
    const params = new URLSearchParams()
    if (budgetMin) params.set('budget_min', budgetMin)
    if (budgetMax) params.set('budget_max', budgetMax)
    if (type) params.set('type', type)
    if (mode) params.set('mode', mode)
    if (ville.trim()) params.set('ville', ville.trim())
    if (quartier.trim()) params.set('quartier', quartier.trim())
    navigate(`/recherche?${params.toString()}`)
  }

  return (
    <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={submit}>
      <div className="sb-field">
        <label>Votre budget (Ar)</label>
        <div className="sb-input">
          <Wallet size={15} />
          <input
            type="number"
            min="0"
            step="10000"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="min 100 000"
          />
          <span className="sb-divider">à</span>
          <input
            type="number"
            min="0"
            step="10000"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="max 5 000 000"
          />
        </div>
      </div>

      <div className="sb-field">
        <label>Type de bien</label>
        <div className="sb-input">
          <Home size={15} />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>

      <div className="sb-field">
        <label>Mode</label>
        <div className="sb-input">
          <KeyRound size={15} />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Tous</option>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
        </div>
      </div>

      <div className="sb-field">
        <label>Ville</label>
        <div className="sb-input">
          <MapPin size={15} />
          <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Antananarivo…" />
        </div>
      </div>

      <div className="sb-field">
        <label>Quartier</label>
        <div className="sb-input">
          <MapPin size={15} />
          <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ivandry…" />
        </div>
      </div>

      <button type="submit" className="btn sb-submit">
        <Search size={16} /> Rechercher
      </button>
    </form>
  )
}