import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatusPill from '@/components/ui/StatusPill';
import AvatarBadge from '@/components/ui/AvatarBadge';
import EmptyState from '@/components/ui/EmptyState';
import { CreateEditUserPanel } from '@/components/admin/CreateEditUserPanel';
import { 
  Users, Shield, ShieldCheck, UserCheck, Key, Plus, 
  Search, Lock, Mail, Edit2 
} from 'lucide-react';

import useAuthStore from '@/store/authStore';

export const AdminUsersPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: users = [], isLoading } = useUsers();

  const handleOpenPanel = (user = null) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => {
    const name = (u?.name || '').toLowerCase();
    const email = (u?.email || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();
    const matchesSearch = !query || name.includes(query) || email.includes(query);
    const matchesRole = roleFilter === 'All' || (u?.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => (u.role || '').toLowerCase().includes('admin')).length;
  const hrCount = users.filter(u => (u.role || '').toLowerCase().includes('hr') || (u.role || '').toLowerCase().includes('payroll')).length;
  const staffCount = users.filter(u => (u.role || '').toLowerCase() === 'employee').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative overflow-hidden">
      <PageHeader 
        title="Identity & Access Governance" 
        subtitle="Manage administrative user credentials, RBAC security privileges, and employee profile linkages"
        breadcrumbs={[
          { label: 'Admin', to: '/admin/users' },
          { label: 'Users & Roles' }
        ]}
        actions={
          isAdmin && (
            <Button 
              onClick={() => handleOpenPanel()} 
              variant="primary" 
              size="sm"
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New System User</span>
            </Button>
          )
        }
      />

      {/* RBAC Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Accounts</div>
            <div className="text-xl font-bold font-mono text-text-main">{users.length || 5}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-rose/15 text-accent-rose flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Admins (Root)</div>
            <div className="text-xl font-bold font-mono text-text-main">{adminCount || 1}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">HR & Payroll Staff</div>
            <div className="text-xl font-bold font-mono text-text-main">{hrCount || 3}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Self-Service Users</div>
            <div className="text-xl font-bold font-mono text-text-main">{staffCount || 1}</div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              placeholder="Search user name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
            />
          </div>

          <Select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full sm:w-44 bg-surface-3 border-border-subtle text-xs h-9"
          >
            <option value="All">All Role Tiers</option>
            <option value="Admin">Administrator</option>
            <option value="HR Manager">HR Manager</option>
            <option value="HR Payroll User">HR Payroll User</option>
            <option value="Employee">Employee (Self-Service)</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-2 rounded-2xl border border-border-subtle overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading identity records...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No users match filter"
            description="Try searching with a different keyword or role category."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Work Email</th>
                  <th className="py-3.5 px-4">Linked Employee</th>
                  <th className="py-3.5 px-4">Privilege Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Edit Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleOpenPanel(user)}
                    className="hover:bg-surface-3/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <AvatarBadge name={user?.name || 'User'} size="sm" />
                        <div>
                          <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                            {user?.name || 'User'}
                          </div>
                          <div className="text-[11px] font-mono text-text-muted">UID: {user?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-mono">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {user.linkedEmployee ? (
                        <span className="text-text-main font-medium">{user.linkedEmployee}</span>
                      ) : (
                        <span className="italic text-text-muted">Unlinked (System Only)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-3 border border-border-subtle text-text-main">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={user.status || 'Active'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAdmin ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenPanel(user); }}
                          className="text-xs text-accent-blue font-semibold hover:underline"
                        >
                          Configure
                        </button>
                      ) : (
                        <span className="text-text-muted text-xs">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-text-muted italic">
        * System users are isolated security credentials mapped to employee profiles for self-service actions and fine-grained role permissions.
      </div>

      {/* Drawer Overlay */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity animate-fade-in" 
          onClick={handleClosePanel}
        />
      )}
      
      {/* Slide-out Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-1 border-l border-border-medium shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {isPanelOpen && <CreateEditUserPanel user={selectedUser} onClose={handleClosePanel} />}
      </div>
    </div>
  );
};

export default AdminUsersPage;
