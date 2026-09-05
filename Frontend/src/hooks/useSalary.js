import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const useSalaryStructures = () => {
  return useQuery({
    queryKey: ['salaryStructures'],
    queryFn: () => api.getSalaryStructures(),
  });
};

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSalaryStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] });
    },
  });
};

export const useSalaryRules = (structureId) => {
  return useQuery({
    queryKey: ['salaryRules', structureId],
    queryFn: () => api.getSalaryRules(structureId),
    enabled: !!structureId,
  });
};

export const useCreateSalaryRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSalaryRule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaryRules', variables.structure_id] });
    },
  });
};

export const useUpdateSalaryRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateSalaryRule(id, data),
    onSuccess: (_, variables) => {
      // Simplification: Invalidate all rules to ensure UI updates, or track structureId
      queryClient.invalidateQueries({ queryKey: ['salaryRules'] });
    },
  });
};

export const useValidateGraph = (structureId) => {
  return useQuery({
    queryKey: ['validateGraph', structureId],
    queryFn: () => api.validateGraph(structureId),
    enabled: !!structureId,
  });
};
