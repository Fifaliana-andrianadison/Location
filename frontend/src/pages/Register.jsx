import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, Building2, Camera, CheckCircle2, FileText, Home, IdCard, Lock, Mail, Phone, User, X,
} from 'lucide-react'
import { compressImage, formatSize, MAX_UPLOAD_BYTES } from '../utils/compressImage.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthShell from '../components/common/AuthShell.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(params.get('role') === 'proprietaire' ? 'proprietaire' : 'locataire')
  const [photo, setPhoto] = useState(null)
  const [documentId, setDocumentId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const pickFile = async (e, setter, { allowPdf = false } = {}) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const okType = file.type.startsWith('image/') || (allowPdf && file.type === 'application/pdf')
    if (!okType) {
      setError(allowPdf ? 'Formats acceptés : image (JPG, PNG, WEBP) ou PDF.' : 'Veuillez choisir une image.')
      return
    }
    const finalFile = file.type.startsWith('image/') ? await compressImage(file) : file
    if (finalFile.size > MAX_UPLOAD_BYTES) {
      setError(`Fichier trop lourd (${formatSize(finalFile.size)}). Maximum 2 Mo.`)
      return
    }
    setError('')
    setter({ file: finalFile, preview: finalFile.type.startsWith('image/') ? URL.createObjectURL(finalFile) : null })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('password', password)
      fd.append('role', role)
      if (telephone) fd.append('telephone', telephone)
      if (photo) fd.append('photo', photo.file)
      if (role === 'proprietaire' && documentId) fd.append('document', documentId.file)
      await register(fd)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const errs = err.response?.data?.errors
      const first = errs ? Object.values(errs).flat()[0] : null
      const msg = first || err.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Inscription impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell key="register-page" to="/login">
      <div className="auth-form-inner">
        <div className="auth-form-head">
          <span className="auth-form-logo">T&T</span>
          <span className="auth-form-brand">Tany &amp; Toerana</span>
        </div>

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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" required minLength={8} />
            </div>
          </label>

          <div className={`upload-tiles ${role === 'proprietaire' ? '' : 'single'}`}>
            <div className="upload-tile">
              <span className="upload-tile-label">Photo de profil <em>(facultatif)</em></span>
              {photo ? (
                <div className="upload-preview round">
                  <img src={photo.preview} alt="Aperçu de la photo" />
                  <button type="button" className="upload-remove" onClick={() => setPhoto(null)} aria-label="Retirer la photo"><X size={12} /></button>
                </div>
              ) : (
                <label className="upload-drop">
                  <Camera size={20} />
                  <span>Ajouter une photo</span>
                  <input type="file" accept="image/*" className="hidden-file" onChange={(e) => pickFile(e, setPhoto)} />
                </label>
              )}
            </div>

            {role === 'proprietaire' && (
              <div className="upload-tile">
                <span className="upload-tile-label">Pièce d'identité <em>(CIN / passeport)</em></span>
                {documentId ? (
                  <div className="upload-preview">
                    {documentId.preview
                      ? <img src={documentId.preview} alt="Aperçu de la pièce d'identité" />
                      : <div className="upload-pdf"><FileText size={22} /><span>{documentId.file.name}</span></div>}
                    <button type="button" className="upload-remove" onClick={() => setDocumentId(null)} aria-label="Retirer le document"><X size={12} /></button>
                  </div>
                ) : (
                  <label className="upload-drop">
                    <IdCard size={20} />
                    <span>Importer (image ou PDF)</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden-file" onChange={(e) => pickFile(e, setDocumentId, { allowPdf: true })} />
                  </label>
                )}
              </div>
            )}
          </div>
          {role === 'proprietaire' && (
            <p className="upload-hint">Votre pièce d'identité permet à l'administrateur de vérifier votre compte avant la mise en ligne de vos annonces.</p>
          )}

          {error && <div className="alert-danger">{error}</div>}

          <button className="btn primary auth-submit" disabled={busy}>
            {busy ? <span className="btn-spin" /> : <>S'inscrire <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
