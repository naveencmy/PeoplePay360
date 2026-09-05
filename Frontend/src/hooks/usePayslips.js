import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export const usePayslips = (filters = {}) => {
  return useQuery({
    queryKey: ['payslips', filters],
    queryFn: () => api.getPayslips(filters),
  });
};

export const usePayslip = (id) => {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: () => api.getPayslip(id),
    enabled: !!id,
  });
};

export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: api.generatePayslipPDF,
  });
};
