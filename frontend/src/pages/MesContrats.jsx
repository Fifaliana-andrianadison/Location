import { useEffect, useState } from 'react'
import ContratViewer from '../components/contrat/ContratViewer.jsx'
import { getContrats } from '../api/contratApi.js'
import { label } from '../utils/format.js'

export default function MesContrats() {
  const [contrats, setContrats] = useState([])
  const [ouvert, setOuvert] = useState(null)
  const [refeshKey, setRefreshKey] = useState(0)

  const load = () => {
    getContrats({ per_page: 50 })
      .then(({ data }) => setContrats(data.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [refeshKey])

  return (
    <div className="page">
      <h1 className="page">Mes contrats</h1>
      {contrats.length === 0 ? (
        <div className="card empty">
          Aucun contrat pour le moment. Les contrats sont créés par le propriétaire après acceptation d'une candidature.
        </div>
      ) : (
        contrats.map((c) => (
          <div key={c.id} className="contrat-list-item" onClick={() => setOuvert(ouvert === c.id ? null : c.id)}>
            <div className="toolbar" style={{ marginBottom: 0, cursor: 'pointer' }}>
              <div>
                <strong>Contrat #{c.id}</strong>
                <span className="muted" style={{ marginLeft: '0.75rem' }}>{c.annonce?.titre || ''}</span>
              </div>
              <span className={`badge ${c.statut === 'signe' || c.statut === 'actif' || c.statut === 'termine' ? 'badge-green' : 'badge-amber'}`}>
                {label(c.statut)}
              </span>
            </div>
            {ouvert === c.id && (
              <ContratViewer contrat={c} onReload={() => setRefreshKey((k) => k + 1)} />
            )}
          </div>
        ))
      )}
    </div>
  )
}