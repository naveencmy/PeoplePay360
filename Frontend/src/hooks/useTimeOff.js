import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const useLeaveRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['leaveRequests', filters],
    queryFn: () => api.getLeaveRequests(filters),
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.rejectLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
};

export const useLeaveAllocations = (filters = {}) => {
  return useQuery({
    queryKey: ['leaveAllocations', filters],
    queryFn: () => api.getLeaveAllocations(filters),
  });
};

export const useTimeOffTypes = () => {
  return useQuery({
    queryKey: ['timeOffTypes'],
    queryFn: () => api.getTimeOffTypes(),
  });
};

export const useCreateTimeOffType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTimeOffType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffTypes'] });
    },
  });
};
