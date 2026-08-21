import client from './axiosClient.js'

export const getAvis = (params = {}) => client.get('/avis', { params })
export const createAvis = (data) => client.post('/avis', data)
