'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Teacher {
  id: number;
  user: { id: number; firstName: string; lastName: string; email: string; phone: string; status: string };
  employeeNumber: string;
  qualification: string;
  specialization: string;
  yearsExperience: number;
  classAssignments: Array<{ class: { gradeLevel: string; section: string } }>;
  subjectTeachers: Array<{ subject: { subjectName: string } }>;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers')
      .then(setTeachers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500">{teachers.length} teachers registered</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Employee #</th>
                <th className="px-6 py-3">Qualification</th>
                <th className="px-6 py-3">Classes</th>
                <th className="px-6 py-3">Subjects</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No teachers found</td></tr>
              ) : (
                teachers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.user.firstName} {t.user.lastName}</p>
                      <p className="text-xs text-gray-400">{t.user.email}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{t.employeeNumber || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{t.qualification || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {t.classAssignments?.map(a => `${a.class.gradeLevel} ${a.class.section}`).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {t.subjectTeachers?.map(s => s.subject.subjectName).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        t.user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.user.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
