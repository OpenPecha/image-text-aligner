import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { userKeys } from './user-keys'
import { groupKeys } from '../group/group-keys'

const deleteUser = async (id: string): Promise<void> => {
  return apiClient.delete(`/users/${id}`)
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate all user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      // Also invalidate group queries to refresh user lists in groups
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}

