import client from './axiosClient.js'

export const getLitiges = (params = {}) => client.get('/litiges', { params })
export const getLitige = (id) => client.get(`/litiges/${id}`)
export const createLitige = (data) => client.post('/litiges', data)
