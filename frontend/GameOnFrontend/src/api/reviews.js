import client from './client'

const getAuthHeader = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` }
})

const getOptionalAuthHeader = (session) => (
  session?.access_token
    ? { headers: { Authorization: `Bearer ${session.access_token}` } }
    : {}
)

export const fetchGameReviews = (gameId, session) =>
  client.get(`/reviews/game/${gameId}`, getOptionalAuthHeader(session)).then(res => res.data)

export const fetchMyReviewForGame = (gameId, session) =>
  client.get(`/reviews/game/${gameId}/mine`, getAuthHeader(session)).then(res => res.data)

export const fetchMyReviewCount = (session) =>
  client.get('/reviews/me/count', getAuthHeader(session)).then(res => res.data)

export const fetchMyLikeNotifications = (session) =>
  client.get('/reviews/me/like-notifications', getAuthHeader(session)).then(res => res.data)

export const createReview = (data, session) =>
  client.post('/reviews/', data, getAuthHeader(session)).then(res => res.data)

export const updateReview = (reviewId, data, session) =>
  client.put(`/reviews/${reviewId}`, data, getAuthHeader(session)).then(res => res.data)

export const deleteReview = (reviewId, session) =>
  client.delete(`/reviews/${reviewId}`, getAuthHeader(session)).then(res => res.data)

export const fetchMyReviews = (session) =>
  client.get('/reviews/me', getAuthHeader(session)).then(res => res.data)

export const fetchAllReviews = (page = 1) =>
  client.get('/reviews/', { params: { page, page_size: 20 } }).then(res => res.data)

export const fetchPopularReviews = (page = 1, pageSize = 5, session) =>
  client.get('/reviews/popular', {
    params: { page, page_size: pageSize },
    ...getOptionalAuthHeader(session),
  }).then(res => res.data)

export const setReviewReaction = (reviewId, reaction, session) =>
  client.post(`/reviews/${reviewId}/reaction`, { reaction }, getAuthHeader(session)).then(res => res.data)

export const clearReviewReaction = (reviewId, session) =>
  client.delete(`/reviews/${reviewId}/reaction`, getAuthHeader(session)).then(res => res.data)