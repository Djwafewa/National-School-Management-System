'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (actionFilter) params.set('action', actionFilter);
    api.get(`/users/audit-logs?${params}`)
      .then((res: any) => { setLogs(res.logs || res); setTotal(res.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500">Track all system activity</p>
      </div>

      <div className="card">
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input-field w-48">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Resource</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No audit logs found</td></tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{log.user?.firstName} {log.user?.lastName}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${actionColors[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.resource}</td>
                  <td className="px-6 py-3 text-xs text-gray-500 max-w-xs truncate">{log.details || '—'}</td>
                  <td className="px-6 py-3 text-xs text-gray-400 font-mono">{log.ipAddress || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 30 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 30)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= total} className="btn-outline text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
