import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/mockApi';

export const useEmployees = (filters = {}) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => api.getEmployees(filters),
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteEmployee,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
};

export const useEmployeeSmartCounts = (id) => {
  return useQuery({
    queryKey: ['employeeSmartCounts', id],
    queryFn: () => api.getEmployeeSmartCounts(id),
    enabled: !!id,
  });
};
