import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserProfile, fetchUserReviews, updateMyProfile } from '../api/users'

export const useUserProfile = (userId) =>
  useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  })

export const useUserReviews = (userId) =>
  useQuery({
    queryKey: ['userReviews', userId],
    queryFn: () => fetchUserReviews(userId),
    enabled: !!userId,
  })

export const useUpdateProfile = (userId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, session }) => updateMyProfile(data, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}