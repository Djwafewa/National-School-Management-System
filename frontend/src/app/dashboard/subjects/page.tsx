'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subjects').then(setSubjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500">Manage curriculum subjects</p>
        </div>
        <button className="btn-primary">+ Add Subject</button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Subject Name</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Grade Level</th>
              <th className="px-6 py-3">Compulsory</th>
              <th className="px-6 py-3">Teachers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No subjects found</td></tr>
            ) : (
              subjects.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.subjectName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{s.subjectCode || '—'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{s.gradeLevel}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${s.isCompulsory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.isCompulsory ? 'Yes' : 'Elective'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {s.teachers?.map((t: any) => `${t.teacher.user.firstName} ${t.teacher.user.lastName}`).join(', ') || '—'}
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
