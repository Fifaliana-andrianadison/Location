import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck, Bell } from 'lucide-react'
import { getNotifications } from '../api/notificationApi.js'
import { useNotifications } from '../context/NotificationContext.jsx'
import { formatDateTime } from '../utils/format.js'

export default function Notifications() {
  const { markAllLues, markLue } = useNotifications()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)

  const load = (p = 1) => {
    getNotifications({ page: p, per_page: 20 })
      .then(({ data }) => {
        setItems(data.data ?? [])
        setMeta(data.meta)
      })
      .catch(() => {})
  }

  useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const toutMarquer = async () => {
    setBusy(true)
    try {
      await markAllLues()
      load(page)
    } finally {
      setBusy(false)
    }
  }

  const marquerUne = async (n) => {
    if (n.lue) return
    try {
      await markLue(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, lue: true } : x)))
    } catch { /* ignore */ }
  }

  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page" style={{ margin: 0 }}><Bell size={17} /> Notifications</h1>
        <button className="btn secondary small" disabled={busy} onClick={toutMarquer}>
          <CheckCheck size={14} /> Tout marquer comme lu
        </button>
      </div>
      {items.length === 0 ? (
        <div className="card empty">Aucune notification pour le moment.</div>
      ) : (
        <div className="notif-list">
          {items.map((n) => (
            <div
              key={n.id}
              className={`card notif-item ${n.lue ? '' : 'unread'}`}
              onClick={() => marquerUne(n)}
            >
              <div className="notif-content">
                <strong>{n.titre}</strong>
                <p>{n.contenu}</p>
                <span className="muted">{formatDateTime(n.created_at)}</span>
              </div>
              {n.lien && <Link to={n.lien} className="btn small secondary">Voir</Link>}
            </div>
          ))}
        </div>
      )}
      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button className="btn small secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
          <span className="muted">Page {meta.current_page}/{meta.last_page}</span>
          <button className="btn small secondary" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Suivant</button>
        </div>
      )}
    </div>
  )
}