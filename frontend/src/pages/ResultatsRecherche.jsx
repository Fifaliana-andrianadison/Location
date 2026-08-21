import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SearchBar from '../components/common/SearchBar.jsx'
import FilterPanel from '../components/common/FilterPanel.jsx'
import AnnonceList from '../components/annonce/AnnonceList.jsx'
import MapView from '../components/annonce/MapView.jsx'
import { useAnnonces } from '../hooks/useAnnonces.js'

const TRI = {
  recents: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  prix_asc: (a, b) => a.prix - b.prix,
  prix_desc: (a, b) => b.prix - a.prix,
}

export default function ResultatsRecherche() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, meta, loading, error, search, setPage } = useAnnonces({})

  useEffect(() => {
    const p = Object.fromEntries(searchParams.entries())
    search(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const tri = searchParams.get('tri') || 'recents'
  const triee = useMemo(() => [...(data || [])].sort(TRI[tri] ?? TRI.recents), [data, tri])

  const applyFilters = (p) => {
    const sp = new URLSearchParams(searchParams)
    for (const k of [...sp.keys()]) sp.delete(k)
    Object.entries(p).forEach(([k, v]) => sp.set(k, v))
    setSearchParams(sp)
  }

  const resetFilters = () => {
    navigate('/recherche')
    search({})
  }

  const initial = Object.fromEntries(searchParams.entries())

  const coords = triee
    .map((a) => ({ latitude: a.localisation?.latitude, longitude: a.localisation?.longitude }))
    .filter((c) => c.latitude != null && c.longitude != null)

  return (
    <div className="resultats">
      <div className="resultats-head">
        <div>
          <h1 className="page">Recherche de biens</h1>
          <p className="muted">
            {meta ? `${meta.total} bien(s) trouvé(s)` : 'Affinez votre recherche par budget, type ou localisation.'}
          </p>
        </div>
        {meta && meta.total > 0 && (
          <span className="badge badge-indigo resultats-count">{meta.total} résultats</span>
        )}
      </div>

      <section className="recherche-tools">
        <SearchBar initial={initial} compact />
        <FilterPanel params={initial} onApply={applyFilters} onReset={resetFilters} />
      </section>

      <div className="resultats-layout">
        <div className="resultats-list">
          <AnnonceList data={triee} meta={meta} loading={loading} error={error} onPageChange={setPage} />
        </div>
        <aside className="resultats-map">
          <div className="card">
            <h2>Carte des résultats</h2>
            {coords.length > 0 ? (
              <MapView latitude={coords[0].latitude} longitude={coords[0].longitude} className="map-tall" />
            ) : (
              <p className="muted">Aucun point géolocalisé à afficher.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
