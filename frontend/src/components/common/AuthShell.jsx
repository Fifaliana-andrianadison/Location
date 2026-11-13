import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AuthScene from './AuthScene.jsx'
import { useBook } from '../../hooks/useBook.js'

/**
 * Coquille des pages Connexion / Inscription :
 * - panneau gauche : scène animée (maisons + recherche de bien)
 * - panneau droit : formulaire dans un « livre » qui se tourne (rotation 3D)
 *   quand on passe de /login à /register et inversement.
 */
export default function AuthShell({ children, to = '/register' }) {
  const { turning, go } = useBook()
  const isRegister = to === '/register'

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <AuthScene />
      </div>

      <div className="auth-panel">
        <div className={`auth-book ${turning ? `turning-${turning}` : ''}`}>
          <div className="auth-page-face">
            {children}

            <p className="auth-alt">
              {isRegister ? (
                <>Pas encore de compte ? <Link to={to} onClick={(e) => go(e, to)}>Créez un compte gratuit</Link></>
              ) : (
                <>Déjà inscrit ? <Link to="/login" onClick={(e) => go(e, '/login')}>Connectez-vous</Link></>
              )}
            </p>

            <button type="button" className="auth-switch" onClick={(e) => go(e, isRegister ? to : '/login')}>
              {isRegister ? (
                <><BookOpenIcon /> Créer un compte <ArrowRight size={14} /></>
              ) : (
                <><ArrowLeft size={14} /> Retour à la connexion</>
              )}
            </button>
          </div>
        </div>

        <div className="auth-book-shadow" />
      </div>
    </div>
  )
}

function BookOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
