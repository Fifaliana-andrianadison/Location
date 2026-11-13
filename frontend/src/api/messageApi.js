import client from './axiosClient.js'

export const getConversations = (params = {}) => client.get('/messages/conversations', { params })
export const getMessages = (withUserId, params = {}) =>
  client.get('/messages', { params: { with_user: withUserId, ...params } })
export const sendMessage = (data) => client.post('/messages', data)
export const reactToMessage = (id, emoji) => client.post(`/messages/${id}/react`, { emoji })
