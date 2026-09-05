import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const useDashboardKPIs = (period, department) => {
  return useQuery({
    queryKey: ['dashboardKPIs', period, department],
    queryFn: () => api.getDashboardKPIs(period, department),
    refetchInterval: 30000,
  });
};

export const useDashboardCharts = (type, period) => {
  return useQuery({
    queryKey: ['dashboardCharts', type, period],
    queryFn: () => api.getDashboardCharts(type, period),
  });
};
