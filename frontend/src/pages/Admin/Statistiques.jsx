import { useEffect, useState } from 'react'
import { Users, Building2, Home, FileText, ListChecks, Wallet, Scale } from 'lucide-react'
import { getStatistiquesAdmin } from '../../api/adminApi.js'
import { formatAr } from '../../utils/format.js'

export default function Statistiques() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getStatistiquesAdmin()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Impossible de charger les statistiques.'))
  }, [])

  if (error) return <div className="alert-danger">{error}</div>
  if (!stats) {
    return (
      <div className="app-loading" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  const biensParType = [
    { label: 'Maisons', valeur: stats.biens.par_type.maison, couleur: 'indigo' },
    { label: 'Appartements', valeur: stats.biens.par_type.appartement, couleur: 'blue' },
    { label: 'Terrains', valeur: stats.biens.par_type.terrain, couleur: 'green' },
  ]
  const maxBiens = Math.max(1, ...biensParType.map((b) => b.valeur))

  return (
    <div className="page">
      <h1 className="page">Statistiques globales</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico blue"><Users size={20} /></span>
          <div>
            <div className="stat-value">{stats.utilisateurs.total}</div>
            <div className="stat-label">Utilisateurs</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico blue"><Users size={20} /></span>
          <div>
            <div className="stat-value">{stats.utilisateurs.proprietaires}</div>
            <div className="stat-label">Propriétaires</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><Users size={20} /></span>
          <div>
            <div className="stat-value">{stats.utilisateurs.locataires}</div>
            <div className="stat-label">Locataires</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Building2 size={20} /></span>
          <div>
            <div className="stat-value">{stats.biens.total}</div>
            <div className="stat-label">Biens au total</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Home size={20} /></span>
          <div>
            <div className="stat-value">{stats.biens.annonces_en_ligne}</div>
            <div className="stat-label">Annonces en ligne</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico amber"><Home size={20} /></span>
          <div>
            <div className="stat-value">{stats.biens.en_attente}</div>
            <div className="stat-label">Biens en attente</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Home size={20} /></span>
          <div>
            <div className="stat-value">{stats.locations.actives}</div>
            <div className="stat-label">Locations actives</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico gray"><Home size={20} /></span>
          <div>
            <div className="stat-value">{stats.locations.terminees}</div>
            <div className="stat-label">Locations terminées</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><FileText size={20} /></span>
          <div>
            <div className="stat-value">{stats.contrats.total}</div>
            <div className="stat-label">Contrats ({stats.contrats.signes} signés)</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico amber"><ListChecks size={20} /></span>
          <div>
            <div className="stat-value">{stats.candidatures.total}</div>
            <div className="stat-label">Candidatures ({stats.candidatures.en_attente} en attente)</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Wallet size={20} /></span>
          <div>
            <div className="stat-value">{formatAr(stats.paiements.total)}</div>
            <div className="stat-label">Montant total des paiements</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico red"><Scale size={20} /></span>
          <div>
            <div className="stat-value">{stats.litiges.ouverts}</div>
            <div className="stat-label">Litiges ouverts ({stats.litiges.resolus} résolus)</div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2>Répartition des biens par type</h2>
          <div className="chart">
            {biensParType.map((b) => (
              <div key={b.label} className="col">
                <div className="tip" style={{ display: 'none' }} />
                <div
                  className="bar"
                  style={{ height: `${(b.valeur / maxBiens) * 100}%`, background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }}
                />
                <span className="lbl">{b.label} · {b.valeur}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Flux financiers</h2>
          <table>
            <tbody>
              <tr><td>Total encaissé (tous paiements)</td><td><strong>{formatAr(stats.paiements.total)}</strong></td></tr>
              <tr><td>Paiements confirmés</td><td><strong>{formatAr(stats.paiements.confirme)}</strong></td></tr>
              <tr><td>En attente de confirmation</td><td><strong className="badge-amber" style={{ color: '#d97706' }}>{formatAr(stats.paiements.en_attente)}</strong></td></tr>
              <tr><td>Contrats signés</td><td><strong>{stats.contrats.signes} / {stats.contrats.total}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}