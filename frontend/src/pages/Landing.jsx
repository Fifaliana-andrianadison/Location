import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, MapPin, Search, ShieldCheck,
  Star, Wallet, Menu, X, FileSignature, Bell, PlusCircle, Calculator,
} from 'lucide-react'
import AnnonceList from '../components/annonce/AnnonceList.jsx'
import ChatBot from '../components/common/ChatBot.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import { useAnnonces } from '../hooks/useAnnonces.js'
import { useAuth } from '../context/AuthContext.jsx'
import { annonceImage } from '../utils/format.js'
import { HERO_IMAGE, TYPE_IMAGES, cityImage } from '../utils/images.js'

const VILLES = ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa', 'Nosy Be']

const TEMOIGNAGES = [
  { nom: 'Naina R.', role: 'Locataire — Antananarivo', note: 5, texte: 'Studio trouvé en 3 jours à Ivandry. Dossier envoyé en ligne, contrat signé sans déplacement.' },
  { nom: 'Mamy R.', role: 'Propriétaire — Ivandry', note: 5, texte: 'Candidatures complètes avec documents, loyers par Mvola. Le tableau de bord suit tout.' },
  { nom: 'Hery A.', role: 'Propriétaire — Tana', note: 5, texte: 'Deux baux signés à distance en une semaine. Impayés suivis automatiquement.' },
]

export default function Landing() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { data, meta, loading, error, setPage, search } = useAnnonces({ per_page: 8 })
  const [menuOpen, setMenuOpen] = useState(false)
  const [rechercheActive, setRechercheActive] = useState(false)

  const handleSearch = (v) => {
    const aDesFiltres = Object.values(v).some(Boolean)
    setRechercheActive(aDesFiltres)
    search({ per_page: 8, ...v })
    if (aDesFiltres) {
      setTimeout(() => document.getElementById('annonces')?.scrollIntoView({ behavior: 'smooth' }), 80)
    }
  }

  const annonces = data?.data ?? data ?? []

  const typesCards = ['appartement', 'maison', 'terrain'].map((type) => ({
    type,
    titre: type === 'maison' ? 'Maisons & villas' : type === 'appartement' ? 'Appartements' : 'Terrains',
    sous: type === 'maison' ? 'À louer et à vendre' : type === 'appartement' ? 'Centres-villes' : 'À bâtir',
    image: TYPE_IMAGES[type],
    count: annonces.filter((a) => a.type === type).length,
  }))

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="sl-page">
      {/* ===== HEADER façon SeLoger ===== */}
      <header className="sl-header">
        <div className="sl-header-inner">
          <Link to="/" className="sl-logo">
            <span className="sl-logo-mark">T&T</span>
            <span className="sl-logo-text">Tany<em>&</em>Toerana</span>
          </Link>
          <nav className={`sl-nav ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => navigate('/recherche?mode=vente')}>Acheter</button>
            <button onClick={() => navigate('/recherche?mode=location')}>Louer</button>
            <button onClick={() => navigate('/recherche?type=terrain')}>Terrains</button>
            <button onClick={() => navigate('/recherche')}>Estimer</button>
          </nav>
          <div className="sl-header-actions">
            {user ? (
              <>
                <button className="sl-link" onClick={() => navigate('/dashboard')}>Mon espace</button>
                <button className="sl-btn-outline" onClick={logout}>Déconnexion</button>
                <button className="sl-btn-red" onClick={() => navigate('/ajouter-propriete')}>
                  <PlusCircle size={15} /> Déposer une annonce
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sl-link">Se connecter</Link>
                <Link to="/register" className="sl-btn-outline">Créer un compte</Link>
                <Link to="/register?role=proprietaire" className="sl-btn-red">
                  <PlusCircle size={15} /> Déposer une annonce
                </Link>
              </>
            )}
            <button className="sl-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO façon SeLoger : grande photo + carte recherche blanche ===== */}
      <section className="sl-hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="sl-hero-overlay" />
        <div className="sl-hero-inner">
          <h1>Vous êtes au bon endroit.</h1>
          <p className="sl-hero-sub">Location et vente à Madagascar — appartements, maisons, terrains vérifiés.</p>
          <div className="sl-hero-card">
            <SearchBar onSubmit={handleSearch} />
          </div>
          <div className="sl-hero-trust">
            <span><ShieldCheck size={14} /> Biens vérifiés</span>
            <span><Wallet size={14} /> Mvola · Orange · Airtel</span>
            <span><FileSignature size={14} /> Bail en ligne</span>
          </div>
        </div>
      </section>

      {/* ===== BANDEAU VILLES ===== */}
      <div className="sl-cities-strip">
        {VILLES.map((v) => (
          <button key={v} onClick={() => navigate(`/recherche?ville=${encodeURIComponent(v)}`)}>
            <MapPin size={13} /> {v}
          </button>
        ))}
      </div>

      <main className="sl-main">
        {/* ===== ANNONCES ===== */}
        <section id="annonces" className="sl-section">
          <div className="sl-section-head">
            <div>
              <h2>{rechercheActive ? 'Résultats de votre recherche' : 'Nos dernières annonces'}</h2>
              <p>{meta ? `${meta.total} bien(s) disponible(s)` : 'Appartements, maisons et terrains vérifiés.'}</p>
            </div>
            <div className="sl-head-actions">
              {rechercheActive && (
                <button className="sl-btn-outline" onClick={() => { setRechercheActive(false); search({ per_page: 8 }) }}>
                  <X size={14} /> Réinitialiser
                </button>
              )}
              <button className="sl-btn-outline" onClick={() => navigate('/recherche')}>
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
          </div>
          <AnnonceList data={annonces} meta={meta} loading={loading} error={error} onPageChange={setPage} />
        </section>

        {/* ===== PAR TYPE ===== */}
        <section className="sl-section">
          <div className="sl-section-head">
            <div>
              <h2>Explorez par type de bien</h2>
              <p>Chaque annonce est photographiée, décrite et géolocalisée.</p>
            </div>
          </div>
          <div className="sl-types">
            {typesCards.map((c) => (
              <button key={c.type} className="sl-type-card" onClick={() => navigate(`/recherche?type=${c.type}`)}>
                <img src={c.image} alt={c.titre} loading="lazy" />
                <span className="sl-type-over" />
                <span className="sl-type-label">
                  <strong>{c.titre}</strong>
                  <small>{c.sous} · Voir <ArrowRight size={12} /></small>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== VILLES POPULAIRES avec photos ===== */}
        <section className="sl-section">
          <div className="sl-section-head">
            <div>
              <h2>Où cherchez-vous ?</h2>
              <p>Les villes où les Malgaches cherchent et trouvent.</p>
            </div>
          </div>
          <div className="sl-villes">
            {VILLES.slice(0, 4).map((ville, i) => {
              const count = annonces.filter((a) => a.localisation?.ville === ville).length
              return (
                <button key={ville} className="sl-ville-card" onClick={() => navigate(`/recherche?ville=${encodeURIComponent(ville)}`)}>
                  <img src={cityImage(ville, i)} alt={ville} loading="lazy" />
                  <span className="sl-type-over" />
                  <span className="sl-ville-label">
                    <MapPin size={14} />
                    <div><strong>{ville}</strong><small>{count > 0 ? `${count} annonce(s)` : 'Voir les annonces'}</small></div>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ===== SERVICES façon SeLoger ===== */}
        <section className="sl-section">
          <div className="sl-services">
            <div className="sl-service">
              <span className="sl-service-ico"><Calculator size={20} /></span>
              <h3>Estimez votre bien</h3>
              <p>Obtenez une estimation gratuite selon votre ville et la surface.</p>
              <button className="sl-btn-outline" onClick={() => navigate('/recherche')}>Estimer <ArrowRight size={13} /></button>
            </div>
            <div className="sl-service red">
              <span className="sl-service-ico"><PlusCircle size={20} /></span>
              <h3>Déposez votre annonce</h3>
              <p>Photos, prix, localisation : publiez en 5 minutes, 100% gratuit.</p>
              <button className="sl-btn-red" onClick={() => navigate('/register?role=proprietaire')}>Publier <ArrowRight size={13} /></button>
            </div>
            <div className="sl-service">
              <span className="sl-service-ico"><Bell size={20} /></span>
              <h3>Créez une alerte</h3>
              <p>Soyez prévenu dès qu’un bien correspond à votre budget.</p>
              <button className="sl-btn-outline" onClick={() => navigate('/register')}>M’alerter <ArrowRight size={13} /></button>
            </div>
          </div>
        </section>

        {/* ===== APERCU ANNONCE VEDETTE ===== */}
        {annonces[0] && (
          <section className="sl-section">
            <div className="sl-spotlight">
              <img src={annonceImage(annonces[0])} alt={annonces[0].titre} />
              <div className="sl-spotlight-body">
                <span className="sl-kicker">Coup de cœur</span>
                <h2>{annonces[0].titre}</h2>
                <p className="sl-spotlight-price">{Number(annonces[0].prix).toLocaleString('fr-FR')} Ar{annonces[0].mode === 'location' ? ' /mois' : ''}</p>
                <p className="muted"><Search size={13} /> {annonces[0].localisation?.ville} {annonces[0].localisation?.quartier ? `· ${annonces[0].localisation.quartier}` : ''}</p>
                <button className="sl-btn-red" onClick={() => navigate(`/annonces/${annonces[0].id}`)}>
                  Voir l’annonce <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===== TEMOIGNAGES ===== */}
        <section className="sl-section">
          <div className="sl-section-head center">
            <h2>Ils ont trouvé avec nous</h2>
          </div>
          <div className="sl-testis">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="sl-testi">
                <div className="sl-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < t.note ? '#e4002b' : 'none'} color="#e4002b" />
                  ))}
                </div>
                <p>« {t.texte} »</p>
                <div className="sl-testi-foot">
                  <span className="sl-avatar">{t.nom.charAt(0)}</span>
                  <div><strong>{t.nom}</strong><span>{t.role}</span></div>
                  <BadgeCheck size={15} className="sl-verified" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== FOOTER façon SeLoger ===== */}
      <footer className="sl-footer">
        <div className="sl-footer-top">
          <div className="sl-footer-col wide">
            <span className="sl-logo"><span className="sl-logo-mark">T&T</span><span className="sl-logo-text light">Tany&Toerana</span></span>
            <p>La plateforme qui relie chaque Malgache au bon toit, au bon prix.</p>
          </div>
          <div className="sl-footer-col">
            <strong>Explorer</strong>
            <Link to="/recherche?mode=location">Louer</Link>
            <Link to="/recherche?mode=vente">Acheter</Link>
            <Link to="/recherche?type=terrain">Terrains</Link>
          </div>
          <div className="sl-footer-col">
            <strong>Compte</strong>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
            <Link to="/messagerie">Messagerie</Link>
          </div>
          <div className="sl-footer-col">
            <strong>Aide</strong>
            <span>Guide d’utilisation</span>
            <span>Support chatbot</span>
            <span>Paiement Mobile Money</span>
          </div>
        </div>
        <div className="sl-footer-bottom">© {new Date().getFullYear()} Tany & Toerana — Location & vente à Madagascar.</div>
      </footer>

      <ChatBot />
    </div>
  )
}
