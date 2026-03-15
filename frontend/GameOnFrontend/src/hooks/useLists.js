import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMyList, fetchGameStatus, addToList, updateListStatus, removeFromList } from '../api/lists'

export const useMyList = (session) =>
  useQuery({
    queryKey: ['myList', session?.user?.id],
    queryFn: () => fetchMyList(session),
    enabled: !!session?.access_token,
  })

export const useGameListStatus = (rawgGameId, session, enabled = true) =>
  useQuery({
    queryKey: ['listStatus', String(rawgGameId), session?.user?.id],
    queryFn: () => fetchGameStatus(rawgGameId, session),
    enabled: enabled && !!rawgGameId && !!session?.access_token,
  })

export const useAddToList = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => addToList(data, session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myList'] })
      queryClient.invalidateQueries({ queryKey: ['listStatus', String(variables.rawg_game_id)] })
    },
  })
}

export const useUpdateListStatus = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rawgGameId, status }) => updateListStatus(rawgGameId, status, session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myList'] })
      queryClient.invalidateQueries({ queryKey: ['listStatus', String(variables.rawgGameId)] })
    },
  })
}

export const useRemoveFromList = (session) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rawgGameId) => removeFromList(rawgGameId, session),
    onSuccess: (_, rawgGameId) => {
      queryClient.invalidateQueries({ queryKey: ['myList'] })
      queryClient.invalidateQueries({ queryKey: ['listStatus', String(rawgGameId)] })
    },
  })
}