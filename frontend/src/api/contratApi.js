import client from './axiosClient.js'

export const getContrats = (params = {}) => client.get('/contrats', { params })
export const getContrat = (id) => client.get(`/contrats/${id}`)
export const createContrat = (data) => client.post('/contrats', data)
export const signerContrat = (id, signature) => client.post(`/contrats/${id}/signer`, { signature })
export const getContratPdf = (id) => client.get(`/contrats/${id}/pdf`)
