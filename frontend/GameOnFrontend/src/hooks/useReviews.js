import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGameReviews,
  fetchMyReviewForGame,
  fetchMyReviewCount,
  fetchMyLikeNotifications,
  createReview,
  updateReview,
  deleteReview,
  fetchAllReviews,
  fetchMyReviews,
  fetchPopularReviews,
  setReviewReaction,
  clearReviewReaction,
} from '../api/reviews'

// --------------------
// QUERIES
// --------------------

export const useMyReviews = (session) =>
  useQuery({
    queryKey: ['myReviews', session?.user?.id],
    queryFn: () => fetchMyReviews(session),
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 min
  })

export const useAllReviews = (page = 1) =>
  useQuery({
    queryKey: ['allReviews', page],
    queryFn: () => fetchAllReviews(page),
    staleTime: 5 * 60 * 1000, // increased from 2 min → 5 min
    keepPreviousData: true, // smooth pagination
  })

export const useGameReviews = (gameId, session) =>
  useQuery({
    queryKey: ['reviews', String(gameId), session?.user?.id ?? 'guest'],
    queryFn: () => fetchGameReviews(gameId, session),
    enabled: !!gameId,
    staleTime: 2 * 60 * 1000, // 2 min
  })

export const usePopularReviews = (page = 1, pageSize = 5, session) =>
  useQuery({
    queryKey: ['popularReviews', page, pageSize, session?.user?.id ?? 'guest'],
    queryFn: () => fetchPopularReviews(page, pageSize, session),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  })

export const useMyReviewForGame = (gameId, session) =>
  useQuery({
    queryKey: ['myReview', String(gameId)],
    queryFn: () => fetchMyReviewForGame(gameId, session),
    enabled: !!gameId && !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 min
  })

export const useMyReviewCount = (session) =>
  useQuery({
    queryKey: ['reviewCount', session?.user?.id],
    queryFn: () => fetchMyReviewCount(session),
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 min
  })

export const useMyLikeNotifications = (session) =>
  useQuery({
    queryKey: ['myLikeNotifications', session?.user?.id],
    queryFn: () => fetchMyLikeNotifications(session),
    enabled: !!session?.access_token,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })

// --------------------
// MUTATIONS
// --------------------

export const useCreateReview = (session) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => createReview(data, session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', String(variables.rawg_game_id)] })
      queryClient.invalidateQueries({ queryKey: ['myReview', String(variables.rawg_game_id)] })
      queryClient.invalidateQueries({ queryKey: ['reviewCount', session?.user?.id] })
      queryClient.invalidateQueries({ queryKey: ['allReviews'] }) // important
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
      queryClient.invalidateQueries({ queryKey: ['allReviews'] })
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
      queryClient.invalidateQueries({ queryKey: ['reviewCount', session?.user?.id] })
      queryClient.invalidateQueries({ queryKey: ['allReviews'] })
    },
  })
}

export const useSetReviewReaction = (session) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, reaction }) => setReviewReaction(reviewId, reaction, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popularReviews'] })
      queryClient.invalidateQueries({ queryKey: ['friendReviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['allReviews'] })
    },
  })
}

export const useClearReviewReaction = (session) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId }) => clearReviewReaction(reviewId, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popularReviews'] })
      queryClient.invalidateQueries({ queryKey: ['friendReviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['allReviews'] })
    },
  })
}
