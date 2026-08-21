import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateRoute({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role !== role) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: '3rem auto', textAlign: 'center' }}>
        <h2>Accès refusé</h2>
        <p className="muted">Cette page est réservée au rôle « {role} ».</p>
        <button className="btn" onClick={() => (window.location.href = '/')}>
          Retour à l'accueil
        </button>
      </div>
    )
  }

  return children
}
