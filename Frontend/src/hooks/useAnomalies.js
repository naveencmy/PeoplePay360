import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/mockApi';

export const useAnomalies = (payrunId) => {
  return useQuery({
    queryKey: ['anomalies', payrunId],
    queryFn: () => api.getAnomalies(payrunId),
    enabled: !!payrunId,
  });
};

export const useComplianceReadiness = (period) => {
  return useQuery({
    queryKey: ['complianceReadiness', period],
    queryFn: () => api.getComplianceReadiness(period),
    enabled: !!period,
  });
};
