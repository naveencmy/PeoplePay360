import { useStore } from 'zustand';
// Assuming useAuthStore is exported from a store
// import { useAuthStore } from '@/store/authStore';

// Mocking useAuthStore for demonstration if not created yet
// If you have a real authStore, replace this mock with the real one
const mockAuthStore = (selector) => {
  const state = {
    user: {
      roles: ['admin'], // Modify this to test different roles
    },
  };
  return selector(state);
};

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
  hr: {
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
    employees: ['read'], // Can only read own profile ideally, handled via API filters
    contracts: ['read'],
    attendance: ['read', 'create'], // Check-in/out
    timeoff: ['read', 'create'], // Request time off
    salary: [],
    payruns: [],
    payslips: ['read'],
    users: [],
  }
};

export const usePermission = (action, resource) => {
  // Use real authStore here in practice
  // const user = useAuthStore(state => state.user);
  const user = mockAuthStore(state => state.user);

  if (!user || !user.roles) return false;

  return user.roles.some((role) => {
    const rolePermissions = PERMISSIONS[role.toLowerCase()];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource.toLowerCase()];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action.toLowerCase());
  });
};
