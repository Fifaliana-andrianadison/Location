import { useAuth } from '../context/AuthContext.jsx'
import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard.jsx'
import LocataireDashboard from '../components/dashboard/LocataireDashboard.jsx'
import AdminDashboard from '../components/dashboard/AdminDashboard.jsx'

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'proprietaire') return <ProprietaireDashboard />
  if (user?.role === 'admin') return <AdminDashboard />
  return <LocataireDashboard />
}
