import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PERMISSIONS = {
  employee: {
    employees: 'read_own',
    contracts: 'read_own',
    attendance: 'read_write_own',
    timeoff: 'read_write_own',
    payruns: 'none',
    payslips: 'read_own',
    users: 'none'
  },
  hr_manager: {
    employees: 'crud',
    contracts: 'crud',
    attendance: 'crud',
    timeoff: 'crud',
    payruns: 'none',
    payslips: 'none',
    users: 'none'
  },
  hr_payroll_user: {
    employees: 'crud',
    contracts: 'crud',
    attendance: 'crud',
    timeoff: 'crud',
    payruns: 'read',
    payslips: 'read',
    users: 'none'
  },
  hr_payroll_manager: {
    employees: 'crud',
    contracts: 'crud',
    attendance: 'crud',
    timeoff: 'crud',
    payruns: 'crud',
    payslips: 'crud',
    users: 'none'
  },
  admin: {
    employees: 'crud',
    contracts: 'crud',
    attendance: 'crud',
    timeoff: 'crud',
    payruns: 'crud',
    payslips: 'crud',
    users: 'crud'
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        if (!credentials) return false;
        
        // If passed structured user object (e.g. from LoginPage)
        if (credentials.role) {
          set({
            user: {
              id: credentials.id || 'USR-001',
              username: credentials.email || credentials.username || 'user',
              name: credentials.name || (credentials.email ? credentials.email.split('@')[0] : 'User'),
              role: credentials.role,
              employeeId: credentials.employeeId || 'EMP-001',
              email: credentials.email || ''
            },
            token: credentials.token || 'mock-jwt-token-123',
            isAuthenticated: true
          });
          return true;
        }

        const username = credentials.username || credentials.email || '';
        let role = 'employee';
        if (username.includes('admin')) role = 'admin';
        else if (username.includes('hrmanager') || username.includes('hr_manager')) role = 'hr_manager';
        else if (username.includes('payrolluser') || username.includes('payroll_user')) role = 'hr_payroll_user';
        else if (username.includes('payroll')) role = 'hr_payroll_manager';

        set({
          user: { 
            id: credentials.id || 'USR-001', 
            username, 
            name: username.split('@')[0] || 'User', 
            role, 
            employeeId: 'EMP-001',
            email: username.includes('@') ? username : `${username}@company.com`
          },
          token: 'mock-jwt-token-123',
          isAuthenticated: true
        });
        return true;
      },
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      hasPermission: (action, resource) => {
        const { user } = get();
        if (!user) return false;
        const rolePerms = PERMISSIONS[user.role] || PERMISSIONS['employee'];
        const resourcePerms = rolePerms[resource] || 'none';
        
        if (resourcePerms === 'crud') return true;
        if (resourcePerms === 'none') return false;
        
        if (action === 'read' && (resourcePerms.includes('read'))) return true;
        if (action === 'write' && (resourcePerms.includes('write'))) return true;
        
        return false;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
