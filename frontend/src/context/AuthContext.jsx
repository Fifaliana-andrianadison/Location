import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    authApi
      .getMe()
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const applyAuth = useCallback((data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  const signIn = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password })
      applyAuth(data)
      return data.user
    },
    [applyAuth]
  )

  const register = useCallback(
    async (payload) => {
      const { data } = await authApi.register(payload)
      applyAuth(data)
      return data.user
    },
    [applyAuth]
  )

  const signOut = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* token déjà invalide */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await authApi.getMe()
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  }, [])

  const value = {
    user,
    loading,
    signIn,
    register,
    signOut,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isProprietaire: user?.role === 'proprietaire',
    isLocataire: user?.role === 'locataire',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
