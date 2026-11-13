import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Transition « livre qui s'ouvre » entre /login et /register.
 *
 * Deux temps :
 *  1. la page courante se referme (turning = 'out') pendant ~400 ms
 *  2. navigation puis la page d'arrivée s'ouvre (turning = 'in')
 *
 * Le marqueur est lu au tout premier rendu (fonction d'initialisation) afin de
 * rester fiable même avec React.StrictMode (double invocation des effets en dev).
 */
const KEY = 'auth-book-pending'

function readPending() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function clearPending() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function useBook() {
  const navigate = useNavigate()
  const location = useLocation()
  const [turning, setTurning] = useState(() => (readPending() ? 'in' : null))
  const first = useRef(true)
  const timer = useRef(null)
  const started = useRef(turning === 'in')

  // Nettoie le marqueur une fois l'ouverture lancée.
  useEffect(() => {
    if (started.current) clearPending()
  }, [])

  // Ferme l'ouverture après la durée de l'animation.
  useEffect(() => {
    if (turning !== 'in') return
    const t = setTimeout(() => setTurning(null), 700)
    return () => clearTimeout(t)
  }, [turning])

  // Navigation sans transition (bouton retour du navigateur…) : on nettoie.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (started.current) {
      started.current = false
      return
    }
    setTurning(null)
  }, [location.pathname])

  const go = (e, to) => {
    if (e) e.preventDefault()
    if (to === location.pathname) return
    setTurning('out')
    timer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* ignore */
      }
      navigate(to)
    }, 400)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return { turning, go }
}
