import client from './axiosClient.js'

export const getAlertes = () => client.get('/alertes-recherche')
export const createAlerte = (data) => client.post('/alertes-recherche', data)
export const updateAlerte = (id, data) => client.put(`/alertes-recherche/${id}`, data)
export const deleteAlerte = (id) => client.delete(`/alertes-recherche/${id}`)
