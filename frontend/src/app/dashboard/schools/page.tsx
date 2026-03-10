'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SCHOOL_TYPES = ['GOVERNMENT', 'CHURCH_AGENCY', 'PRIVATE', 'INTERNATIONAL'];
const SCHOOL_LEVELS = ['PRIMARY', 'SECONDARY', 'TECHNICAL', 'VOCATIONAL'];

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ type: '', province: '', search: '' });

  const fetchSchools = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filters.type) params.set('type', filters.type);
    if (filters.province) params.set('province', filters.province);
    if (filters.search) params.set('search', filters.search);
    api.get(`/schools?${params}`)
      .then((res: any) => { setSchools(res.schools || res); setTotal(res.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, [page, filters]);

  const typeColors: Record<string, string> = {
    GOVERNMENT: 'bg-blue-100 text-blue-700',
    CHURCH_AGENCY: 'bg-purple-100 text-purple-700',
    PRIVATE: 'bg-green-100 text-green-700',
    INTERNATIONAL: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-sm text-gray-500">Manage registered schools across PNG</p>
        </div>
        <button className="btn-primary">+ Register School</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Search by name or code..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="input-field" />
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="input-field">
            <option value="">All Types</option>
            {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <select value={filters.province} onChange={e => setFilters({ ...filters, province: e.target.value })} className="input-field">
            <option value="">All Provinces</option>
            {['Central', 'Chimbu', 'Eastern Highlands', 'East New Britain', 'East Sepik', 'Enga', 'Gulf', 'Hela', 'Jiwaka', 'Madang', 'Manus', 'Milne Bay', 'Morobe', 'NCD', 'New Ireland', 'Oro', 'Bougainville', 'Southern Highlands', 'Western', 'Western Highlands', 'West New Britain', 'West Sepik'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">School</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Level</th>
              <th className="px-6 py-3">Province</th>
              <th className="px-6 py-3">Students</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : schools.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No schools found</td></tr>
            ) : (
              schools.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{s.code}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[s.type] || 'bg-gray-100 text-gray-600'}`}>{s.type?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{s.level}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{s.province?.name || s.province}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{s._count?.students ?? '-'}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="btn-outline text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
