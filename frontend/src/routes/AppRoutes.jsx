import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/common/AppLayout.jsx'
import PrivateRoute from './PrivateRoute.jsx'
import Landing from '../pages/Landing.jsx'
import ResultatsRecherche from '../pages/ResultatsRecherche.jsx'
import DetailBien from '../pages/DetailBien.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import MesCandidatures from '../pages/MesCandidatures.jsx'
import MesProprietes from '../pages/MesProprietes.jsx'
import AjouterPropriete from '../pages/AjouterPropriete.jsx'
import MesFavoris from '../pages/MesFavoris.jsx'
import MesAlertes from '../pages/MesAlertes.jsx'
import Messagerie from '../pages/Messagerie.jsx'
import MesPaiements from '../pages/MesPaiements.jsx'
import MesContrats from '../pages/MesContrats.jsx'
import MonLitiges from '../pages/MonLitiges.jsx'
import Notifications from '../pages/Notifications.jsx'
import ValidationBiens from '../pages/Admin/ValidationBiens.jsx'
import Statistiques from '../pages/Admin/Statistiques.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Site({ children }) {
  return <AppLayout>{children}</AppLayout>
}

function App({ children }) {
  return <AppLayout><PrivateRoute>{children}</PrivateRoute></AppLayout>
}

function AppRole({ role, children }) {
  return <AppLayout><PrivateRoute role={role}>{children}</PrivateRoute></AppLayout>
}

function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 420, margin: '3rem auto', textAlign: 'center' }}>
      <h2>Page introuvable</h2>
      <p className="muted">La page demandée n'existe pas.</p>
      <a className="btn" href="/">Retour à l'accueil</a>
    </div>
  )
}

export default function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Landing />} />
      <Route path="/recherche" element={<Site><ResultatsRecherche /></Site>} />
      <Route path="/annonces/:id" element={<Site><DetailBien /></Site>} />

      <Route path="/dashboard" element={<App><Dashboard /></App>} />
      <Route path="/mes-candidatures" element={<App><MesCandidatures /></App>} />
      <Route path="/mes-favoris" element={<App><MesFavoris /></App>} />
      <Route path="/mes-alertes" element={<App><MesAlertes /></App>} />
      <Route path="/messagerie" element={<App><Messagerie /></App>} />
      <Route path="/mes-paiements" element={<App><MesPaiements /></App>} />
      <Route path="/mes-contrats" element={<App><MesContrats /></App>} />
      <Route path="/mes-litiges" element={<App><MonLitiges /></App>} />
      <Route path="/notifications" element={<App><Notifications /></App>} />

      <Route path="/mes-proprietes" element={<AppRole role="proprietaire"><MesProprietes /></AppRole>} />
      <Route path="/ajouter-propriete" element={<AppRole role="proprietaire"><AjouterPropriete /></AppRole>} />
      <Route path="/admin/validations" element={<AppRole role="admin"><ValidationBiens /></AppRole>} />
      <Route path="/admin/statistiques" element={<AppRole role="admin"><Statistiques /></AppRole>} />

      <Route path="*" element={<Site><NotFound /></Site>} />
    </Routes>
  )
}
