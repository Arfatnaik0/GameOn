import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedGames, fetchPopularGames, searchGames, fetchGameDetail, fetchGameScreenshots } from '../api/games'

export const useFeaturedGames = () =>
  useQuery({
    queryKey: ['featured'],
    queryFn: fetchFeaturedGames,
    staleTime: 10 * 60 * 1000,
  })

export const usePopularGames = () =>
  useQuery({
    queryKey: ['popular'],
    queryFn: fetchPopularGames,
    staleTime: 10 * 60 * 1000,
  })

export const useSearchGames = (query) =>
  useQuery({
    queryKey: ['games', query],
    queryFn: () => searchGames(query),
    enabled: query.length >= 2,
  })

export const useGameDetail = (id) =>
  useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGameDetail(id),
    enabled: !!id,
  })

export const useGameScreenshots = (id) =>
  useQuery({
    queryKey: ['screenshots', id],
    queryFn: () => fetchGameScreenshots(id),
    enabled: !!id,
  })