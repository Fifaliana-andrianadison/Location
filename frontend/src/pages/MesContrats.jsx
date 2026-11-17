import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarRange, CheckCircle2, Clock, FileSignature, FileText, Plus, Wallet } from 'lucide-react'
import ContratViewer, { contratRef, STATUT_CONTRAT_BADGE } from '../components/contrat/ContratViewer.jsx'
import ContratForm from '../components/contrat/ContratForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getContrats } from '../api/contratApi.js'
import { formatAr, formatDate, label } from '../utils/format.js'

const FILTRES = [
  { key: 'tous', label: 'Tous' },
  { key: 'en_attente', label: 'À signer' },
  { key: 'signe', label: 'Signés' },
  { key: 'termine', label: 'Terminés' },
]

const estSigne = (c) => ['signe', 'actif'].includes(c.statut)

export default function MesContrats() {
  const { user } = useAuth()
  const peutCreer = user?.role === 'proprietaire' || user?.role === 'admin'

  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [ouvertId, setOuvertId] = useState(null)
  const [formulaire, setFormulaire] = useState(null) // null | { contrat?: object }

  const load = useCallback(() => {
    setError('')
    return getContrats({ per_page: 100 })
      .then(({ data }) => setContrats(data.data ?? []))
      .catch(() => setError('Impossible de charger les contrats.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => ({
    total: contrats.length,
    attente: contrats.filter((c) => c.statut === 'en_attente').length,
    signes: contrats.filter(estSigne).length,
    loyers: contrats.filter(estSigne).reduce((s, c) => s + (Number(c.loyer_mensuel) || 0), 0),
  }), [contrats])

  const visibles = contrats.filter((c) => {
    if (filtre === 'tous') return true
    if (filtre === 'signe') return estSigne(c)
    if (filtre === 'termine') return ['termine', 'resilie'].includes(c.statut)
    return c.statut === filtre
  })

  const ouvert = contrats.find((c) => c.id === ouvertId)

  const aSignerParMoi = (c) => c.statut === 'en_attente' && (
    (user?.id === c.proprietaire?.id && !c.signe_proprietaire) || (user?.id === c.locataire?.id && !c.signe_locataire)
  )

  const onSaved = (data) => {
    const edition = Boolean(formulaire?.contrat)
    setFormulaire(null)
    setSuccess(edition ? 'Contrat modifié. Le locataire a été notifié pour une nouvelle signature.' : 'Contrat créé et envoyé au locataire pour signature.')
    load().then(() => data?.id && setOuvertId(data.id))
  }

  return (
    <div className="page contrats-page">
      <div className="contrats-hero">
        <div>
          <h1 className="page">Mes contrats</h1>
          <p className="muted">Créez, modifiez et signez vos contrats de bail en ligne.</p>
        </div>
        {peutCreer && (
          <button className="btn" onClick={() => setFormulaire({})}>
            <Plus size={15} /> Nouveau contrat
          </button>
        )}
      </div>

      {error && <div className="alert-danger">{error}</div>}
      {success && <p className="success">{success}</p>}

      <div className="contrats-stats">
        <div className="stat-card"><span className="stat-ico indigo"><FileText size={17} /></span><div><div className="stat-value">{stats.total}</div><div className="stat-label">Contrats</div></div></div>
        <div className="stat-card"><span className="stat-ico amber"><Clock size={17} /></span><div><div className="stat-value">{stats.attente}</div><div className="stat-label">En attente de signature</div></div></div>
        <div className="stat-card"><span className="stat-ico green"><CheckCircle2 size={17} /></span><div><div className="stat-value">{stats.signes}</div><div className="stat-label">Signés</div></div></div>
        <div className="stat-card"><span className="stat-ico blue"><Wallet size={17} /></span><div><div className="stat-value">{formatAr(stats.loyers)}</div><div className="stat-label">Loyers mensuels signés</div></div></div>
      </div>

      <div className="tabs">
        {FILTRES.map((f) => (
          <button key={f.key} className={`tab ${filtre === f.key ? 'active' : ''}`} onClick={() => setFiltre(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card empty">Chargement des contrats…</div>
      ) : visibles.length === 0 ? (
        <div className="card empty contrats-empty">
          <FileSignature size={30} />
          <p>
            {contrats.length === 0
              ? peutCreer
                ? "Aucun contrat pour l'instant. Créez-en un à partir de la candidature d'un locataire."
                : "Aucun contrat pour le moment. Le propriétaire vous enverra le contrat après acceptation de votre candidature."
              : 'Aucun contrat dans cette catégorie.'}
          </p>
          {peutCreer && contrats.length === 0 && (
            <button className="btn" onClick={() => setFormulaire({})}><Plus size={14} /> Créer un contrat</button>
          )}
        </div>
      ) : (
        <div className="contrats-grid">
          {visibles.map((c) => {
            const nb = Number(c.signe_proprietaire) + Number(c.signe_locataire)
            const autre = user?.id === c.proprietaire?.id ? c.locataire : c.proprietaire
            return (
              <button type="button" key={c.id} className={`contrat-card ${aSignerParMoi(c) ? 'to-sign' : ''}`} onClick={() => setOuvertId(c.id)}>
                <div className="contrat-card-top">
                  <span className="contrat-card-ico"><FileSignature size={18} /></span>
                  <span className={`badge ${STATUT_CONTRAT_BADGE[c.statut] || 'badge-gray'}`}>{label(c.statut)}</span>
                </div>
                <span className="contrat-card-ref">{contratRef(c.id)}</span>
                <h3>{c.annonce?.titre || 'Sans titre'}</h3>
                <p className="muted">{user?.id === c.proprietaire?.id ? 'Locataire' : 'Bailleur'} : <strong>{autre?.name || '—'}</strong></p>
                <div className="contrat-card-row">
                  <span><CalendarRange size={13} /> {formatDate(c.date_debut)} → {formatDate(c.date_fin)}</span>
                </div>
                <div className="contrat-card-foot">
                  <strong className="contrat-card-loyer">{formatAr(c.loyer_mensuel)}<small>/mois</small></strong>
                  <span className="contrat-card-sigs" title={`${nb}/2 signatures`}>
                    <i className={c.signe_proprietaire ? 'on' : ''} />
                    <i className={c.signe_locataire ? 'on' : ''} />
                    {nb}/2
                  </span>
                </div>
                {aSignerParMoi(c) && <span className="contrat-card-cta"><FileSignature size={13} /> Votre signature est attendue</span>}
              </button>
            )
          })}
        </div>
      )}

      {ouvert && (
        <div className="modal-overlay" onClick={() => setOuvertId(null)}>
          <div className="modal modal-wide contrat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3><FileSignature size={16} /> Contrat {contratRef(ouvert.id)}</h3>
              <button type="button" className="icon-btn" onClick={() => setOuvertId(null)} aria-label="Fermer">✕</button>
            </div>
            <div className="modal-body">
              <ContratViewer
                contrat={ouvert}
                onReload={() => { setSuccess(''); load() }}
                onEdit={(c) => { setOuvertId(null); setFormulaire({ contrat: c }) }}
                onDeleted={() => { setOuvertId(null); setSuccess('Contrat supprimé.'); load() }}
              />
            </div>
          </div>
        </div>
      )}

      {formulaire && (
        <ContratForm contrat={formulaire.contrat || null} onClose={() => setFormulaire(null)} onSaved={onSaved} />
      )}
    </div>
  )
}
