import { useEffect, useState } from 'react'
import { Building2, Globe, Clock, Home, Users, Wallet, AlertTriangle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStatsProprietaire } from '../../api/proprieteApi.js'
import { getCandidatures } from '../../api/candidatureApi.js'
import { formatAr } from '../../utils/format.js'

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