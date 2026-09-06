import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  AUDITOR: 'AUDITOR',
  EMPLOYEE: 'EMPLOYEE',
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        if (!credentials) return false;
        
        let role = (credentials.role || 'EMPLOYEE').toUpperCase();
        if (role === 'SUPER_ADMIN') role = 'ADMIN';
        if (role === 'HR_ADMIN') role = 'HR';
        if (role === 'PAYROLL_OFFICER' || role === 'HR_PAYROLL_MANAGER') role = 'HR_PAYROLL_MANAGER';
        if (role === 'HR_PAYROLL_USER') role = 'HR_PAYROLL_USER';
        if (role === 'HR_MANAGER') role = 'HR_MANAGER';

        if (credentials.token) {
          localStorage.setItem('token', credentials.token);
        }

        const username = credentials.email || credentials.username || '';
        const userObj = {
          id: credentials.id || 'USR-001',
          username,
          name: credentials.name || (username ? username.split('@')[0] : 'User'),
          role,
          employeeId: credentials.employeeId || credentials.employee_id || null,
          email: credentials.email || (username.includes('@') ? username : `${username}@company.com`),
          token: credentials.token,
        };

        set({
          user: userObj,
          token: credentials.token,
          isAuthenticated: true,
        });

        return true;
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      hasRole: (...allowedRoles) => {
        const { user } = get();
        if (!user) return false;
        const currentRole = (user.role || '').toUpperCase();
        if (currentRole === 'ADMIN') return true;

        const effective = [currentRole];
        if (currentRole === 'HR_PAYROLL_MANAGER') {
          effective.push('HR', 'PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'HR_MANAGER', 'PAYROLL');
        } else if (currentRole === 'HR_PAYROLL_USER') {
          effective.push('HR', 'PAYROLL_USER', 'HR_MANAGER', 'PAYROLL');
        } else if (currentRole === 'HR_MANAGER' || currentRole === 'HR') {
          effective.push('HR_MANAGER', 'HR');
        }

        return allowedRoles.some(r => effective.includes(r.toUpperCase()));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
