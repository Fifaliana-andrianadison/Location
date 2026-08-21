import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { confirmerPaiement, deletePaiement } from '../../api/paiementApi.js'
import { formatAr, formatMois, formatDate, label } from '../../utils/format.js'

const METHODES = {
  mvola: 'MVola',
  orange_money: 'Orange Money',
  airtel_money: 'Airtel Money',
  especes: 'Espèces',
  virement: 'Virement bancaire',
}

export default function HistoriquePaiements({ paiements = [], onChanged }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(null)

  if (!paiements || paiements.length === 0) {
    return (
      <div className="card empty">
        Aucun paiement enregistré pour le moment.
      </div>
    )
  }

  const isOwnerOrAdmin = user?.role === 'admin' || user?.role === 'proprietaire'
  const isAdmin = user?.role === 'admin'

  const confirmer = async (p) => {
    setBusy(p.id)
    try {
      await confirmerPaiement(p.id)
      onChanged?.()
    } finally {
      setBusy(null)
    }
  }

  const supprimer = async (p) => {
    if (!window.confirm('Supprimer définitivement ce paiement ?')) return
    setBusy(p.id)
    try {
      await deletePaiement(p.id)
      onChanged?.()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="card">
      <h2>Historique des paiements</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Référence</th>
              <th>Payé le</th>
              <th>Statut</th>
              {(isOwnerOrAdmin || isAdmin) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paiements.map((p) => (
              <tr key={p.id}>
                <td>{formatMois(p.mois)}</td>
                <td><strong>{formatAr(p.montant)}</strong></td>
                <td>{METHODES[p.methode] ?? p.methode}</td>
                <td className="muted">{p.reference || '—'}</td>
                <td>{p.paye_le ? formatDate(p.paye_le) : '—'}</td>
                <td>
                  <span className={`badge ${p.statut === 'confirme' ? 'badge-green' : p.statut === 'rejete' ? 'badge-red' : 'badge-amber'}`}>
                    {label(p.statut)}
                  </span>
                </td>
                {(isOwnerOrAdmin || isAdmin) && (
                  <td>
                    <div className="row-actions">
                      {isOwnerOrAdmin && p.statut === 'en_attente' && (
                        <button className="btn small" onClick={() => confirmer(p)} disabled={busy === p.id}>
                          <Check size={13} /> Confirmer
                        </button>
                      )}
                      {isAdmin && (
                        <button className="btn small danger" onClick={() => supprimer(p)} disabled={busy === p.id}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}