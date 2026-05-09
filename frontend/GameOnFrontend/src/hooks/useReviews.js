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

const REACTION_QUERY_KEYS = [
  ['popularReviews'],
  ['friendReviews'],
  ['reviews'],
  ['allReviews'],
]

const applyReactionToReview = (review, nextReaction) => {
  if (!review) return review

  const currentReaction = review.current_user_reaction ?? null
  if (currentReaction === nextReaction) return review

  let likeCount = review.like_count ?? 0
  let dislikeCount = review.dislike_count ?? 0

  if (currentReaction === 'like') likeCount = Math.max(0, likeCount - 1)
  if (currentReaction === 'dislike') dislikeCount = Math.max(0, dislikeCount - 1)

  if (nextReaction === 'like') likeCount += 1
  if (nextReaction === 'dislike') dislikeCount += 1

  return {
    ...review,
    like_count: likeCount,
    dislike_count: dislikeCount,
    current_user_reaction: nextReaction,
  }
}

const updateReviewInCache = (cachedData, reviewId, nextReaction) => {
  if (!cachedData) return cachedData

  if (Array.isArray(cachedData)) {
    return cachedData.map((review) => (
      review?.id === reviewId ? applyReactionToReview(review, nextReaction) : review
    ))
  }

  if (Array.isArray(cachedData.results)) {
    return {
      ...cachedData,
      results: cachedData.results.map((review) => (
        review?.id === reviewId ? applyReactionToReview(review, nextReaction) : review
      )),
    }
  }

  return cachedData
}

const optimisticReactToReview = async (queryClient, reviewId, nextReaction) => {
  await Promise.all(
    REACTION_QUERY_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey }))
  )

  const snapshots = REACTION_QUERY_KEYS.map((queryKey) => [
    queryKey,
    queryClient.getQueriesData({ queryKey }),
  ])

  REACTION_QUERY_KEYS.forEach((queryKey) => {
    queryClient.setQueriesData({ queryKey }, (cachedData) => (
      updateReviewInCache(cachedData, reviewId, nextReaction)
    ))
  })

  return { snapshots }
}

const restoreReactionSnapshots = (queryClient, context) => {
  context?.snapshots?.forEach(([, entries]) => {
    entries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data)
    })
  })
}

const invalidateReactionQueries = (queryClient) => {
  REACTION_QUERY_KEYS.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey })
  })
}

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
    onMutate: async ({ reviewId, reaction }) => optimisticReactToReview(queryClient, reviewId, reaction),
    onError: (_error, _variables, context) => {
      restoreReactionSnapshots(queryClient, context)
    },
    onSettled: () => {
      invalidateReactionQueries(queryClient)
    },
  })
}

export const useClearReviewReaction = (session) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId }) => clearReviewReaction(reviewId, session),
    onMutate: async ({ reviewId }) => optimisticReactToReview(queryClient, reviewId, null),
    onError: (_error, _variables, context) => {
      restoreReactionSnapshots(queryClient, context)
    },
    onSettled: () => {
      invalidateReactionQueries(queryClient)
    },
  })
}
