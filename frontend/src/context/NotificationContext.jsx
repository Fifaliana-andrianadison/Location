import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { getNonLus, marquerLue, marquerToutesLues } from '../api/notificationApi.js'

const NotificationContext = createContext(null)

const INTERVALLE = 15000

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    if (!user) {
      setCount(0)
      return
    }
    getNonLus()
      .then(({ data }) => setCount(data.count ?? 0))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, INTERVALLE)
    return () => clearInterval(timer)
  }, [refresh])

  const markAllLues = useCallback(async () => {
    await marquerToutesLues()
    setCount(0)
  }, [])

  const markLue = useCallback(
    async (id) => {
      await marquerLue(id)
      setCount((c) => Math.max(0, c - 1))
    },
    []
  )

  return (
    <NotificationContext.Provider value={{ count, refresh, markAllLues, markLue }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
