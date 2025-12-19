import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type GroupWithUsers } from '@/types';
import { groupKeys } from './group-keys';

const getGroupWithUsers = async (id: string): Promise<GroupWithUsers> => {
  return apiClient.get(`/group/${id}`);
};

export const useGetGroupWithUsers = (id: string, enabled = true) => {
  return useQuery({
    queryKey: groupKeys.withUsers(id),
    queryFn: () => getGroupWithUsers(id),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

