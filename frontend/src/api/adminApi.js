import client from './axiosClient.js'

export const getStatistiquesAdmin = () => client.get('/admin/statistiques')
export const getValidations = (params = {}) => client.get('/admin/validations', { params })
export const validerPropriete = (id) => client.post(`/admin/validations/${id}/valider`)
export const rejeterPropriete = (id, motif) => client.post(`/admin/validations/${id}/rejeter`, { motif })
export const verifierProprietaire = (userId, action) => client.post(`/admin/proprietaires/${userId}/verifier`, { action })
export const getProprietaires = (params = {}) => client.get('/admin/proprietaires', { params })
