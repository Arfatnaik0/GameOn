import client from './client'

const getAuthHeader = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` }
})

export const fetchMyList = (session) =>
  client.get('/lists/me', getAuthHeader(session)).then(res => res.data)

export const fetchGameStatus = (rawgGameId, session) =>
  client.get(`/lists/me/${rawgGameId}`, getAuthHeader(session)).then(res => res.data)

export const addToList = (data, session) =>
  client.post('/lists/', data, getAuthHeader(session)).then(res => res.data)

export const updateListStatus = (rawgGameId, status, session) =>
  client.put(`/lists/${rawgGameId}`, { status }, getAuthHeader(session)).then(res => res.data)

export const removeFromList = (rawgGameId, session) =>
  client.delete(`/lists/${rawgGameId}`, getAuthHeader(session)).then(res => res.data)