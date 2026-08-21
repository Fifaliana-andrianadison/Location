import { useEffect, useState } from 'react'
import { Users, Building2, Home, FileText, ListChecks, Wallet, Scale, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStatistiquesAdmin } from '../../api/adminApi.js'
import { getValidations } from '../../api/adminApi.js'
import { formatAr } from '../../utils/format.js'

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