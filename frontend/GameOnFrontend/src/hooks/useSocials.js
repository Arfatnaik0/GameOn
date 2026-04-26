import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptFriendRequest,
  deleteFriendRequest,
  fetchFriendReviews,
  fetchSocialSummary,
  removeFriend,
  searchProfiles,
  sendFriendRequest,
} from '../api/socials'

export const useSocialSummary = (session) =>
  useQuery({
    queryKey: ['socialSummary', session?.user?.id],
    queryFn: () => fetchSocialSummary(session),
    enabled: !!session?.access_token,
    staleTime: 30 * 1000,
  })

export const useProfileSearch = (query, session) =>
  useQuery({
    queryKey: ['profileSearch', query, session?.user?.id],
    queryFn: () => searchProfiles(query, session),
    enabled: !!session?.access_token && query.trim().length >= 2,
    staleTime: 20 * 1000,
  })

export const useFriendReviews = (page = 1, pageSize = 8, session) =>
  useQuery({
    queryKey: ['friendReviews', page, pageSize, session?.user?.id],
    queryFn: () => fetchFriendReviews(page, pageSize, session),
    enabled: !!session?.access_token,
    staleTime: 30 * 1000,
    keepPreviousData: true,
  })

const invalidateSocials = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['socialSummary'] })
  queryClient.invalidateQueries({ queryKey: ['friendReviews'] })
  queryClient.invalidateQueries({ queryKey: ['profileSearch'] })
}

export const useSendFriendRequest = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileId) => sendFriendRequest(profileId, session),
    onSuccess: () => invalidateSocials(queryClient),
  })
}

export const useAcceptFriendRequest = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId) => acceptFriendRequest(requestId, session),
    onSuccess: () => invalidateSocials(queryClient),
  })
}

export const useDeleteFriendRequest = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId) => deleteFriendRequest(requestId, session),
    onSuccess: () => invalidateSocials(queryClient),
  })
}

export const useRemoveFriend = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (friendId) => removeFriend(friendId, session),
    onSuccess: () => invalidateSocials(queryClient),
  })
}
