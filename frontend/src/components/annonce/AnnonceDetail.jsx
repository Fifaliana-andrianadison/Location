import { useState } from 'react'
import { Heart, Phone, MapPin, BedDouble, Ruler, Building2, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import ImageGallery from './ImageGallery.jsx'
import MapView from './MapView.jsx'
import CandidatureForm from '../candidature/CandidatureForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { addFavori, removeFavori } from '../../api/favoriApi.js'
import { formatAr, formatDate, TYPE_LABELS, MODE_LABELS, label } from '../../utils/format.js'

export default function AnnonceDetail({ annonce, isFavori, onToggleFavori }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [confirmer, setConfirmer] = useState(false)

  const loc = annonce.localisation

  const toggleFavori = async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      if (isFavori) {
        await removeFavori(annonce.id)
        onToggleFavori(false)
      } else {
        await addFavori(annonce.id)
        onToggleFavori(true)
      }
    } catch { /* ignore */ } finally {
      setBusy(false)
    }
  }

  const proposerContrat = () => {
    if (!user) return
    setConfirmer(true)
    window.location.href = `/messagerie?with_user=${annonce.proprietaire?.id}`
  }

  return (
    <div className="detail-bien">
      <div className="detail-main">
        <ImageGallery images={annonce.images} principale={annonce.image_principale} type={annonce.type} seed={annonce.id} />

        <div className="card detail-info sl-detail-card">
          <div className="detail-badges">
            <span className="badge badge-indigo">{TYPE_LABELS[annonce.type] ?? annonce.type}</span>
            <span className="badge badge-blue">{MODE_LABELS[annonce.mode] ?? annonce.mode}</span>
            {annonce.type_loyer && <span className="badge badge-gray">{annonce.type_loyer}</span>}
            {annonce.meuble && <span className="badge badge-green">Meublé</span>}
          </div>
          <h1 className="detail-titre">{annonce.titre}</h1>
          <p className="detail-prix">{formatAr(annonce.prix)}
            {annonce.type_loyer === 'mensuel' && annonce.mode === 'location' && <span className="muted"> / mois</span>}
          </p>
          {loc?.adresse && <p className="muted"><MapPin size={13} /> {loc.adresse}</p>}
          {loc && (
            <p className="muted">
              <MapPin size={13} /> {[loc.quartier, loc.ville, loc.region].filter(Boolean).join(' · ')}
            </p>
          )}
          <p className="detail-desc">{annonce.description || 'Aucune description fournie.'}</p>
          <div className="detail-carac">
            {annonce.superficie != null && (
              <div className="carac"><Ruler size={18} /><span><strong>{new Intl.NumberFormat('fr-FR').format(annonce.superficie)} m²</strong>Superficie</span></div>
            )}
            {annonce.nb_pieces != null && (
              <div className="carac"><BedDouble size={18} /><span><strong>{annonce.nb_pieces}</strong>Pièces</span></div>
            )}
            {annonce.nb_chambres != null && (
              <div className="carac"><BedDouble size={18} /><span><strong>{annonce.nb_chambres}</strong>Chambres</span></div>
            )}
            {annonce.nb_salles_bain != null && (
              <div className="carac"><Building2 size={18} /><span><strong>{annonce.nb_salles_bain}</strong>Salles de bain</span></div>
            )}
          </div>
          <p className="muted">Publié le {formatDate(annonce.created_at)}</p>
        </div>
      </div>

      <aside className="detail-side">
        <div className="card">
          <h2>Propriétaire</h2>
          <p>
            <strong>{annonce.proprietaire?.name || 'Anonyme'}</strong>
            <span className="badge badge-green"><BadgeCheck size={12} /> Vérifié</span>
          </p>
          {annonce.proprietaire?.telephone && (
            <p className="muted"><Phone size={13} /> {annonce.proprietaire.telephone}</p>
          )}
          <div className="form-actions" style={{ flexDirection: 'column' }}>
            {user && user.id !== annonce.proprietaire?.id && (
              <button className="btn" onClick={proposerContrat}>
                Contacter le propriétaire
              </button>
            )}
            <button className={`btn secondary ${isFavori ? 'fav-on' : ''}`} onClick={toggleFavori} disabled={!user}>
              <Heart size={15} fill={isFavori ? 'currentColor' : 'none'} />
              {isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
          {!user && (
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              <Link to="/login">Connectez-vous</Link> pour candidater, échanger avec le propriétaire ou enregistrer ce bien.
            </p>
          )}
        </div>

        <div className="card">
          <h2>Localisation</h2>
          <MapView latitude={loc?.latitude} longitude={loc?.longitude} />
        </div>

        <div className="card">
          <h2>Statut de l'annonce</h2>
          <p>
            <span className={`badge ${annonce.statut === 'disponible' ? 'badge-green' : 'badge-amber'}`}>{label(annonce.statut)}</span>
          </p>
        </div>
      </aside>

      {user?.role === 'locataire' && (
        <div className="detail-candidature">
          <CandidatureForm annonceId={annonce.id} />
        </div>
      )}
    </div>
  )
}