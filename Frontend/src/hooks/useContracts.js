import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/mockApi';

export const useContracts = (filters = {}) => {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => api.getContracts(filters),
  });
};

export const useContract = (id) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => api.getContract(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
    },
  });
};
