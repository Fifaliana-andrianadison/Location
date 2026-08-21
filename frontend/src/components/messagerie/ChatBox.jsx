import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { getMessages, sendMessage } from '../../api/messageApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDateTime } from '../../utils/format.js'

export default function ChatBox({ interlocuteur, locationId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!interlocuteur) return
    let active = true
    const load = () =>
      getMessages(interlocuteur.id, locationId ? { location_id: locationId } : {})
        .then(({ data }) => {
          if (active) setMessages(data.data ?? data)
        })
        .catch(() => {})
    load()
    let timer
    if (interlocuteur && user) timer = setInterval(load, 5000)
    return () => {
      active = false
      if (timer) clearInterval(timer)
    }
  }, [interlocuteur?.id, locationId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!interlocuteur) {
    return (
      <div className="card empty">
        Sélectionnez une conversation pour commencer à discuter.
      </div>
    )
  }

  const send = async (e) => {
    e.preventDefault()
    if (!contenu.trim() || busy) return
    setBusy(true)
    try {
      const { data } = await sendMessage({
        receiver_id: interlocuteur.id,
        location_id: locationId || undefined,
        contenu: contenu.trim(),
      })
      setMessages((prev) => [...prev, data])
      setContenu('')
    } catch { /* ignore */ } finally {
      setBusy(false)
    }
  }

  return (
    <div className="chat-box">
      <div className="chat-head">
        <span className="avatar">{interlocuteur.name.charAt(0).toUpperCase()}</span>
        <strong>{interlocuteur.name}</strong>
      </div>
      <div className="chat-thread">
        {messages.length === 0 && (
          <p className="muted empty">Aucun message. Dites bonjour !</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.sender_id === user?.id ? 'mine' : ''}`}>
            <div className="bubble">
              <p>{m.contenu}</p>
              <span className="muted">{formatDateTime(m.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={send}>
        <input
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrivez votre message…"
        />
        <button type="submit" className="btn" disabled={busy || !contenu.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}