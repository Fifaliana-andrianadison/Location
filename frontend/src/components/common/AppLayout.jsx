import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, Building2, CalendarClock, FileText, Heart, Home, LayoutDashboard,
  ListChecks, LogIn, LogOut, MapPin, Menu, MessageSquare, PlusCircle, Scale, Search,
  ShieldCheck, UserPlus,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'
import ChatBot from './ChatBot.jsx'

const TITRES = {
  '/': 'Accueil',
  '/recherche': 'Recherche',
  '/dashboard': 'Tableau de bord',
  '/mes-candidatures': 'Mes candidatures',
  '/mes-favoris': 'Mes favoris',
  '/mes-alertes': 'Mes alertes',
  '/messagerie': 'Messagerie',
  '/mes-paiements': 'Mes paiements',
  '/mes-contrats': 'Mes contrats',
  '/mes-litiges': 'Mes litiges',
  '/notifications': 'Notifications',
  '/mes-proprietes': 'Mes propriétés',
  '/ajouter-propriete': 'Ajouter une propriété',
  '/admin/validations': 'Validation & modération',
  '/admin/statistiques': 'Statistiques globales',
}

function Item({ to, icon, label, count, onClick, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')} onClick={onClick}>
      {icon}
      <span className="sb-label">{label}</span>
      {count > 0 && <span className="sb-count">{count}</span>}
    </NavLink>
  )
}

export default function AppLayout({ children }) {
  const { user, signOut } = useAuth()
  const { count } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const fermer = () => setOpen(false)

  const titre =
    Object.entries(TITRES).find(([k]) => k === location.pathname)?.[1]
    ?? (location.pathname.startsWith('/annonces/') ? 'Détail du bien' : 'Tany & Toerana')

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const role = user?.role
  const roleLabel = role === 'admin' ? 'Administrateur' : role === 'proprietaire' ? 'Propriétaire' : 'Locataire'

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="logo"><MapPin size={17} /></span>
          <span className="brand-name">Tany &amp; Toerana</span>
        </div>

        <nav>
          <div className="sidebar-nav-top">
            <div className="section-label">Explorer</div>
            <Item to="/" end icon={<Home size={16} />} label="Accueil" onClick={fermer} />
            <Item to="/recherche" icon={<Search size={16} />} label="Rechercher un bien" onClick={fermer} />
          </div>

          {user ? (
            <>
              <div className="section-label">Mon espace</div>
              <Item to="/dashboard" icon={<LayoutDashboard size={16} />} label="Tableau de bord" onClick={fermer} />

              <div className="section-label">Mon activité</div>
              <Item to="/mes-candidatures" icon={<ListChecks size={16} />} label="Candidatures" onClick={fermer} />
              <Item to="/mes-favoris" icon={<Heart size={16} />} label="Favoris" onClick={fermer} />
              <Item to="/mes-alertes" icon={<Bell size={16} />} label="Alertes" onClick={fermer} />
              <Item to="/messagerie" icon={<MessageSquare size={16} />} label="Messagerie" onClick={fermer} />
              <Item to="/mes-paiements" icon={<FileText size={16} />} label="Paiements" onClick={fermer} />
              <Item to="/mes-contrats" icon={<CalendarClock size={16} />} label="Contrats" onClick={fermer} />
              <Item to="/mes-litiges" icon={<Scale size={16} />} label="Litiges" onClick={fermer} />
              <Item to="/notifications" icon={<Bell size={16} />} label="Notifications" count={count} onClick={fermer} />

              {role === 'proprietaire' && (
                <>
                  <div className="section-label">Propriétaire</div>
                  <Item to="/mes-proprietes" icon={<Building2 size={16} />} label="Mes propriétés" onClick={fermer} />
                  <Item to="/ajouter-propriete" icon={<PlusCircle size={16} />} label="Ajouter un bien" onClick={fermer} />
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="section-label">Administration</div>
                  <Item to="/admin/validations" icon={<ShieldCheck size={16} />} label="Validations" onClick={fermer} />
                  <Item to="/admin/statistiques" icon={<BarChart3 size={16} />} label="Statistiques" onClick={fermer} />
                </>
              )}
            </>
          ) : (
            <>
              <div className="section-label">Mon espace</div>
              <Item to="/login" icon={<LogIn size={16} />} label="Connexion" onClick={fermer} />
              <Item to="/register" icon={<UserPlus size={16} />} label="Inscription" onClick={fermer} />
            </>
          )}
        </nav>

        {user ? (
          <div className="sidebar-user">
            <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span className={`role-pill ${role === 'admin' ? 'role-admin' : 'role-owner'}`}>{roleLabel}</span>
            </div>
            <button className="icon-btn logout" onClick={handleLogout} title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="sidebar-user guest">
            <span className="avatar">?</span>
            <div className="sidebar-user-info">
              <strong>Invite</strong>
              <span className="muted" style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Vous n'êtes pas connecté</span>
            </div>
          </div>
        )}
      </aside>

      {open && <div className="sidebar-overlay" onClick={fermer} />}

      <div className="main-area">
        <header className="appbar">
          <button className="icon-btn burger" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>
          {!['/', '/recherche'].includes(location.pathname) && <div className="page-title">{titre}</div>}
          <nav className="appbar-nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={fermer}>
              <Home size={15} /> <span>Accueil</span>
            </NavLink>
            <NavLink to="/recherche" className={({ isActive }) => (isActive ? 'active' : '')} onClick={fermer}>
              <Search size={15} /> <span>Rechercher un bien</span>
            </NavLink>
          </nav>
          <div className="appbar-actions">
            {user ? (
              <>
                <NavLink to="/notifications" className="bell" title="Notifications">
                  <Bell size={17} />
                  {count > 0 && <span className="bell-badge">{count}</span>}
                </NavLink>
                <div className="user-menu">
                  <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {menuOpen && (
                    <div className="user-dropdown">
                      <div className="dropdown-head">
                        <strong>{user?.name}</strong>
                        <span className="muted">{user?.email}</span>
                        <span className={`role-pill ${role === 'admin' ? 'role-admin' : 'role-owner'}`}>{roleLabel}</span>
                      </div>
                      <button onClick={handleLogout} className="dropdown-item">
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-btns">
                <NavLink to="/login" className="btn secondary">Connexion</NavLink>
                <NavLink to="/register" className="btn">Inscription</NavLink>
              </div>
            )}
          </div>
        </header>
        <main className="content app-content">{children}</main>
      </div>
      <ChatBot />
    </div>
  )
}