import { useEffect, useState } from 'react'
import PaiementForm from '../components/paiement/PaiementForm.jsx'
import HistoriquePaiements from '../components/paiement/HistoriquePaiements.jsx'
import { getLocations, getPaiements } from '../api/paiementApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatAr, label } from '../utils/format.js'

export default function MesPaiements() {
  const { user } = useAuth()
  const [locations, setLocations] = useState([])
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (user?.role === 'locataire') {
      getLocations()
        .then(({ data }) => setLocations(data.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      getPaiements({ per_page: 50 })
        .then(({ data }) => setPaiements(data.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user, refresh])

  if (loading) {
    return (
      <div className="app-loading" style={{ minHeight: '40vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page">Paiements</h1>

      {user?.role === 'locataire' && (
        <>
          {locations.length === 0 ? (
            <div className="card empty">
              Aucune location active. Signez un contrat de bail pour pouvoir payer votre loyer en ligne.
            </div>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="card">
                <h2>
                  Location #{loc.id} · Propriétaire : {loc.proprietaire?.name} ·{' '}
                  <span className={`badge ${loc.statut === 'actif' ? 'badge-green' : 'badge-gray'}`}>{label(loc.statut)}</span>
                </h2>
                <p className="muted">
                  Loyer mensuel : <strong>{formatAr(loc.montant_loyer)}</strong> · Début : {loc.date_debut?.slice(0, 10)}
                </p>
                {loc.statut === 'actif' && (
                  <PaiementForm
                    location={loc}
                    onPaid={() => setRefresh((r) => r + 1)}
                  />
                )}
                <HistoriquePaiements
                  paiements={loc.paiements}
                  onChanged={() => setRefresh((r) => r + 1)}
                />
              </div>
            ))
          )}
        </>
      )}

      {user?.role === 'proprietaire' && (
        <div className="card">
          <h2>Paiements reçus — à confirmer</h2>
          <p className="muted">Confirmez les paiements Mobile Money de vos locataires.</p>
          <HistoriquePaiements paiements={paiements} onChanged={() => setRefresh((r) => r + 1)} />
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="card">
          <h2>Tous les paiements</h2>
          <HistoriquePaiements paiements={paiements} onChanged={() => setRefresh((r) => r + 1)} />
        </div>
      )}
    </div>
  )
}