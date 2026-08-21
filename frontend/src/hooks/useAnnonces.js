import { useCallback, useEffect, useState } from 'react'
import { getAnnonces } from '../api/annonceApi.js'

export function useAnnonces(initialParams = {}) {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [params, setParams] = useState(initialParams)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getAnnonces(params)
      .then(({ data: res }) => {
        if (!active) return
        setData(res.data)
        setMeta(res.meta)
      })
      .catch((err) => {
        if (!active) return
        setError(err.response?.data?.message || 'Impossible de charger les annonces.')
        setData([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload])

  const search = useCallback((newParams = {}) => {
    setParams(newParams)
    setReload((r) => r + 1)
  }, [])

  const setPage = useCallback(
    (page) => {
      setReload((r) => r + 1)
      setParams((prev) => ({ ...prev, page }))
    },
    []
  )

  return { data, meta, loading, error, params, search, setPage }
}
