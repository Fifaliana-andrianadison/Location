import client from './axiosClient.js'

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export const getCandidatures = (params = {}) => client.get('/candidatures', { params })
export const getCandidature = (id) => client.get(`/candidatures/${id}`)
export const createCandidature = (formData) => client.post('/candidatures', formData, MULTIPART)
export const updateCandidature = (id, data) => client.put(`/candidatures/${id}`, data)
