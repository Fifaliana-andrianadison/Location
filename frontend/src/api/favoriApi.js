import client from './axiosClient.js'

export const getFavoris = (params = {}) => client.get('/favoris', { params })
export const addFavori = (annonceId) => client.post('/favoris', { annonce_id: annonceId })
export const checkFavori = (annonceId) => client.get(`/favoris/${annonceId}/check`)
export const removeFavori = (annonceId) => client.delete(`/favoris/${annonceId}`)
