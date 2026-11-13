import { useEffect, useState } from 'react'
import { Users, Building2, Home, FileText, ListChecks, Wallet, Scale, ShieldCheck, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStatistiquesAdmin } from '../../api/adminApi.js'
import { getValidations } from '../../api/adminApi.js'
import { formatAr } from '../../utils/format.js'
import { Bar, PieChart, LineChart } from './Charts.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [enAttente, setEnAttente] = useState(0)

  useEffect(() => {
    getStatistiquesAdmin()
      .then(({ data }) => setStats(data))
      .catch(() => {})
    getValidations({ per_page: 1 })
      .then(({ data }) => setEnAttente(data.meta?.total ?? 0))
      .catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="app-loading" style={{ minHeight: '40vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1 className="page">Tableau de bord administrateur</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico blue"><Users size={20} /></span>
          <div>
            <div className="stat-value">{stats.utilisateurs.total}</div>
            <div className="stat-label">Utilisateurs ({stats.utilisateurs.proprietaires} prop. · {stats.utilisateurs.locataires} loc.)</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><Building2 size={20} /></span>
          <div>
            <div className="stat-value">{stats.biens.total}</div>
            <div className="stat-label">Biens ({stats.biens.annonces_en_ligne} en ligne)</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico amber"><ShieldCheck size={20} /></span>
          <div>
            <div className="stat-value">{enAttente}</div>
            <div className="stat-label">Biens en attente de validation</div>
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
          <span className="stat-ico blue"><FileText size={20} /></span>
          <div>
            <div className="stat-value">{stats.contrats.total}</div>
            <div className="stat-label">Contrats ({stats.contrats.signes} signés)</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><ListChecks size={20} /></span>
          <div>
            <div className="stat-value">{stats.candidatures.en_attente}</div>
            <div className="stat-label">Candidatures en attente</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Wallet size={20} /></span>
          <div>
            <div className="stat-value">{formatAr(stats.paiements.total)}</div>
            <div className="stat-label">Paiements ({formatAr(stats.paiements.confirme)} confirmés)</div>
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
          <h2><PieIcon size={15} /> Biens par type</h2>
          <PieChart
            data={[
              { label: 'Maisons', value: stats.biens.par_type.maison, color: '#4f46e5' },
              { label: 'Appartements', value: stats.biens.par_type.appartement, color: '#10b981' },
              { label: 'Terrains', value: stats.biens.par_type.terrain, color: '#f59e0b' },
            ]}
            total={stats.biens.total}
          />
        </div>
        <div className="card">
          <h2><BarChart3 size={15} /> Paiements & locations</h2>
          <Bar label="Total paiements" value={stats.paiements.total} max={Math.max(stats.paiements.total, 1)} color="#4f46e5" />
          <Bar label="Confirmés" value={stats.paiements.confirme} max={Math.max(stats.paiements.total, 1)} color="#10b981" />
          <Bar label="En attente" value={stats.paiements.en_attente} max={Math.max(stats.paiements.total, 1)} color="#f59e0b" />
          <Bar label="Locations actives" value={stats.locations.actives} max={Math.max(stats.locations.actives + stats.locations.terminees, 1)} color="#3b82f6" />
          <Bar label="Locations terminées" value={stats.locations.terminees} max={Math.max(stats.locations.actives + stats.locations.terminees, 1)} color="#94a3b8" />
        </div>
      </div>

      <div className="card">
        <h2><LineIcon size={15} /> Tendance paiements</h2>
        <LineChart
          values={[stats.paiements.en_attente, stats.paiements.confirme, stats.paiements.total]}
          labels={['En attente', 'Confirmés', 'Total']}
          color="#4f46e5"
        />
      </div>

      <div className="card">
        <h2>Actions admin</h2>
        <div className="form-actions">
          <Link to="/admin/validations" className="btn">Valider les biens en attente</Link>
          <Link to="/admin/statistiques" className="btn secondary">Statistiques globales</Link>
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          Répartition par type : {stats.biens.par_type.maison} maison(s) · {stats.biens.par_type.appartement} appartement(s) · {stats.biens.par_type.terrain} terrain(s).
        </p>
      </div>
    </div>
  )
}