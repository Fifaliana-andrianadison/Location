import { useEffect, useRef, useState } from 'react'
import { Send, Paperclip, Smile, Phone, Video, X, Image as ImageIcon } from 'lucide-react'
import { getMessages, sendMessage, reactToMessage } from '../../api/messageApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDateTime, assetUrl } from '../../utils/format.js'

const EMOJIS = ['😀','😂','😍','👍','🙏','❤️','😎','🤔','😢','🎉','🔥','✨','😊','🤝','👏']

export default function ChatBox({ interlocuteur, locationId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [callStatus, setCallStatus] = useState('idle')
  const [callType, setCallType] = useState('audio')
  const [localStream, setLocalStream] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!interlocuteur) return
    let active = true
    const load = () =>
      getMessages(interlocuteur.id, locationId ? { location_id: locationId } : {})
        .then(({ data }) => {
          if (active) {
            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
            setMessages(list)
          }
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

  useEffect(() => {
    if (!file) { setFilePreview(null); return }
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const hangUp = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop())
      setLocalStream(null)
    }
    setCallStatus('idle')
    setCallOpen(false)
  }

  const startCall = async (video = false) => {
    setCallType(video ? 'vidéo' : 'audio')
    setCallOpen(true)
    setCallStatus('ringing')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video })
      setLocalStream(stream)
      setCallStatus('connected')
    } catch {
      setCallStatus('error')
    }
  }

  if (!interlocuteur) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#64748b' }}>
        Sélectionnez une conversation pour commencer à discuter.
      </div>
    )
  }

  const send = async (e) => {
    e.preventDefault()
    if ((!contenu.trim() && !file) || busy) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('receiver_id', interlocuteur.id)
      if (locationId) fd.append('location_id', locationId)
      fd.append('contenu', contenu.trim())
      if (file) fd.append('attachment', file)
      const { data } = await sendMessage(fd)
      setMessages((prev) => [...prev, data])
      setContenu('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch { /* ignore */ } finally {
      setBusy(false)
    }
  }

  const addEmoji = (em) => {
    setContenu((c) => c + em)
    setEmojiOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
          {interlocuteur.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{interlocuteur.name}</strong>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>● En ligne</span>
        </div>
        <button type="button" onClick={() => startCall(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: '0.4rem', borderRadius: '50%' }} title="Appel audio">
          <Phone size={20} />
        </button>
        <button type="button" onClick={() => startCall(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: '0.4rem', borderRadius: '50%' }} title="Appel vidéo">
          <Video size={20} />
        </button>
      </div>

      {/* Thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f0f2f5' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '2rem' }}>Aucun message. Dites bonjour ! 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id
          const counts = (m.reactions || []).reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1
            return acc
          }, {})
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '0.5rem' }}>
              {!mine && (
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#cbd5e1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                  {interlocuteur.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
              <div style={{ maxWidth: '70%' }}>
                <div style={{
                  background: mine ? '#0084ff' : '#e4e6eb',
                  color: mine ? '#fff' : '#050505',
                  padding: '0.55rem 0.9rem',
                  borderRadius: 18,
                  borderBottomRightRadius: mine ? 4 : 18,
                  borderBottomLeftRadius: mine ? 18 : 4,
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}>
                  {m.contenu && <div>{m.contenu}</div>}
                  {m.attachment && (
                    <img src={assetUrl(m.attachment)} alt="fichier" style={{ maxWidth: '100%', borderRadius: 12, marginTop: m.contenu ? '0.4rem' : 0, display: 'block' }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem', flexWrap: 'wrap', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  {Object.entries(counts).map(([em, n]) => (
                    <span key={em} style={{ fontSize: '0.7rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '0.05rem 0.4rem' }}>{em} {n}</span>
                  ))}
                  <div style={{ display: 'flex', gap: '0.15rem' }}>
                    {['👍','❤️','😂'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={async () => {
                          try {
                            const { data } = await reactToMessage(m.id, em)
                            setMessages((prev) => prev.map((x) => (x.id === m.id ? data : x)))
                          } catch { /* ignore */ }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: '0.1rem', opacity: 0.6 }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#65676b', alignSelf: 'center' }}>{formatDateTime(m.created_at)}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Preview fichier */}
      {filePreview && (
        <div style={{ padding: '0.5rem 1rem', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={filePreview} alt="preview" style={{ height: 48, borderRadius: 8 }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', flex: 1 }}>{file?.name}</span>
          <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <button type="button" onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0084ff', padding: '0.4rem', borderRadius: '50%' }} title="Joindre une image">
          <ImageIcon size={20} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setEmojiOpen((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0084ff', padding: '0.4rem', borderRadius: '50%' }} title="Emoji">
            <Smile size={20} />
          </button>
          {emojiOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: 220 }}>
              {EMOJIS.map((em) => (
                <button key={em} type="button" onClick={() => addEmoji(em)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem', borderRadius: 6 }}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Aa"
          style={{ flex: 1, border: 'none', background: '#f0f2f5', borderRadius: 20, padding: '0.6rem 1rem', fontSize: '0.9rem', outline: 'none' }}
        />
        <button type="submit" disabled={busy || (!contenu.trim() && !file)} style={{ background: '#0084ff', border: 'none', cursor: 'pointer', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', opacity: (busy || (!contenu.trim() && !file)) ? 0.5 : 1 }}>
          <Send size={16} />
        </button>
      </form>

      {callOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 1000 }} onClick={hangUp}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: 320, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Appel {callType} {callStatus === 'connected' ? 'en cours' : callStatus === 'ringing' ? 'sonnerie…' : callStatus === 'error' ? '(erreur)' : ''}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Avec {interlocuteur.name}</p>
            {localStream && <audio autoPlay ref={(el) => { if (el) el.srcObject = localStream }} />}
            <button onClick={hangUp} style={{ marginTop: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 999, padding: '0.6rem 1.5rem', cursor: 'pointer' }}>
              Raccrocher
            </button>
          </div>
        </div>
      )}
    </div>
  )
}