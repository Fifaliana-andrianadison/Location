import client from './axiosClient.js'

export const demanderIA = (message) =>
  client
    .post('/chatbot', { message })
    .then(({ data }) => data)
    .catch(() => ({ reponse: null }))