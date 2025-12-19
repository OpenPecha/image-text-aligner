import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type GroupRequest, type Group } from '@/types';
import { groupKeys } from './group-keys';

const createGroup = async (data: GroupRequest): Promise<Group> => {
  return apiClient.post('/group', data);
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};