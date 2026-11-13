import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SearchBar({ initial = {}, compact = false, authRequired = false, onSubmit }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState(initial.mode ?? 'location')
  const [type, setType] = useState(initial.type ?? '')
  const [ville, setVille] = useState(initial.ville ?? '')
  const [quartier, setQuartier] = useState(initial.quartier ?? '')
  const [budgetMin, setBudgetMin] = useState(initial.budget_min ?? '')
  const [budgetMax, setBudgetMax] = useState(initial.budget_max ?? '')

  const submit = (e) => {
    e.preventDefault()
    if (authRequired && !user) {
      navigate('/login')
      return
    }
    const payload = {
      mode: mode || undefined,
      type: type || undefined,
      ville: ville.trim() || undefined,
      quartier: quartier.trim() || undefined,
      budget_min: budgetMin || undefined,
      budget_max: budgetMax || undefined,
    }
    if (onSubmit) {
      onSubmit(payload)
      return
    }
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([k, v]) => v && params.set(k, v))
    navigate(`/recherche?${params.toString()}`)
  }

  return (
    <div className={`sl-search ${compact ? 'compact' : ''}`}>
      <div className="sl-tabs">
        <button
          type="button"
          className={mode === 'location' ? 'active' : ''}
          onClick={() => setMode('location')}
        >
          Louer
        </button>
        <button
          type="button"
          className={mode === 'vente' ? 'active' : ''}
          onClick={() => setMode('vente')}
        >
          Acheter
        </button>
      </div>
      <form className="sl-search-bar" onSubmit={submit}>
        <div className="sl-field">
          <label>Type de bien</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Appartement, maison…</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison / Villa</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
        <div className="sl-field">
          <label><MapPin size={12} /> Ville</label>
          <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Antananarivo…" list="sl-villes" />
          <datalist id="sl-villes">
            <option value="Antananarivo" />
            <option value="Toamasina" />
            <option value="Antsirabe" />
            <option value="Mahajanga" />
            <option value="Fianarantsoa" />
            <option value="Nosy Be" />
          </datalist>
        </div>
        <div className="sl-field">
          <label><MapPin size={12} /> Quartier</label>
          <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ivandry, Ankorondrano…" />
        </div>
        <div className="sl-field">
          <label>Somme min (Ar)</label>
          <input type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="200000" />
        </div>
        <div className="sl-field">
          <label>Somme max (Ar)</label>
          <input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="500000" />
        </div>
        <button type="submit" className="sl-submit">
          <Search size={17} /> Rechercher
        </button>
      </form>
    </div>
  )
}