import client from './axiosClient.js'

export const getNotifications = (params = {}) => client.get('/notifications', { params })
export const getNonLus = () => client.get('/notifications/non-lus')
export const marquerToutesLues = () => client.patch('/notifications/lues')
export const marquerLue = (id) => client.patch(`/notifications/${id}/lue`)
