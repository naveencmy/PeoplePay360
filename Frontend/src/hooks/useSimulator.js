import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const useCreateSimulation = () => {
  return useMutation({
    mutationFn: api.createSimulation,
  });
};

export const useRunSimulation = () => {
  return useMutation({
    mutationFn: (params) => api.runSimulation(params),
  });
};
