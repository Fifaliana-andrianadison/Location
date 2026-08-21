import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, MapPin, Search, ShieldCheck, Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const COMPTES_TEST = [
  { role: 'Administrateur', email: 'admin@tanytoerana.mg', mdp: 'admin123', color: 'violet' },
  { role: 'Propriétaire', email: 'proprio1@tanytoerana.mg', mdp: 'password', color: 'green' },
  { role: 'Locataire', email: 'loc1@tanytoerana.mg', mdp: 'password', color: 'blue' },
]

const ATOUTS = [
  { icon: <Search size={17} />, titre: 'Recherche par budget', texte: 'Appartements, maisons et terrains selon votre budget.' },
  { icon: <Wallet size={17} />, titre: 'Paiement Mobile Money', texte: 'Mvola, Orange Money et Airtel Money.' },
  { icon: <ShieldCheck size={17} />, titre: 'Transactions sécurisées', texte: 'Candidatures, contrats signés et signatures électroniques.' },
]

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e, prefillEmail, prefillPassword) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await signIn(prefillEmail ?? email, prefillPassword ?? password)
      const cible = location.state?.from || (user?.role === 'admin'
        ? '/admin/statistiques'
        : user?.role === 'proprietaire'
          ? '/dashboard'
          : '/dashboard')
      navigate(cible, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-brand">
            <span className="logo"><MapPin size={20} /></span>
            <span className="brand-name">Tany &amp; Toerana</span>
          </div>

          <h1>
            Toute la location immobilière<br />
            <span className="grad">dans votre budget.</span>
          </h1>
          <p className="muted">
            La plateforme malgache pour trouver un logement, gérer votre propriété
            et signer vos contrats en toute simplicité.
          </p>

          <div className="auth-atouts">
            {ATOUTS.map((a) => (
              <div key={a.titre} className="atout">
                <span className="atout-ico">{a.icon}</span>
                <div>
                  <strong>{a.titre}</strong>
                  <span>{a.texte}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-stats">
            <div><strong>10+</strong><span>annonces en ligne</span></div>
            <div><strong>3</strong><span>opérateurs Mobile Money</span></div>
            <div><strong>100%</strong><span>contrats sécurisés</span></div>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <h2>Bon retour !</h2>
          <p className="muted">Connectez-vous à votre espace personnel.</p>

          <form onSubmit={submit} className="auth-fields">
            <label className="field">
              <span>Adresse email</span>
              <div className="input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoFocus
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <div className="input-icon">
                <Lock size={16} />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="icon-btn" onClick={() => setShow(!show)} title={show ? 'Masquer' : 'Afficher'}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error && <div className="alert-danger">{error}</div>}

            <button className="btn primary auth-submit" disabled={busy}>
              {busy ? (
                <span className="btn-spin" />
              ) : (
                <>
                  Se connecter <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="auth-alt">
              Pas encore de compte ? <Link to="/register">Créez un compte gratuit</Link>
            </p>
          </form>

          <div className="auth-divider"><span>ou avec un compte de démonstration</span></div>

          <div className="test-accounts">
            {COMPTES_TEST.map((c) => (
              <button
                key={c.email}
                type="button"
                className={`test-account ${c.color}`}
                onClick={(e) => {
                  setEmail(c.email)
                  setPassword(c.mdp)
                  submit(e, c.email, c.mdp)
                }}
                disabled={busy}
              >
                <span className="ta-dot" />
                <span className="ta-role">{c.role}</span>
                <span className="ta-mail">{c.email}</span>
                <CheckCircle2 size={15} />
              </button>
            ))}
          </div>
          <p className="auth-hint">Cliquez sur un compte pour vous connecter instantanément.</p>
        </div>
      </div>
    </div>
  )
}