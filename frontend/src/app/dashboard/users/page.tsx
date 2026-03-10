'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const ROLES = ['SUPER_ADMIN', 'PROVINCIAL_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'PARENT'];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);
    api.get(`/users?${params}`)
      .then((res: any) => setUsers(res.users || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, search]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api.patch(`/users/${id}/status`, { status: newStatus });
    fetchUsers();
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    PROVINCIAL_ADMIN: 'bg-purple-100 text-purple-700',
    SCHOOL_ADMIN: 'bg-blue-100 text-blue-700',
    PRINCIPAL: 'bg-indigo-100 text-indigo-700',
    TEACHER: 'bg-green-100 text-green-700',
    ACCOUNTANT: 'bg-yellow-100 text-yellow-700',
    LIBRARIAN: 'bg-teal-100 text-teal-700',
    PARENT: 'bg-gray-100 text-gray-600',
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage system users and roles</p>
        </div>
        <button className="btn-primary">+ Add User</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">School</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Login</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{u.school?.name || '—'}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[u.status] || 'bg-gray-100 text-gray-600'}`}>{u.status}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button onClick={() => toggleStatus(u.id, u.status)} className="text-primary-500 hover:underline text-xs">
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
