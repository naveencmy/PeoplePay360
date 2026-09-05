import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { CreateEditUserPanel } from '@/components/admin/CreateEditUserPanel';

export const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: users, isLoading } = useUsers();

  const handleOpenPanel = (user = null) => {
    setSelectedUser(user);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = (users || []).filter(u => {
    const name = (u?.name || '').toLowerCase();
    const email = (u?.email || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();
    const matchesSearch = !query || name.includes(query) || email.includes(query);
    const matchesRole = roleFilter === 'All' || (u?.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 bg-[#0B0D10] text-gray-100 min-h-screen relative overflow-hidden">
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title="User Management" />
        <span className="px-2 py-1 text-xs font-bold bg-red-500/20 text-red-500 rounded-full border border-red-500/30 uppercase tracking-wider mb-4">Admin Only</span>
      </div>

      <div className="flex justify-between items-center mb-6 bg-[#161B22] p-4 rounded-lg border border-white/10">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-[#0B0D10] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#4F7CFF] w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select 
            className="bg-[#0B0D10] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#4F7CFF]"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option>All</option>
            <option>Admin</option>
            <option>HR Manager</option>
            <option>HR Payroll User</option>
            <option>Employee</option>
          </select>
        </div>
        <Button onClick={() => handleOpenPanel()} className="bg-[#4F7CFF] hover:bg-[#3B66E5] text-white px-4 py-2 rounded">
          + New User
        </Button>
      </div>

      <div className="bg-[#161B22] rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0B0D10] text-gray-400 border-b border-white/10 text-sm">
            <tr>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Linked Employee</th>
              <th className="p-4 font-medium">Work Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleOpenPanel(user)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user?.name || 'User'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{user.linkedEmployee || '—'}</td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/5 text-gray-300 rounded-full text-xs border border-white/10">{user.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs border ${user.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-[#4F7CFF] hover:underline text-sm opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500 italic">
        User accounts are separate from Employee records, but should be linked for self-service access.
      </p>

      {/* Drawer Overlay */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={handleClosePanel}></div>
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#161B22] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {isPanelOpen && <CreateEditUserPanel user={selectedUser} onClose={handleClosePanel} />}
      </div>
    </div>
  );
};

export default AdminUsersPage;
