import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type Group } from '@/types';
import { groupKeys } from './group-keys';

const getGroups = async (): Promise<Group[]> => {
  return apiClient.get('/groups'); 
};

export const useGetGroups = () => {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: getGroups,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};