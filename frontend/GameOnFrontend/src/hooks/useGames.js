import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedGames, searchGames, fetchGameDetail } from '../api/games'

export const useFeaturedGames = () =>
  useQuery({
    queryKey: ['featured'],
    queryFn: fetchFeaturedGames,
    staleTime: 5 * 60 * 1000, // 5 minutes — this data rarely changes
  })

export const useSearchGames = (query) =>
  useQuery({
    queryKey: ['games', query],
    queryFn: () => searchGames(query),
    enabled: query.length >= 2, // don't fire on empty or single char
  })

export const useGameDetail = (id) =>
  useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGameDetail(id),
    enabled: !!id,
  })