import client from './axiosClient.js'

export const getPaiements = (params = {}) => client.get('/paiements', { params })
export const createPaiement = (locationId, data) => client.post(`/locations/${locationId}/paiements`, data)
export const confirmerPaiement = (id) => client.post(`/paiements/${id}/confirmer`)
export const deletePaiement = (id) => client.delete(`/paiements/${id}`)

export const getLocations = (params = {}) => client.get('/locations', { params })
export const getLocation = (id) => client.get(`/locations/${id}`)
export const updateLocation = (id, data) => client.put(`/locations/${id}`, data)
