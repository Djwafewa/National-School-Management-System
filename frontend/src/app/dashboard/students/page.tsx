'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Student {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  status: string;
  dateOfBirth: string;
  school: { name: string; code: string };
  classEnrollments: Array<{ class: { gradeLevel: string; section: string } }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/students?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      setStudents(data.data);
      setTotal(data.total);
    } catch { /* handled by api */ }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">{total} students total</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Student
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search students by name or student number..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field"
        />
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Student #</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No students found</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">{student.studentNumber}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{student.gender}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {student.classEnrollments?.[0]?.class
                        ? `${student.classEnrollments[0].class.gradeLevel} ${student.classEnrollments[0].class.section}`
                        : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.status === 'ENROLLED' ? 'bg-green-100 text-green-700' :
                        student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-700' :
                        student.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/students/${student.id}`} className="text-sm text-primary-500 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="btn-outline text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchStudents(); }}
        />
      )}
    </div>
  );
}

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    province: '',
    village: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/students', { ...form, schoolId: user.schoolId });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add New Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="input-field"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Province</label>
              <input
                type="text"
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className="input-field"
                placeholder="e.g., Eastern Highlands"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input
                type="text"
                value={form.village}
                onChange={e => setForm({ ...form, village: e.target.value })}
                className="input-field"
                placeholder="Home village"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
