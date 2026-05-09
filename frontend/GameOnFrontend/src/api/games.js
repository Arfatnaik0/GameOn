import client from './client'

export const fetchFeaturedGames = () =>
  client.get('/games/featured').then(res => res.data)

export const fetchPopularGames = () =>
  client.get('/games/popular').then(res => res.data)

export const searchGames = (query, page = 1) =>
  client.get('/games/search', { params: { q: query, page } }).then(res => res.data)

export const fetchGameDetail = (id) =>
  client.get(`/games/${id}`).then(res => res.data)

export const fetchGamePrices = (id, country = 'US') =>
  client.get(`/games/${id}/prices`, { params: { country } }).then(res => res.data)

export const fetchGameScreenshots = (id) =>
  client.get(`/games/${id}/screenshots`).then(res => res.data)

export const fetchGamesByIds = (ids) =>
  client.post('/games/batch', { ids }).then(res => res.data.results)

export const getGameCoverUrl = (coverUrl) => {
  if (!coverUrl) return null

  const normalizedUrl = String(coverUrl).trim()
  if (normalizedUrl.includes('/games/image-proxy?url=')) {
    return normalizedUrl
  }

  const isRawgImage = /^https?:\/\/[^/]*rawg\.io\//i.test(normalizedUrl)
  if (!isRawgImage) {
    return normalizedUrl
  }

  const apiBase = String(client.defaults.baseURL || '').replace(/\/$/, '')
  if (!apiBase) {
    return normalizedUrl
  }

  return `${apiBase}/games/image-proxy?url=${encodeURIComponent(normalizedUrl)}`
}
