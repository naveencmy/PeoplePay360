import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => api.getAttendance(filters),
  });
};

export const useTodayAttendance = (employeeId) => {
  return useQuery({
    queryKey: ['attendance-today', employeeId],
    queryFn: () => api.getTodayAttendanceStatus(employeeId),
  });
};

export const useCheckin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.checkin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
  });
};
