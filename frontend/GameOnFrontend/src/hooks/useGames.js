import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedGames, fetchPopularGames, searchGames, fetchGameDetail, fetchGamePrices, fetchGameScreenshots, fetchGamesByIds } from '../api/games'

export const useFeaturedGames = () =>
  useQuery({
    queryKey: ['featured'],
    queryFn: fetchFeaturedGames,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })

export const usePopularGames = () =>
  useQuery({
    queryKey: ['popular'],
    queryFn: fetchPopularGames,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })

export const useSearchGames = (query) =>
  useQuery({
    queryKey: ['games', query],
    queryFn: () => searchGames(query),
    enabled: query.length >= 2,
    staleTime: 15 * 60 * 1000,
  })

export const useGameDetail = (id) =>
  useQuery({
    queryKey: ['game', String(id)],
    queryFn: () => fetchGameDetail(id),
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

export const useGameScreenshots = (id) =>
  useQuery({
    queryKey: ['screenshots', String(id)],
    queryFn: () => fetchGameScreenshots(id),
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

export const useGamePrices = (id, country = 'US') =>
  useQuery({
    queryKey: ['gamePrices', String(id), country],
    queryFn: () => fetchGamePrices(id, country),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })

export const useGameDetailsBatch = (ids = []) => {
  const normalizedIds = ids.map((id) => (id === null || id === undefined ? null : Number(id)))
  const uniqueIds = [...new Set(normalizedIds.filter(Boolean))]
  const cacheKeyIds = [...uniqueIds].sort((a, b) => a - b)

  const query = useQuery({
    queryKey: ['gamesBatch', cacheKeyIds.join(',')],
    queryFn: () => fetchGamesByIds(cacheKeyIds),
    enabled: cacheKeyIds.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const gameById = (query.data ?? []).reduce((acc, game) => {
    if (game?.id) acc[Number(game.id)] = game
    return acc
  }, {})

  return {
    data: normalizedIds.map((id) => (id ? gameById[id] ?? null : null)),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
