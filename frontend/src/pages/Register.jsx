import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, Building2, CheckCircle2, Home, Lock, Mail, MapPin, Phone, Search, ShieldCheck, User, Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const ATOUTS = [
  { icon: <Search size={16} />, titre: 'Recherche par budget', texte: 'Appartements, maisons et terrains selon votre budget.' },
  { icon: <ShieldCheck size={16} />, titre: 'Propriétaires vérifiés', texte: 'Identités et titres fonciers contrôlés.' },
  { icon: <Wallet size={16} />, titre: 'Mobile Money intégré', texte: 'Mvola, Orange Money et Airtel Money.' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(params.get('role') === 'proprietaire' ? 'proprietaire' : 'locataire')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register({ name, email, password, role, telephone: telephone || undefined })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Inscription impossible.')
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
            Rejoignez la plateforme<br />
            <span className="grad">de l'immobilier malgache.</span>
          </h1>
          <p className="muted">
            Que vous cherchiez un logement ou que vous souhaitiez louer vos biens,
            créez votre compte en moins d'une minute.
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
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <h2>Créer votre compte</h2>
          <p className="muted">L'inscription est gratuite et instantanée.</p>

          <form onSubmit={submit} className="auth-fields">
            <div className="role-choice">
              <button
                type="button"
                className={`role-option ${role === 'locataire' ? 'selected' : ''}`}
                onClick={() => setRole('locataire')}
              >
                <Home size={19} />
                <span><strong>Locataire</strong>Je cherche un logement à louer</span>
                {role === 'locataire' && <CheckCircle2 size={16} className="role-check" />}
              </button>
              <button
                type="button"
                className={`role-option ${role === 'proprietaire' ? 'selected' : ''}`}
                onClick={() => setRole('proprietaire')}
              >
                <Building2 size={19} />
                <span><strong>Propriétaire</strong>Je loue ou je vends un bien</span>
                {role === 'proprietaire' && <CheckCircle2 size={16} className="role-check" />}
              </button>
            </div>

            <label className="field">
              <span>Nom complet</span>
              <div className="input-icon">
                <User size={16} />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rakoto Jean" required autoFocus />
              </div>
            </label>
            <label className="field">
              <span>Email</span>
              <div className="input-icon">
                <Mail size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
            </label>
            <label className="field">
              <span>Téléphone (facultatif)</span>
              <div className="input-icon">
                <Phone size={16} />
                <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="034 00 000 00" />
              </div>
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <div className="input-icon">
                <Lock size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" required minLength={6} />
              </div>
            </label>

            {error && <div className="alert-danger">{error}</div>}

            <button className="btn primary auth-submit" disabled={busy}>
              {busy ? <span className="btn-spin" /> : <>S'inscrire <ArrowRight size={16} /></>}
            </button>

            <p className="auth-alt">
              Déjà inscrit ? <Link to="/login">Connectez-vous</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}