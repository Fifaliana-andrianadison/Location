import { useState } from 'react'
import { FileText, PenLine } from 'lucide-react'
import SignatureElectronique from './SignatureElectronique.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getContratPdf, signerContrat } from '../../api/contratApi.js'
import { formatAr, formatDate, label } from '../../utils/format.js'

export default function ContratViewer({ contrat, onReload }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')

  const jeSuisProprietaire = user?.id === contrat.proprietaire?.id
  const jeSuisLocataire = user?.id === contrat.locataire?.id
  const jaiSigne = jeSuisProprietaire ? contrat.signe_proprietaire : jeSuisLocataire ? contrat.signe_locataire : false
  const peutSigner = contrat.statut === 'en_attente' && !jaiSigne

  const handleSign = async (signature) => {
    setError('')
    try {
      await signerContrat(contrat.id, signature)
      onReload()
    } catch (err) {
      setError(err.response?.data?.message || 'La signature a échoué.')
    }
  }

  const openPdf = async () => {
    try {
      const { data } = await getContratPdf(contrat.id)
      window.open(data.url, '_blank')
    } catch (err) {
      setError(err.response?.data?.message || 'PDF indisponible.')
    }
  }

  return (
    <div className="card contrat-viewer">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <h2>Contrat #{contrat.id} — {contrat.annonce?.titre || 'Sans titre'}</h2>
        <span className={`badge ${contrat.statut === 'signe' || contrat.statut === 'actif' ? 'badge-green' : 'badge-amber'}`}>
          {label(contrat.statut)}
        </span>
      </div>
      <div className="contrat-grid">
        <div>
          <p><strong>Propriétaire :</strong> {contrat.proprietaire?.name || '—'}</p>
          <p><strong>Locataire :</strong> {contrat.locataire?.name || '—'}</p>
          <p><strong>Début :</strong> {formatDate(contrat.date_debut)}</p>
          <p><strong>Fin :</strong> {formatDate(contrat.date_fin)}</p>
        </div>
        <div>
          <p><strong>Loyer mensuel :</strong> {formatAr(contrat.loyer_mensuel)}</p>
          <p><strong>Caution :</strong> {formatAr(contrat.caution)}</p>
          <p><strong>Créé le :</strong> {formatDate(contrat.created_at)}</p>
          <p>
            <strong>Signature propriétaire :</strong>{' '}
            {contrat.signe_proprietaire ? <span className="badge badge-green">Signé</span> : <span className="badge badge-amber">En attente</span>}
          </p>
          <p>
            <strong>Signature locataire :</strong>{' '}
            {contrat.signe_locataire ? <span className="badge badge-green">Signé</span> : <span className="badge badge-amber">En attente</span>}
          </p>
        </div>
      </div>
      {error && <div className="alert-danger">{error}</div>}
      <div className="form-actions">
        <button className="btn secondary small" onClick={openPdf} disabled={!contrat.pdf_path}>
          <FileText size={14} /> Voir le PDF
        </button>
      </div>
      {peutSigner && (
        <div className="sig-section">
          <h3><PenLine size={15} /> Signature électronique</h3>
          <SignatureElectronique
            label={jeSuisProprietaire ? 'Signez en tant que propriétaire' : 'Signez en tant que locataire'}
            onSign={handleSign}
          />
        </div>
      )}
    </div>
  )
}