import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import './DatePicker.css'

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

function parse(value, mode) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m) return null
  return { y, m: m - 1, d: mode === 'month' ? 1 : d || 1 }
}

/**
 * Sélecteur de date au design unifié.
 * value : "YYYY-MM-DD" (mode "date") ou "YYYY-MM" (mode "month").
 * Un clic sur l'icône / le champ ouvre le calendrier, un second clic le referme.
 */
export default function DatePicker({ value, onChange, mode = 'date', min, max, placeholder, required, disabled }) {
  const sel = parse(value, mode)
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [vue, setVue] = useState({ y: sel?.y ?? now.getFullYear(), m: sel?.m ?? now.getMonth() })
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (disabled) return
    if (!open && sel) setVue({ y: sel.y, m: sel.m })
    setOpen((o) => !o)
  }

  const cases = useMemo(() => {
    const premier = new Date(vue.y, vue.m, 1)
    const decalage = (premier.getDay() + 6) % 7 // lundi = 0
    const debut = new Date(vue.y, vue.m, 1 - decalage)
    return Array.from({ length: 42 }, (_, i) => {
      const dt = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i)
      return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), autre: dt.getMonth() !== vue.m }
    })
  }, [vue])

  const horsLimite = (v) => (min && v < min) || (max && v > max)

  const choisir = (v) => {
    if (horsLimite(v)) return
    onChange?.(mode === 'month' ? v.slice(0, 7) : v)
    setOpen(false)
  }

  const naviguer = (delta) => {
    if (mode === 'month') setVue((v) => ({ ...v, y: v.y + delta }))
    else {
      const dt = new Date(vue.y, vue.m + delta, 1)
      setVue({ y: dt.getFullYear(), m: dt.getMonth() })
    }
  }

  const aujourdhui = iso(now.getFullYear(), now.getMonth(), now.getDate())
  const valeurIso = sel ? iso(sel.y, sel.m, sel.d) : ''
  const affichage = sel
    ? mode === 'month'
      ? `${MOIS[sel.m]} ${sel.y}`
      : `${pad(sel.d)}/${pad(sel.m + 1)}/${sel.y}`
    : ''

  return (
    <div className="dp" ref={ref}>
      <div className={`dp-field${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}>
        <input
          type="text"
          readOnly
          value={affichage}
          placeholder={placeholder || (mode === 'month' ? 'Choisir un mois' : 'jj/mm/aaaa')}
          required={required}
          disabled={disabled}
          onClick={toggle}
        />
        <button type="button" className="dp-icon" onClick={toggle} aria-label="Ouvrir / fermer le calendrier" aria-expanded={open}>
          <Calendar size={16} />
        </button>
      </div>

      {open && (
        <div className="dp-pop" role="dialog">
          <div className="dp-head">
            <button type="button" className="dp-nav" onClick={() => naviguer(-1)} aria-label="Précédent"><ChevronLeft size={18} /></button>
            <strong>{mode === 'month' ? vue.y : `${MOIS[vue.m]} ${vue.y}`}</strong>
            <button type="button" className="dp-nav" onClick={() => naviguer(1)} aria-label="Suivant"><ChevronRight size={18} /></button>
          </div>

          {mode === 'month' ? (
            <div className="dp-months">
              {MOIS.map((nom, i) => {
                const v = iso(vue.y, i, 1)
                const actif = sel && sel.y === vue.y && sel.m === i
                const courant = now.getFullYear() === vue.y && now.getMonth() === i
                return (
                  <button
                    key={nom}
                    type="button"
                    className={`dp-cell${actif ? ' is-selected' : ''}${courant && !actif ? ' is-today' : ''}`}
                    disabled={horsLimite(v)}
                    onClick={() => choisir(v)}
                  >
                    {nom.slice(0, 4)}{nom.length > 4 ? '.' : ''}
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              <div className="dp-week">{JOURS.map((j) => <span key={j}>{j}</span>)}</div>
              <div className="dp-grid">
                {cases.map((c) => {
                  const v = iso(c.y, c.m, c.d)
                  const actif = v === valeurIso
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`dp-cell${c.autre ? ' is-other' : ''}${actif ? ' is-selected' : ''}${v === aujourdhui && !actif ? ' is-today' : ''}`}
                      disabled={horsLimite(v)}
                      onClick={() => choisir(v)}
                    >
                      {c.d}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
