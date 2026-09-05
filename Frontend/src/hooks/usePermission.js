import { useAuthStore } from '@/store/authStore';

// Define permission matrix
const PERMISSIONS = {
  admin: {
    employees: ['read', 'create', 'update', 'delete'],
    contracts: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    timeoff: ['read', 'create', 'update', 'delete'],
    salary: ['read', 'create', 'update', 'delete'],
    payruns: ['read', 'create', 'update', 'delete'],
    payslips: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
  },
  hr_manager: {
    employees: ['read', 'create', 'update'],
    contracts: ['read', 'create', 'update'],
    attendance: ['read', 'update'],
    timeoff: ['read', 'update'],
    salary: ['read'],
    payruns: ['read'],
    payslips: ['read'],
    users: [],
  },
  hr_payroll_manager: {
    employees: ['read', 'create', 'update'],
    contracts: ['read', 'create', 'update'],
    attendance: ['read', 'update'],
    timeoff: ['read', 'update'],
    salary: ['read', 'create', 'update'],
    payruns: ['read', 'create', 'update'],
    payslips: ['read', 'create', 'update'],
    users: [],
  },
  hr_payroll_user: {
    employees: ['read', 'create', 'update'],
    contracts: ['read', 'create', 'update'],
    attendance: ['read', 'update'],
    timeoff: ['read', 'update'],
    salary: ['read'],
    payruns: ['read'],
    payslips: ['read'],
    users: [],
  },
  employee: {
    employees: ['read'],
    contracts: ['read'],
    attendance: ['read', 'create'],
    timeoff: ['read', 'create'],
    salary: [],
    payruns: [],
    payslips: ['read'],
    users: [],
  }
};

export const usePermission = (action, resource) => {
  const user = useAuthStore(state => state.user);

  if (!user) return false;
  const role = (user.role || 'employee').toLowerCase();
  const rolePermissions = PERMISSIONS[role] || PERMISSIONS.employee;
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource?.toLowerCase()];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action?.toLowerCase());
};
