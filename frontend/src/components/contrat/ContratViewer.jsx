import { useState } from 'react'
import { CalendarRange, CheckCircle2, Clock, FileText, Mail, PenLine, Pencil, Phone, Trash2, Wallet } from 'lucide-react'
import SignatureElectronique from './SignatureElectronique.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { deleteContrat, getContratPdf, signerContrat } from '../../api/contratApi.js'
import { formatAr, formatDate, label } from '../../utils/format.js'

export const contratRef = (id) => `CB-${String(id).padStart(5, '0')}`

export const STATUT_CONTRAT_BADGE = {
  brouillon: 'badge-gray',
  en_attente: 'badge-amber',
  signe: 'badge-green',
  actif: 'badge-green',
  termine: 'badge-blue',
  resilie: 'badge-red',
}

function dureeMois(debut, fin) {
  const a = new Date(debut)
  const b = new Date(fin)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24 * 30.44)))
}

function Partie({ role, personne, signe }) {
  return (
    <div className="contrat-partie">
      <div className="contrat-partie-head">
        <span className="contrat-avatar">{personne?.name?.charAt(0)?.toUpperCase() || '?'}</span>
        <div>
          <span className="contrat-role">{role}</span>
          <strong>{personne?.name || '—'}</strong>
        </div>
        <span className={`contrat-sig-state ${signe ? 'ok' : ''}`}>
          {signe ? <><CheckCircle2 size={13} /> Signé</> : <><Clock size={13} /> En attente</>}
        </span>
      </div>
      {personne?.email && <p><Mail size={12} /> {personne.email}</p>}
      {personne?.telephone && <p><Phone size={12} /> {personne.telephone}</p>}
    </div>
  )
}

export default function ContratViewer({ contrat, onReload, onEdit, onDeleted }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const jeSuisProprietaire = user?.id === contrat.proprietaire?.id
  const jeSuisLocataire = user?.id === contrat.locataire?.id
  const jaiSigne = jeSuisProprietaire ? contrat.signe_proprietaire : jeSuisLocataire ? contrat.signe_locataire : false
  const peutSigner = contrat.statut === 'en_attente' && (jeSuisProprietaire || jeSuisLocataire) && !jaiSigne
  const peutGerer = (jeSuisProprietaire || user?.role === 'admin') && contrat.modifiable
  const nbSignatures = Number(contrat.signe_proprietaire) + Number(contrat.signe_locataire)
  const mois = dureeMois(contrat.date_debut, contrat.date_fin)

  const handleSign = async (signature) => {
    setError('')
    try {
      await signerContrat(contrat.id, signature)
      onReload?.()
    } catch (err) {
      setError(err.response?.data?.message || 'La signature a échoué.')
    }
  }

  const openPdf = async () => {
    setError('')
    try {
      const { data } = await getContratPdf(contrat.id)
      window.open(data.url, '_blank')
    } catch (err) {
      setError(err.response?.data?.message || 'PDF indisponible.')
    }
  }

  const supprimer = async () => {
    if (!window.confirm(`Supprimer définitivement le contrat ${contratRef(contrat.id)} ?`)) return
    setBusy(true)
    setError('')
    try {
      await deleteContrat(contrat.id)
      onDeleted?.(contrat.id)
    } catch (err) {
      setError(err.response?.data?.message || 'Suppression impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="contrat-doc">
      <header className="contrat-doc-head">
        <div>
          <span className="contrat-doc-kicker">Contrat de bail · {contratRef(contrat.id)}</span>
          <h2>{contrat.annonce?.titre || 'Bien sans titre'}</h2>
          <span className="contrat-doc-meta">
            Établi le {formatDate(contrat.created_at)}
            {contrat.updated_at && contrat.updated_at !== contrat.created_at && ` · modifié le ${formatDate(contrat.updated_at)}`}
          </span>
        </div>
        <span className={`badge ${STATUT_CONTRAT_BADGE[contrat.statut] || 'badge-gray'}`}>{label(contrat.statut)}</span>
      </header>

      <div className="contrat-progress">
        <div className="contrat-progress-bar"><span style={{ width: `${(nbSignatures / 2) * 100}%` }} /></div>
        <span className="muted">{nbSignatures}/2 signatures</span>
      </div>

      <div className="contrat-parties">
        <Partie role="Bailleur" personne={contrat.proprietaire} signe={contrat.signe_proprietaire} />
        <Partie role="Locataire" personne={contrat.locataire} signe={contrat.signe_locataire} />
      </div>

      <div className="contrat-termes">
        <div className="contrat-terme">
          <CalendarRange size={16} />
          <div>
            <span>Période</span>
            <strong>{formatDate(contrat.date_debut)} → {formatDate(contrat.date_fin)}</strong>
            {mois !== null && <small>{mois} mois</small>}
          </div>
        </div>
        <div className="contrat-terme accent">
          <Wallet size={16} />
          <div>
            <span>Loyer mensuel</span>
            <strong>{formatAr(contrat.loyer_mensuel)}</strong>
          </div>
        </div>
        <div className="contrat-terme">
          <Wallet size={16} />
          <div>
            <span>Caution</span>
            <strong>{formatAr(contrat.caution)}</strong>
          </div>
        </div>
      </div>

      {contrat.conditions && (
        <div className="contrat-conditions">
          <h4>Conditions particulières</h4>
          <p>{contrat.conditions}</p>
        </div>
      )}

      {error && <div className="alert-danger">{error}</div>}

      <div className="contrat-actions">
        <button className="btn secondary small" onClick={openPdf} disabled={!contrat.pdf_path}>
          <FileText size={14} /> Voir le PDF
        </button>
        {peutGerer && (
          <>
            <button className="btn secondary small" onClick={() => onEdit?.(contrat)}>
              <Pencil size={14} /> Modifier
            </button>
            <button className="btn danger small" onClick={supprimer} disabled={busy}>
              <Trash2 size={14} /> Supprimer
            </button>
          </>
        )}
      </div>

      {peutSigner && (
        <div className="sig-section">
          <h3><PenLine size={15} /> Signature électronique</h3>
          <SignatureElectronique
            label={jeSuisProprietaire ? 'Signez en tant que bailleur dans le cadre ci-dessous' : 'Signez en tant que locataire dans le cadre ci-dessous'}
            onSign={handleSign}
          />
        </div>
      )}
      {jaiSigne && contrat.statut === 'en_attente' && (
        <p className="contrat-info"><CheckCircle2 size={14} /> Vous avez signé. En attente de la signature de l'autre partie.</p>
      )}
    </div>
  )
}
