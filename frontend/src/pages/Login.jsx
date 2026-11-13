import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import AuthShell from '../components/common/AuthShell.jsx'

const COMPTES_TEST = [
  { role: 'Administrateur', email: 'admin@tanytoerana.mg', mdp: 'admin123', color: 'violet' },
  { role: 'Propriétaire', email: 'proprio1@tanytoerana.mg', mdp: 'password', color: 'green' },
  { role: 'Locataire', email: 'loc1@tanytoerana.mg', mdp: 'password', color: 'blue' },
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
      await signIn(prefillEmail ?? email, prefillPassword ?? password)
      const cible = location.state?.from || '/dashboard'
      navigate(cible, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell key="login-page" to="/register">
      <div className="auth-form-inner">
        <div className="auth-form-head">
          <span className="auth-form-logo">T&T</span>
          <span className="auth-form-brand">Tany &amp; Toerana</span>
        </div>

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
            {busy ? <span className="btn-spin" /> : <><ArrowRight size={16} /> Se connecter</>}
          </button>
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

        <p className="auth-hint">
          <ShieldCheck size={12} /> Cliquez sur un compte pour vous connecter instantanément.
        </p>
      </div>
    </AuthShell>
  )
}
