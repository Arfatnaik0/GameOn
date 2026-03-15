import client from './client'

export const fetchFeaturedGames = () =>
  client.get('/games/featured').then(res => res.data)

export const fetchPopularGames = () =>
  client.get('/games/popular').then(res => res.data)

export const searchGames = (query, page = 1) =>
  client.get('/games/search', { params: { q: query, page } }).then(res => res.data)

export const fetchGameDetail = (id) =>
  client.get(`/games/${id}`).then(res => res.data)

export const fetchGameScreenshots = (id) =>
  client.get(`/games/${id}/screenshots`).then(res => res.data)

export const fetchGamesByIds = (ids) =>
  Promise.all(ids.map(id => client.get(`/games/${id}`).then(res => res.data)))