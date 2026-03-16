import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGameReviews, fetchMyReviewForGame,
  fetchMyReviewCount, createReview, updateReview, deleteReview
} from '../api/reviews'
import { fetchAllReviews } from '../api/reviews'
import { fetchMyReviews } from '../api/reviews'

export const useMyReviews = (session) =>
  useQuery({
    queryKey: ['myReviews', session?.user?.id],
    queryFn: () => fetchMyReviews(session),
    enabled: !!session?.access_token,
  })

  
export const useAllReviews = (page = 1) =>
  useQuery({
    queryKey: ['allReviews', page],
    queryFn: () => fetchAllReviews(page),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true, // smooth pagination
  })

export const useGameReviews = (gameId) =>
  useQuery({
    queryKey: ['reviews', String(gameId)],
    queryFn: () => fetchGameReviews(gameId),
    enabled: !!gameId,
  })

export const useMyReviewForGame = (gameId, session) =>
  useQuery({
    queryKey: ['myReview', String(gameId)],
    queryFn: () => fetchMyReviewForGame(gameId, session),
    enabled: !!gameId && !!session?.access_token, // ← guard
  })

export const useMyReviewCount = (session) =>
  useQuery({
    queryKey: ['reviewCount', session?.user?.id],
    queryFn: () => fetchMyReviewCount(session),
    enabled: !!session?.access_token, // ← guard
  })

export const useCreateReview = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createReview(data, session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', String(variables.rawg_game_id)] })
      queryClient.invalidateQueries({ queryKey: ['myReview', String(variables.rawg_game_id)] })
      queryClient.invalidateQueries({ queryKey: ['reviewCount'] })
    },
  })
}

export const useUpdateReview = (session, gameId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }) => updateReview(reviewId, data, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', String(gameId)] })
      queryClient.invalidateQueries({ queryKey: ['myReview', String(gameId)] })
    },
  })
}

export const useDeleteReview = (session, gameId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', String(gameId)] })
      queryClient.invalidateQueries({ queryKey: ['myReview', String(gameId)] })
      queryClient.invalidateQueries({ queryKey: ['reviewCount'] })
    },
  })
}