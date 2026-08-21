import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Bell, Building2, FileSignature, Handshake, LogIn, LogOut, MapPin,
  Menu, Search, ShieldCheck, Star, UserPlus, Wallet, X, CheckCircle2, TrendingUp, Clock, Zap,
} from 'lucide-react'
import AnnonceList from '../components/annonce/AnnonceList.jsx'
import ChatBot from '../components/common/ChatBot.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import { useAnnonces } from '../hooks/useAnnonces.js'
import { useAuth } from '../context/AuthContext.jsx'
import { assetUrl } from '../utils/format.js'

const VILLES = ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa', 'Nosy Be', 'Toliara', 'Diégo-Suarez']

const RAISONS = [
  { icon: <Search size={22} />, num: '01', titre: 'La recherche qui vous écoute', texte: 'Votre budget est le point de départ, pas une option. Toutes les annonces s’affichent ou s’excluent selon le réel de votre portefeuille.' },
  { icon: <ShieldCheck size={22} />, num: '02', titre: 'Des biens vérifiés, pas des mirages', texte: 'Identité des propriétaires et titres fonciers contrôlés avant publication. Ce que vous voyez existe vraiment.' },
  { icon: <FileSignature size={22} />, num: '03', titre: 'Fini les allers-retours', texte: 'Candidature, documents, contrat de bail et signature : tout se fait en ligne, sans papier, sans déplacement inutile.' },
  { icon: <Wallet size={22} />, num: '04', titre: 'Payez comme bon vous semble', texte: 'Mvola, Orange Money, Airtel Money : votre loyer part en 30 secondes, le reçu s’enregistre tout seul.' },
  { icon: <Bell size={22} />, num: '05', titre: 'Soyez le premier informé', texte: 'Activez une alerte sur votre budget : le jour où le bien parfait apparaît, vous êtes prévenu avant tout le monde.' },
  { icon: <Handshake size={22} />, num: '06', titre: 'Conflits sous contrôle', texte: 'Tout est tracé : paiements, états des lieux, échanges. En cas de litige, la plateforme garde la preuve de chaque étape.' },
]

const ETAPES = [
  { num: '01', titre: 'Fixez votre budget', texte: 'Un budget, une ville, un type de bien. La plateforme trie, vous n’avez plus qu’à choisir.', icone: <Clock size={20} /> },
  { num: '02', titre: 'Candidatez en 2 minutes', texte: 'Votre profil et vos documents sont prêts. Un clic et le propriétaire reçoit tout, proprement.', icone: <Zap size={20} /> },
  { num: '03', titre: 'Signez à distance', texte: 'Contrat PDF généré, signatures électroniques des deux côtés. Légal, lisible, archivé.', icone: <FileSignature size={20} /> },
  { num: '04', titre: 'Payez et respirez', texte: 'Loyer par Mobile Money, reçus automatiques, historique complet. La gestion vous quitte l’esprit.', icone: <Wallet size={20} /> },
]

const TEMOIGNAGES = [
  { nom: 'Raharimanana Naina', role: 'Locataire — Antananarivo', note: 5, texte: 'J’avais un budget serré et des semaines de recherche infructueuse ailleurs. Ici, la recherche par budget m’a trouvé un studio en 3 jours. Tout a été signé en ligne.' },
  { nom: 'Rakotoarisoa Mamy', role: 'Propriétaire — Ivandry', note: 5, texte: 'Les candidatures arrivent avec documents joints, propres et complets. Les loyers tombent par Mvola, le tableau de bord me dit tout. Je ne reviendrai pas en arrière.' },
  { nom: 'Andrianarivo Hery', role: 'Propriétaire — Andravoahangy', note: 5, texte: 'Deux contrats de bail signés à distance en une semaine. Mes locataires sont mieux encadrés et les impayés suivis automatiquement.' },
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
  const premieresAnnonces = annonces.slice(0, 2)
  const heroImage = annonces[0]?.image_principale || annonces[0]?.images?.[0]?.path || null

  const typesCards = ['maison', 'appartement', 'terrain']
    .map((type) => {
      const a = annonces.find((x) => x.type === type)
      return a
        ? {
            type,
            titre: type === 'maison' ? 'Maisons & villas' : type === 'appartement' ? 'Appartements' : 'Terrains à vendre',
            image: a.image_principale || a.images?.[0]?.path,
          }
        : null
    })
    .filter(Boolean)

  const villesCards = Object.entries(
    annonces.reduce((acc, a) => {
      const v = a.localisation?.ville
      if (!v) return acc
      if (!acc[v]) acc[v] = { image: a.image_principale || a.images?.[0]?.path, count: 0 }
      acc[v].count += 1
      return acc
    }, {})
  ).map(([ville, v]) => ({ ville, ...v }))

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="landing-page">
      <header className="lp-nav">
        <div className="lp-nav-top">
          <Link to="/" className="lp-brand">
            <span className="lp-logo"><MapPin size={18} /></span>
            <span>Tany &amp; Toerana</span>
          </Link>

          <nav className={`lp-menu ${menuOpen ? 'open' : ''}`}>
            <a href="#pourquoi">Pourquoi nous ?</a>
            <a href="#parcours">Parcours</a>
            <a href="#annonces">Annonces</a>
            <a href="#temoignages">Témoignages</a>
          </nav>

          <div className="lp-actions">
            {user ? (
              <>
                <button className="btn ghost lp-ghost" onClick={logout} title="Déconnexion"><LogOut size={15} /></button>
                <button className="btn" onClick={() => navigate('/dashboard')}>Mon espace <ArrowRight size={15} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn ghost lp-ghost"><LogIn size={15} /> Connexion</Link>
                <Link to="/register" className="btn"><UserPlus size={15} /> Créer mon compte</Link>
              </>
            )}
          </div>

          <button className="icon-btn lp-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section
          className="lp-hero"
          style={heroImage ? { backgroundImage: `linear-gradient(rgba(11, 16, 32, 0.82), rgba(30, 27, 75, 0.78)), url(${assetUrl(heroImage)})` } : undefined}
        >
          <div className="lp-blob b1" />
          <div className="lp-blob b2" />
          <div className="lp-hero-inner">
            <div className="lp-hero-text">
              <span className="lp-badge"><span className="lp-pulse" /> La plateforme immobilière de Madagascar</span>

              <h1>Le bon toit, au <em>bon prix</em>,<br />au <em className="vert">bon moment</em>.</h1>

              <p className="lp-sub">
                Appartements, maisons et terrains, filtrés par <strong>votre budget réel</strong>.
                Candidature en ligne, contrat numérisé et loyer payable par Mvola, Orange ou Airtel Money.
              </p>

              <div className="lp-hero-ctas">
                <button className="btn lg" onClick={() => navigate('/recherche')}>
                  Explorer les annonces <ArrowRight size={16} />
                </button>
                <a href="#pourquoi" className="btn lg lp-hero-secondary">Comment ça marche</a>
              </div>

              <div className="lp-hero-meta">
                <span><ShieldCheck size={14} /> Propriétaires vérifiés</span>
                <span><Wallet size={14} /> Paiement Mobile Money</span>
                <span><CheckCircle2 size={14} /> Sans commission cachée</span>
              </div>

              <div className="lp-hero-stats">
                <div><strong>{meta?.total ?? 10}+</strong><span>annonces actives</span></div>
                <div><strong>7</strong><span>villes couvertes</span></div>
                <div><strong>3</strong><span>opérateurs Mobile Money</span></div>
                <div><strong>100%</strong><span>digital</span></div>
              </div>
            </div>

            <div className="lp-hero-visual">
              {premieresAnnonces[0] ? (
                <>
                  <div className="lp-hero-card main">
                    <img
                      src={assetUrl(premieresAnnonces[0].image_principale || premieresAnnonces[0].images?.[0]?.path || '')}
                      alt={premieresAnnonces[0].titre}
                    />
                    <div className="lp-hero-card-over">
                      <span className="lp-hero-price">
                        {Number(premieresAnnonces[0].prix).toLocaleString('fr-FR')} Ar
                      </span>
                      <span className="lp-hero-title">{premieresAnnonces[0].titre}</span>
                    </div>
                  </div>

                  <div className="lp-hero-card side top">
                    <span className="lp-side-ico green"><BadgeCheck size={16} /></span>
                    <div>
                      <strong>Propriétaire vérifié</strong>
                      <small>Identité et titre foncier contrôlés</small>
                    </div>
                  </div>

                  <div className="lp-hero-card side bottom">
                    <span className="lp-side-ico indigo"><FileSignature size={16} /></span>
                    <div>
                      <strong>Contrat signé en ligne</strong>
                      <small>Signature électronique en 2 min</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="lp-hero-card main placeholder">
                  <div className="lp-placeholder">Photos des annonces</div>
                </div>
              )}
            </div>
          </div>

          <div className="lp-hero-search">
            <SearchBar onSubmit={handleSearch} />
            <p className="lp-search-note">
              <Search size={13} /> Les résultats s'affichent ici, directement sur cette page — la connexion n'est demandée qu'après, lorsque vous avez trouvé le bien.
            </p>
          </div>
        </section>

        {/* ================= MARQUEE ================= */}
        <div className="lp-marquee">
          <div className="lp-marquee-track">
            {[...VILLES, ...VILLES].map((v, i) => (
              <span key={i}><MapPin size={13} /> {v}</span>
            ))}
          </div>
        </div>

        {/* ================= PAR TYPE DE BIEN ================= */}
        {typesCards.length > 0 && (
          <section className="lp-section">
            <div className="lp-head">
              <span className="lp-kicker">Trouvez par type</span>
              <h2>Ce qu'il vous faut, <em>rien d'autre</em></h2>
              <p className="muted">
                Appartements en ville, maisons pour la famille ou terrains à bâtir : chaque annonce
                est décrite, photographiée et géolocalisée.
              </p>
            </div>
            <div className="lp-types">
              {typesCards.map((c) => (
                <button key={c.type} className="lp-type-card" onClick={() => navigate(`/recherche?type=${c.type}`)}>
                  <span className="lp-type-img" style={{ backgroundImage: `url(${assetUrl(c.image)})` }} />
                  <span className="lp-type-over" />
                  <span className="lp-type-label">
                    <strong>{c.titre}</strong>
                    <small>Voir les annonces <ArrowRight size={12} /></small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ================= POURQUOI ================= */}
        <section id="pourquoi" className="lp-section">
          <div className="lp-head">
            <span className="lp-kicker">Pourquoi nous ?</span>
            <h2>Vous méritez un meilleur parcours<br /><em>que les annonces sans fin.</em></h2>
            <p className="muted">
              Les bonnes adresses ne manquent pas à Madagascar — ce qui manque, c’est un moyen
              fiable de trouver la vôtre, sans arnaque ni perte de temps. C’est exactement ce que nous avons construit.
            </p>
          </div>

          <div className="lp-raisons">
            {RAISONS.map((r) => (
              <div key={r.num} className="lp-raison">
                <div className="lp-raison-top">
                  <span className="lp-raison-ico">{r.icon}</span>
                  <span className="lp-raison-num">{r.num}</span>
                </div>
                <h3>{r.titre}</h3>
                <p className="muted">{r.texte}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= PARCOURS (sombre) ================= */}
        <section id="parcours" className="lp-parcours">
          <div className="lp-head light">
            <span className="lp-kicker">Le parcours</span>
            <h2>De « j’aimerais trouver » à « c’est fait »,<br /><em>en quatre étapes.</em></h2>
          </div>
          <div className="lp-etapes">
            {ETAPES.map((e) => (
              <div key={e.num} className="lp-etape">
                <div className="lp-etape-ico">{e.icone}</div>
                <span className="lp-etape-num">{e.num}</span>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= VILLES POPULAIRES ================= */}
        {villesCards.length > 0 && (
          <section className="lp-section">
            <div className="lp-head">
              <span className="lp-kicker">Villes populaires</span>
              <h2>Là où les Malgaches <em>cherchent et trouvent</em></h2>
              <p className="muted">
                Antananarivo et au-delà : consultez les annonces actives de chaque ville,
                puis connectez-vous seulement pour finaliser votre choix.
              </p>
            </div>
            <div className="lp-villes">
              {villesCards.map((c) => (
                <button key={c.ville} className="lp-ville-card" onClick={() => navigate(`/recherche?ville=${encodeURIComponent(c.ville)}`)}>
                  <span className="lp-ville-img" style={{ backgroundImage: `url(${assetUrl(c.image)})` }} />
                  <span className="lp-ville-over" />
                  <span className="lp-ville-label">
                    <MapPin size={14} />
                    <div>
                      <strong>{c.ville}</strong>
                      <small>{c.count} annonce{c.count > 1 ? 's' : ''}</small>
                    </div>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ================= ANNONCES / RÉSULTATS ================= */}
        <section id="annonces" className="lp-section">
          <div className="lp-head row">
            <div>
              <span className="lp-kicker">{rechercheActive ? 'Résultats de votre recherche' : 'Annonces récentes'}</span>
              <h2>
                {rechercheActive ? (
                  <>Ce qui correspond à <em>votre budget</em></>
                ) : (
                  <>Ça vient de tomber dans <em>votre ville</em></>
                )}
              </h2>
            </div>
            <div className="lp-head-actions">
              {rechercheActive && (
                <button
                  className="btn ghost"
                  onClick={() => {
                    setRechercheActive(false)
                    search({ per_page: 8 })
                  }}
                >
                  <X size={15} /> Réinitialiser
                </button>
              )}
              <button className="btn secondary" onClick={() => navigate('/recherche')}>
                Voir toutes les annonces <ArrowRight size={15} />
              </button>
            </div>
          </div>
          {rechercheActive && meta && (
            <p className="muted lp-result-count">
              {meta.total} bien(s) trouvé(s) pour votre recherche. Connectez-vous quand vous avez trouvé votre bien.
            </p>
          )}
          <AnnonceList data={data} meta={meta} loading={loading} error={error} onPageChange={setPage} />
        </section>

        {/* ================= BANDE STATS ================= */}
        <section className="lp-stats-band">
          <div><strong>07</strong><span>régions</span></div>
          <div><strong>10+</strong><span>annonces en ligne</span></div>
          <div><strong>24/7</strong><span>candidatures ouvertes</span></div>
          <div><strong>100%</strong><span>digital</span></div>
        </section>

        {/* ================= TÉMOIGNAGES ================= */}
        <section id="temoignages" className="lp-section">
          <div className="lp-head">
            <span className="lp-kicker">Ils l’ont fait</span>
            <h2>Des milliers de toits trouvés.<br /><em>Écoutez leurs histoires.</em></h2>
          </div>
          <div className="lp-testis">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="lp-testi">
                <div className="lp-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < t.note ? '#fbbf24' : 'none'} color="#fbbf24" />
                  ))}
                </div>
                <p>« {t.texte} »</p>
                <div className="lp-testi-foot">
                  <span className="avatar">{t.nom.charAt(0)}</span>
                  <div><strong>{t.nom}</strong><span className="muted">{t.role}</span></div>
                  <BadgeCheck size={15} className="lp-verified" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA FINAL ================= */}
        <section className="lp-final">
          <div className="lp-final-inner">
            <span className="lp-kicker light">Prêt ?</span>
            <h2>Votre prochain chez-vous<br /><em>est à une recherche de vous.</em></h2>
            <p className="muted">
              Inscription gratuite, sans engagement. Créez votre compte en 60 secondes
              et vos alertes personnalisées se chargent du reste.
            </p>
            <div className="lp-final-ctas">
              <button className="btn lg" onClick={() => navigate('/register')}>
                Commencer maintenant <ArrowRight size={16} />
              </button>
              <span className="lp-reassurance"><CheckCircle2 size={15} /> Gratuit · Connectez-vous quand vous avez trouvé votre bien</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-col wide">
            <Link to="/" className="lp-brand light"><span className="lp-logo"><MapPin size={16} /></span> Tany &amp; Toerana</Link>
            <p className="muted">La plateforme qui relie chaque Malgache au bon toit, au bon prix, au bon moment.</p>
          </div>
          <div className="lp-footer-col">
            <strong>Explorer</strong>
            <Link to="/recherche">Rechercher un bien</Link>
            <Link to="/register">Devenir locataire</Link>
            <Link to="/register?role=proprietaire">Devenir propriétaire</Link>
          </div>
          <div className="lp-footer-col">
            <strong>Compte</strong>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
            <Link to="/messagerie">Messagerie</Link>
          </div>
          <div className="lp-footer-col">
            <strong>Ressources</strong>
            <span>Guide d'utilisation</span>
            <span>Support avec le chatbot 🏠</span>
            <span>Statistiques admin</span>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © {new Date().getFullYear()} Tany &amp; Toerana — Projet de démonstration. <TrendingUp size={12} /> Tous droits réservés.
        </div>
      </footer>

      <ChatBot />
    </div>
  )
}