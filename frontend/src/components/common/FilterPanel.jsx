import { useState } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

export default function FilterPanel({ params, onApply, onReset }) {
  const [budgetMin, setBudgetMin] = useState(params.budget_min ?? '')
  const [budgetMax, setBudgetMax] = useState(params.budget_max ?? '')
  const [type, setType] = useState(params.type ?? '')
  const [mode, setMode] = useState(params.mode ?? '')
  const [ville, setVille] = useState(params.ville ?? '')
  const [quartier, setQuartier] = useState(params.quartier ?? '')
  const [tri, setTri] = useState(params.tri ?? 'recents')

  const apply = (e) => {
    e.preventDefault()
    const p = {}
    if (budgetMin) p.budget_min = budgetMin
    if (budgetMax) p.budget_max = budgetMax
    if (type) p.type = type
    if (mode) p.mode = mode
    if (ville.trim()) p.ville = ville.trim()
    if (quartier.trim()) p.quartier = quartier.trim()
    p.tri = tri
    onApply(p)
  }

  const reset = () => {
    setBudgetMin('')
    setBudgetMax('')
    setType('')
    setMode('')
    setVille('')
    setQuartier('')
    setTri('recents')
    onReset()
  }

  return (
    <form className="filter-panel" onSubmit={apply}>
      <div className="filter-head">
        <strong><SlidersHorizontal size={15} /> Filtres avancés</strong>
        <button type="button" className="btn small secondary" onClick={reset}>
          <RotateCcw size={13} /> Réinitialiser
        </button>
      </div>
      <div className="filter-grid">
        <div className="form-row">
          <label>Budget min (Ar)</label>
          <input type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="100 000" />
        </div>
        <div className="form-row">
          <label>Budget max (Ar)</label>
          <input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="5 000 000" />
        </div>
        <div className="form-row">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
        <div className="form-row">
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Tous</option>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
        </div>
        <div className="form-row">
          <label>Ville</label>
          <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Antananarivo" />
        </div>
        <div className="form-row">
          <label>Quartier</label>
          <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ivandry" />
        </div>
        <div className="form-row">
          <label>Trier par</label>
          <select value={tri} onChange={(e) => setTri(e.target.value)}>
            <option value="recents">Plus récents</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
        </div>
        <div className="form-row filter-actions">
          <button type="submit" className="btn">Appliquer</button>
        </div>
      </div>
    </form>
  )
}
