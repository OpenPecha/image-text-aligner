import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type User, type UserRole } from '@/types';
import { userKeys } from './user-keys';
import { groupKeys } from '../group/group-keys';

interface UpdateUserRoleParams {
  userId: string;
  role: UserRole;
  groupId?: string;
}

const updateUserRole = async ({ userId, role }: UpdateUserRoleParams): Promise<User> => {
  return apiClient.patch(`/user/${userId}/role`, { role });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Also invalidate group queries to refresh user lists in groups
      if (variables.groupId) {
        queryClient.invalidateQueries({ queryKey: groupKeys.withUsers(variables.groupId) });
      }
    },
  });
};

