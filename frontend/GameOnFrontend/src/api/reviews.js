import client from './client'

const getAuthHeader = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` }
})

export const fetchGameReviews = (gameId) =>
  client.get(`/reviews/game/${gameId}`).then(res => res.data)

export const fetchMyReviewForGame = (gameId, session) =>
  client.get(`/reviews/game/${gameId}/mine`, getAuthHeader(session)).then(res => res.data)

export const fetchMyReviewCount = (session) =>
  client.get('/reviews/me/count', getAuthHeader(session)).then(res => res.data)

export const createReview = (data, session) =>
  client.post('/reviews/', data, getAuthHeader(session)).then(res => res.data)

export const updateReview = (reviewId, data, session) =>
  client.put(`/reviews/${reviewId}`, data, getAuthHeader(session)).then(res => res.data)

export const deleteReview = (reviewId, session) =>
  client.delete(`/reviews/${reviewId}`, getAuthHeader(session)).then(res => res.data)

export const fetchMyReviews = (session) =>
  client.get('/reviews/me', getAuthHeader(session)).then(res => res.data)