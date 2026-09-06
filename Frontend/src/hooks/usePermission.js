import { useAuthStore } from '@/store/authStore';

// Define permission matrix according to Odoo Hackathon Specification Section 3
const PERMISSIONS = {
  admin: {
    employees: ['read', 'create', 'update', 'delete'],
    contracts: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    timeoff: ['read', 'create', 'update', 'delete'],
    schedules: ['read', 'create', 'update', 'delete'],
    salary: ['read', 'create', 'update', 'delete'],
    payruns: ['read', 'create', 'update', 'delete'],
    payslips: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
  },
  hr_payroll_manager: {
    employees: ['read', 'create', 'update', 'delete'],
    contracts: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    timeoff: ['read', 'create', 'update', 'delete'],
    schedules: ['read', 'create', 'update', 'delete'],
    salary: ['read', 'create', 'update', 'delete'],
    payruns: ['read', 'create', 'update', 'delete'],
    payslips: ['read', 'create', 'update', 'delete'],
    users: [],
  },
  hr_payroll_user: {
    employees: ['read', 'create', 'update', 'delete'],
    contracts: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    timeoff: ['read', 'create', 'update', 'delete'],
    schedules: ['read', 'create', 'update', 'delete'],
    salary: ['read'],
    payruns: ['read', 'create', 'update'],
    payslips: ['read', 'create', 'update'],
    users: [],
  },
  hr_manager: {
    employees: ['read', 'create', 'update', 'delete'],
    contracts: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    timeoff: ['read', 'create', 'update', 'delete'],
    schedules: ['read', 'create', 'update', 'delete'],
    salary: [],
    payruns: [],
    payslips: [],
    users: [],
  },
  manager: {
    employees: ['read'],
    contracts: [],
    attendance: ['read', 'update'],
    timeoff: ['read', 'update'],
    schedules: ['read'],
    salary: [],
    payruns: [],
    payslips: ['read'],
    users: [],
  },
  auditor: {
    employees: ['read'],
    contracts: ['read'],
    attendance: ['read'],
    timeoff: ['read'],
    schedules: ['read'],
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
    schedules: ['read'],
    salary: [],
    payruns: [],
    payslips: ['read'],
    users: [],
  }
};

export const usePermission = (action, resource) => {
  const user = useAuthStore(state => state.user);

  if (!user) return false;
  const rawRole = (user.role || 'employee').toLowerCase();
  
  let canonicalRole = rawRole;
  if (rawRole === 'hr' || rawRole === 'hr_admin') canonicalRole = 'hr_manager';
  if (rawRole === 'payroll' || rawRole === 'payroll_officer' || rawRole === 'payroll_manager') canonicalRole = 'hr_payroll_manager';
  if (rawRole === 'payroll_user') canonicalRole = 'hr_payroll_user';

  const rolePermissions = PERMISSIONS[canonicalRole] || PERMISSIONS.employee;
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource?.toLowerCase()];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action?.toLowerCase());
};
