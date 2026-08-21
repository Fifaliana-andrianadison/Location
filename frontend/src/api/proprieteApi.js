import client from './axiosClient.js'

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export const getProprietes = (params = {}) => client.get('/proprietes', { params })
export const getPropriete = (id) => client.get(`/proprietes/${id}`)
export const createPropriete = (formData) => client.post('/proprietes', formData, MULTIPART)
export const updatePropriete = (id, formData) => {
  formData.append('_method', 'PUT')
  return client.post(`/proprietes/${id}`, formData, MULTIPART)
}
export const deletePropriete = (id) => client.delete(`/proprietes/${id}`)
export const changerPrix = (id, prix) => client.put(`/proprietes/${id}/prix`, { prix })
export const getStatsProprietaire = () => client.get('/stats/proprietaire')

export const getMaisons = (params = {}) => client.get('/maisons', { params })
export const createMaison = (data) => client.post('/maisons', data)
export const updateMaison = (id, data) => client.put(`/maisons/${id}`, data)
export const deleteMaison = (id) => client.delete(`/maisons/${id}`)

export const getAppartements = (params = {}) => client.get('/appartements', { params })
export const createAppartement = (data) => client.post('/appartements', data)
export const updateAppartement = (id, data) => client.put(`/appartements/${id}`, data)
export const deleteAppartement = (id) => client.delete(`/appartements/${id}`)

export const getTerrains = (params = {}) => client.get('/terrains', { params })
export const createTerrain = (data) => client.post('/terrains', data)
export const updateTerrain = (id, data) => client.put(`/terrains/${id}`, data)
export const deleteTerrain = (id) => client.delete(`/terrains/${id}`)
