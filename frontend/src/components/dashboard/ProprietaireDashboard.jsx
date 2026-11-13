import { useEffect, useState } from 'react'
import { Building2, Globe, Clock, Home, Users, Wallet, AlertTriangle, FileText, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStatsProprietaire } from '../../api/proprieteApi.js'
import { getCandidatures } from '../../api/candidatureApi.js'
import { formatAr } from '../../utils/format.js'
import { Bar, PieChart, LineChart } from './Charts.jsx'

export default function ProprietaireDashboard() {
  const [stats, setStats] = useState(null)
  const [candidatures, setCandidatures] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getStatsProprietaire()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Impossible de charger vos statistiques.'))
    getCandidatures({ statut: 'en_attente' })
      .then(({ data }) => setCandidatures(data.data ?? []))
      .catch(() => {})
  }, [])

  if (error) return <div className="alert-danger">{error}</div>
  if (!stats) {
    return (
      <div className="app-loading" style={{ minHeight: '40vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1 className="page">Tableau de bord propriétaire</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico indigo"><Building2 size={20} /></span>
          <div>
            <div className="stat-value">{stats.proprietes.total}</div>
            <div className="stat-label">Propriétés</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Globe size={20} /></span>
          <div>
            <div className="stat-value">{stats.proprietes.annonces_en_ligne}</div>
            <div className="stat-label">Annonces en ligne</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico amber"><Clock size={20} /></span>
          <div>
            <div className="stat-value">{stats.proprietes.en_attente}</div>
            <div className="stat-label">En attente de validation</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico blue"><Home size={20} /></span>
          <div>
            <div className="stat-value">{stats.locations.actives}</div>
            <div className="stat-label">Locations actives</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico green"><Users size={20} /></span>
          <div>
            <div className="stat-value">{stats.locations.locataires}</div>
            <div className="stat-label">Locataires</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico indigo"><Wallet size={20} /></span>
          <div>
            <div className="stat-value">{formatAr(stats.finances.revenus_total)}</div>
            <div className="stat-label">Revenus confirmés</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico red"><AlertTriangle size={20} /></span>
          <div>
            <div className="stat-value">{formatAr(stats.finances.impayes)}</div>
            <div className="stat-label">Impayés estimés</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ico amber"><FileText size={20} /></span>
          <div>
            <div className="stat-value">{stats.candidatures_en_attente}</div>
            <div className="stat-label">Candidatures en attente</div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2><BarChart3 size={15} /> Biens & annonces</h2>
          <Bar label="Propriétés totales" value={stats.proprietes.total} max={Math.max(stats.proprietes.total, 1)} color="#4f46e5" />
          <Bar label="Annonces en ligne" value={stats.proprietes.annonces_en_ligne} max={Math.max(stats.proprietes.total, 1)} color="#10b981" />
          <Bar label="En attente de validation" value={stats.proprietes.en_attente} max={Math.max(stats.proprietes.total, 1)} color="#f59e0b" />
          <Bar label="Locations actives" value={stats.locations.actives} max={Math.max(stats.proprietes.total, 1)} color="#3b82f6" />
        </div>
        <div className="card">
          <h2><Wallet size={15} /> Finances</h2>
          <Bar label="Revenus confirmés" value={stats.finances.revenus_total} max={Math.max(stats.finances.revenus_total + stats.finances.impayes, 1)} color="#10b981" />
          <Bar label="Impayés estimés" value={stats.finances.impayes} max={Math.max(stats.finances.revenus_total + stats.finances.impayes, 1)} color="#ef4444" />
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Taux de recouvrement : {stats.finances.revenus_total + stats.finances.impayes > 0
              ? Math.round((stats.finances.revenus_total / (stats.finances.revenus_total + stats.finances.impayes)) * 100)
              : 0}%
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2><PieIcon size={15} /> Répartition des biens</h2>
          <PieChart
            data={[
              { label: 'Annonces en ligne', value: stats.proprietes.annonces_en_ligne, color: '#10b981' },
              { label: 'En attente', value: stats.proprietes.en_attente, color: '#f59e0b' },
              { label: 'Autres', value: Math.max(stats.proprietes.total - stats.proprietes.annonces_en_ligne - stats.proprietes.en_attente, 0), color: '#94a3b8' },
            ]}
          />
        </div>
        <div className="card">
          <h2><LineIcon size={15} /> Tendance financière</h2>
          <LineChart
            values={[stats.finances.impayes, stats.finances.revenus_total]}
            labels={['Impayés', 'Revenus']}
            color="#4f46e5"
          />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="card">
          <h2>Actions rapides</h2>
          <div className="form-actions">
            <Link to="/ajouter-propriete" className="btn">Ajouter une propriété</Link>
            <Link to="/mes-proprietes" className="btn secondary">Gérer mes biens</Link>
            <Link to="/mes-paiements" className="btn secondary">Paiements à confirmer</Link>
          </div>
        </div>
        <div className="card">
          <h2>Dernières candidatures reçues</h2>
          {candidatures.length === 0 ? (
            <p className="muted">Aucune candidature en attente.</p>
          ) : (
            <ul className="simple-list">
              {candidatures.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <span className="avatar">{c.locataire?.name?.charAt(0)}</span>
                  <div>
                    <strong>{c.locataire?.name}</strong>
                    <span className="muted">pour « {c.annonce?.titre} »</span>
                  </div>
                  <Link to="/mes-candidatures" className="btn small secondary">Voir</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}