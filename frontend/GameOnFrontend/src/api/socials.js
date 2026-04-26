import client from './client'

const getAuthHeader = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` }
})

export const fetchSocialSummary = (session) =>
  client.get('/socials/summary', getAuthHeader(session)).then(res => res.data)

export const searchProfiles = (query, session) =>
  client.get('/socials/search', {
    ...getAuthHeader(session),
    params: { q: query },
  }).then(res => res.data)

export const sendFriendRequest = (profileId, session) =>
  client.post('/socials/requests', { profile_id: profileId }, getAuthHeader(session)).then(res => res.data)

export const acceptFriendRequest = (requestId, session) =>
  client.post(`/socials/requests/${requestId}/accept`, {}, getAuthHeader(session)).then(res => res.data)

export const deleteFriendRequest = (requestId, session) =>
  client.delete(`/socials/requests/${requestId}`, getAuthHeader(session)).then(res => res.data)

export const removeFriend = (friendId, session) =>
  client.delete(`/socials/friends/${friendId}`, getAuthHeader(session)).then(res => res.data)

export const fetchFriendReviews = (page, pageSize, session) =>
  client.get('/socials/friend-reviews', {
    ...getAuthHeader(session),
    params: { page, page_size: pageSize },
  }).then(res => res.data)
