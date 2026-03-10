'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams').then(setExams).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Grades</h1>
          <p className="text-sm text-gray-500">Manage examinations and student results</p>
        </div>
        <button className="btn-primary">+ Create Exam</button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Exam Name</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Grade Level</th>
              <th className="px-6 py-3">Term</th>
              <th className="px-6 py-3">Max Marks</th>
              <th className="px-6 py-3">Results</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : exams.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No exams found</td></tr>
            ) : (
              exams.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{e.examName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{e.subject?.subjectName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{e.subject?.gradeLevel}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{e.term?.termName?.replace('_', ' ')}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{Number(e.maxMarks)}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{e._count?.results || 0} entered</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="text-sm text-primary-500 hover:underline">Enter Marks</button>
                    <button className="text-sm text-blue-500 hover:underline">View Results</button>
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
