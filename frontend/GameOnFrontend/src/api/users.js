import client from './client'

const getAuthHeader = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` }
})

export const fetchUserProfile = (userId) =>
  client.get(`/users/${userId}`).then(res => res.data)

export const fetchUserReviews = (userId) =>
  client.get(`/users/${userId}/reviews`).then(res => res.data)

export const updateMyProfile = (data, session) =>
  client.put('/users/me', data, getAuthHeader(session)).then(res => res.data)

export const deleteMyAccount = (session) =>
  client.delete('/users/me', getAuthHeader(session)).then(res => res.data)