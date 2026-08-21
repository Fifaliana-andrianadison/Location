import client from './axiosClient.js'

export const getAnnonces = (params = {}) => client.get('/annonces', { params })
export const getAnnonce = (id) => client.get(`/annonces/${id}`)
