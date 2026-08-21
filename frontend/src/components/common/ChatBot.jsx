import { useEffect, useRef, useState } from 'react'
import { House, Send, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { demanderIA } from '../../api/chatbotApi.js'

const SUGGESTIONS = [
  'Comment rechercher un bien ?',
  'Comment payer le loyer ?',
  'Créer un compte',
  'Contacter un propriétaire',
]

const REGLES = [
  {
    test: /(bonjour|salut|hello|bonsoir|hey|misaotra)/i,
    reponse: 'Salama ! 👋 Je suis l\u2019assistant de Tany & Toerana. Je peux vous aider à rechercher un bien, vous inscrire, comprendre les paiements, ou contacter un propriétaire. Que souhaitez-vous savoir ?',
  },
  {
    test: /(budget|loyer|prix|tarif|co(u|û)t)/i,
    reponse: '💡 Sur la page « Rechercher un bien », vous entrez votre budget minimum et maximum avec le type de bien (terrain, maison, appartement…) et la ville. Les annonces s\u2019adaptent automatiquement à votre budget. Si vous créez un compte, vous pouvez aussi recevoir des alertes dès qu\u2019un bien correspond à votre budget.',
  },
  {
    test: /(maison|appartement|terrain|studio|bungalow|villa|bureau)/i,
    reponse: '🏠 Nous avons plusieurs types de biens : terrain, maison, appartement, studio, bungalow et bureau. Sur la page « Rechercher un bien », utilisez le filtre « Type de bien » et votre budget pour voir ce qui est disponible dans votre ville.',
  },
  {
    test: /(mvola|orange|airtel|money|paiement|payer|mobile money)/i,
    reponse: '💰 Le paiement du loyer se fait en ligne via Mvola, Orange Money ou Airtel Money. Depuis votre espace « Paiements », choisissez le contrat concerné, le montant, et validez le transfert. Le reçu est enregistré automatiquement.',
  },
  {
    test: /(inscri|compte|candidat|s'inscrire|register)/i,
    reponse: '📝 L\u2019inscription est gratuite et prend moins d\u2019une minute. Cliquez sur « Inscription » en haut à droite, choisissez votre rôle (locataire ou propriétaire) et remplissez le formulaire. C\u2019est ensuite que vous pouvez candidater, déposer vos documents et recevoir des alertes.',
  },
  {
    test: /(contact|proprietaire|joindre|message|appeler|telephone)/i,
    reponse: '📞 Chaque annonce dispose d\u2019un bouton « Contacter le propriétaire ». Vous arrivez alors dans la messagerie, où vous pouvez discuter directement avec lui. Connectez-vous pour pouvoir envoyer votre premier message.',
  },
  {
    test: /(recherche|trouver|cherche|location|louer|acheter)/i,
    reponse: '🔎 C\u2019est très simple : rendez-vous sur « Rechercher un bien » dans le menu en haut. Renseignez votre budget min./max., le type de bien et la ville, puis cliquez sur « Rechercher ». Vous pouvez aussi affiner avec les filtres (nombre de pièces, photos, géolocalisation…).',
  },
  {
    test: /(merci|misaotra)/i,
    reponse: 'Avec plaisir ! 🙏 N\u2019hésitez pas si vous avez d\u2019autres questions.',
  },
]

const FALLBACK =
  '🤔 Je n\u2019ai pas bien compris votre question. Essayez par exemple : « Comment rechercher un bien ? », « Comment payer le loyer ? » ou « Créer un compte ». Vous pouvez aussi utiliser les suggestions ci-dessous.'

function repondre(texte) {
  for (const r of REGLES) if (r.test.test(texte)) return r.reponse
  return FALLBACK
}

export default function ChatBot() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: user?.name
        ? `Salama ${user.name.split(' ')[0]} ! 👋 Je suis votre assistant immobilier. Comment puis-je vous aider ?`
        : 'Salama ! 👋 Bienvenue sur Tany & Toerana. Je suis votre assistant virtuel : posez-moi une question sur la recherche de biens, l\u2019inscription ou les paiements.',
    },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, open])

  const ask = async (texte) => {
    const t = texte.trim()
    if (!t || typing) return
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: t }])
    setInput('')
    setTyping(true)
    let reponse = ''
    try {
      const { reponse: ai } = await demanderIA(t)
      reponse = ai || repondre(t)
    } catch {
      reponse = repondre(t)
    }
    setTyping(false)
    setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: reponse }])
  }

  return (
    <>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-head">
            <span className="chatbot-avatar"><House size={18} /></span>
            <div>
              <strong>Assistant Tany &amp; Toerana</strong>
              <span className="chatbot-online">● En ligne</span>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} title="Fermer">
              <X size={17} />
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot-msg ${m.from}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-msg bot">
                <div className="bubble typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)}>{s}</button>
            ))}
          </div>

          <form
            className="chatbot-input"
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question…"
            />
            <button type="submit" className="btn" disabled={!input.trim() || typing}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button className="chatbot-fab" onClick={() => setOpen(!open)} title="Assistant" aria-label="Ouvrir l'assistant">
        {open ? <X size={24} /> : <House size={24} />}
        {!open && <span className="chatbot-badge"><Sparkles size={10} /></span>}
      </button>
    </>
  )
}