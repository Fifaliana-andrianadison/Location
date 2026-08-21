import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChatBox from '../components/messagerie/ChatBox.jsx'
import { getConversations } from '../api/messageApi.js'
import { formatDateTime } from '../utils/format.js'

export default function Messagerie() {
  const [params, setParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)

  const withUserId = Number(params.get('with_user')) || null

  useEffect(() => {
    getConversations()
      .then(({ data }) => {
        setConversations(data ?? [])
        if (withUserId) {
          const c = (data ?? []).find((x) => x.user?.id === withUserId)
          if (c) setSelected(c)
          else {
            const fake = { user: { id: withUserId, name: 'Interlocuteur' } }
            setSelected(fake)
          }
        }
      })
      .catch(() => {})
  }, [withUserId])

  const ouvrir = (c) => {
    setSelected(c)
    setParams({ with_user: c.user.id })
  }

  return (
    <div className="page">
      <h1 className="page">Messagerie</h1>
      <div className="messagerie">
        <aside className="conv-list">
          {conversations.length === 0 ? (
            <div className="card empty">
              Aucune conversation. Contactez un propriétaire depuis une annonce pour commencer.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user.id}
                className={`conv-item ${selected?.user?.id === c.user.id ? 'active' : ''}`}
                onClick={() => ouvrir(c)}
              >
                <span className="avatar">{c.user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                <div className="conv-info">
                  <strong>{c.user.name || 'Interlocuteur'}</strong>
                  <span className="muted">{c.dernier_message || 'Aucun message'}</span>
                </div>
                {c.non_lus > 0 && <span className="badge badge-red">{c.non_lus}</span>}
              </button>
            ))
          )}
        </aside>
        <div className="conv-chat">
          {selected && (
            <>
              <p className="muted" style={{ padding: '0 0 0.5rem' }}>
                Conversation avec {selected.user.name || 'Interlocuteur'} · dernier message {formatDateTime(selected.dernier_a)}
              </p>
            </>
          )}
          <ChatBox interlocuteur={selected?.user || null} />
        </div>
      </div>
    </div>
  )
}