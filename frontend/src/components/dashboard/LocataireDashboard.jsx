import { useEffect, useState } from 'react'
import { Home, FileText, CreditCard, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocations } from '../../api/paiementApi.js'
import { getContrats } from '../../api/contratApi.js'
import { formatAr, formatMois, label } from '../../utils/format.js'

export default function LocataireDashboard() {
  const [locations, setLocations] = useState([])
  const [contrats, setContrats] = useState([])

  useEffect(() => {
    getLocations()
      .then(({ data }) => setLocations(data.data ?? []))
      .catch(() => {})
    getContrats()
      .then(({ data }) => setContrats(data.data ?? []))
      .catch(() => {})
  }, [])

  const prochaineEcheance = locations
    .filter((l) => l.statut === 'actif')
    .map((l) => {
      const mois = new Date().toISOString().slice(0, 7)
      const paye = (l.paiements || []).some(
        (p) => p.statut === 'confirme' && (p.mois || '').startsWith(mois)
      )
      return { ...l, paye }
    })

  return (
    <div className="dashboard">
      <h1 className="page">Tableau de bord locataire</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico blue"><Home size={20} /></span>
          <div>
            <div className="stat-value">{locations.filter((l) => l.statut === 'actif').length}</div>
            <div className="stat-label">Locations actives</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><FileText size={20} /></span>
          <div>
            <div className="stat-value">{contrats.length}</div>
            <div className="stat-label">Contrats</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><CreditCard size={20} /></span>
          <div>
            <div className="stat-value">{prochaineEcheance.filter((l) => l.paye).length}/{prochaineEcheance.length}</div>
            <div className="stat-label">Mois en cours payé</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Prochaines échéances</h2>
        {prochaineEcheance.length === 0 ? (
          <p className="muted">Aucune location active pour le moment.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>Propriétaire</th>
                  <th>Loyer mensuel</th>
                  <th>Mois en cours</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prochaineEcheance.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.appartement ? `Appartement #${l.appartement.id}` : 'Location'}</strong></td>
                    <td>{l.proprietaire?.name}</td>
                    <td>{formatAr(l.montant_loyer)}</td>
                    <td>{formatMois(new Date().toISOString().slice(0, 7))}</td>
                    <td>
                      <span className={`badge ${l.paye ? 'badge-green' : 'badge-red'}`}>
                        {l.paye ? 'Payé' : 'À payer'}
                      </span>
                    </td>
                    <td>
                      <Link to="/mes-paiements" className="btn small">Payer</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2>Liens utiles</h2>
          <div className="form-actions">
            <Link to="/recherche" className="btn">Rechercher un logement</Link>
            <Link to="/mes-candidatures" className="btn secondary">Mes candidatures</Link>
          </div>
        </div>
        <div className="card">
          <h2>Besoin d'aide ?</h2>
          <p className="muted">
            <Scale size={13} /> En cas de litige avec votre propriétaire, ouvrez une réclamation.
          </p>
          <Link to="/mes-litiges" className="btn secondary small">Ouvrir un litige</Link>
        </div>
      </div>
    </div>
  )
}