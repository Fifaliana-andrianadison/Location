import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ChevronRight, Plus, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useBook } from '../../hooks/useBook.js'

const ONGLETS = [
  { label: 'Acheter', to: '/recherche?mode=vente' },
  { label: 'Louer', to: '/recherche?mode=location' },
  { label: 'Terrains', to: '/recherche?type=terrain' },
  { label: 'Vendre', to: '/register?role=proprietaire' },
]

/** Onglet actif selon l'URL courante. */
function ongletActif(pathname, search) {
  const params = new URLSearchParams(search)
  if (pathname === '/register' && params.get('role') === 'proprietaire') return 'Vendre'
  if (params.get('type') === 'terrain') return 'Terrains'
  if (params.get('mode') === 'vente') return 'Acheter'
  if (params.get('mode') === 'location') return 'Louer'
  return 'Acheter'
}

const TITRES = {
  '/login': 'Connexion',
  '/register': 'Inscription',
}

export default function SeLogerHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { go } = useBook()
  const actif = ongletActif(location.pathname, location.search)
  const titre = TITRES[location.pathname] ?? 'Immobilier'

  const aller = (e, to) => {
    // Les onglets mènent vers des pages publiques : transition directe.
    e.preventDefault()
    navigate(to)
  }

  return (
    <>
      <header className="slg-header">
        <div className="slg-inner">
          <Link to="/" className="slg-logo" onClick={(e) => go(e, '/')}>
            <span className="slg-logo-mark">T&amp;T</span>
            <span className="slg-logo-name">Tany<em>&amp;</em>Toerana</span>
          </Link>

          <nav className="slg-nav">
            {ONGLETS.map((o) => (
              <Link
                key={o.label}
                to={o.to}
                className={`slg-nav-link ${actif === o.label ? 'active' : ''}`}
                onClick={(e) => aller(e, o.to)}
              >
                {o.label}
              </Link>
            ))}
          </nav>

          <div className="slg-actions">
            <a href="#" className="slg-band" onClick={(e) => e.preventDefault()}>
              <span className="slg-band-n">1</span>
              <span className="slg-band-lbl">bandeau</span>
              <ChevronDown size={12} />
            </a>

            <Link
              to="/register?role=proprietaire"
              className="slg-depot"
              onClick={(e) => go(e, '/register?role=proprietaire')}
            >
              <Plus size={15} /> Déposer une annonce
            </Link>

            {user ? (
              <Link to="/dashboard" className="slg-compte" onClick={(e) => go(e, '/dashboard')}>
                <User size={15} /> {user.name?.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/login" className="slg-compte" onClick={(e) => go(e, '/login')}>
                <User size={15} /> Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Fil d'Ariane façon SeLoger */}
      <div className="slg-breadcrumb">
        <div className="slg-bc-inner">
          <Link to="/" onClick={(e) => go(e, '/')} className="slg-bc-home" title="Accueil">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="slg-bc-sep" />
          <span className="slg-bc-current">{titre}</span>
        </div>
      </div>
    </>
  )
}
