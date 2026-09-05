import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/mockApi';

export const usePayruns = (filters = {}) => {
  return useQuery({
    queryKey: ['payruns', filters],
    queryFn: () => api.getPayruns(filters),
  });
};

export const usePayrun = (id) => {
  return useQuery({
    queryKey: ['payrun', id],
    queryFn: () => api.getPayrun(id),
    enabled: !!id,
  });
};

export const useCreatePayrun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPayrun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
    },
  });
};

export const useAddEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeIds }) => api.addEmployeesToPayrun(id, employeeIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payrun', variables.id] });
    },
  });
};

export const useComputePayrun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.computePayrun,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });
};

export const useValidatePayrun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.validatePayrun,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markPaid,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });
};

export const useSendPayslips = () => {
  return useMutation({
    mutationFn: api.sendPayslips,
  });
};
