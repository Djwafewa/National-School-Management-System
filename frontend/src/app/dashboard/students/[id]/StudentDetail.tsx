'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function StudentDetail() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'attendance' | 'results' | 'fees'>('info');

  useEffect(() => {
    api.get(`/students/${params.id}`)
      .then(setStudent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center text-gray-400 py-12">Loading...</div>;
  if (!student) return <div className="text-center text-gray-400 py-12">Student not found</div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
            <p className="text-sm text-gray-500 font-mono">{student.studentNumber}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Grade: {student.currentClass?.name || '—'}</span>
              <span>Gender: {student.gender}</span>
              <span>DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</span>
              <span>Province: {student.province || '—'}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {student.status}
          </span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {(['info', 'attendance', 'results', 'fees'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-2 text-sm font-medium capitalize border-b-2 ${tab === t ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex"><dt className="w-32 text-gray-500">First Name</dt><dd className="text-gray-900">{student.firstName}</dd></div>
              <div className="flex"><dt className="w-32 text-gray-500">Last Name</dt><dd className="text-gray-900">{student.lastName}</dd></div>
              <div className="flex"><dt className="w-32 text-gray-500">Gender</dt><dd className="text-gray-900">{student.gender}</dd></div>
              <div className="flex"><dt className="w-32 text-gray-500">Date of Birth</dt><dd className="text-gray-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</dd></div>
              <div className="flex"><dt className="w-32 text-gray-500">Province</dt><dd className="text-gray-900">{student.province || '—'}</dd></div>
              <div className="flex"><dt className="w-32 text-gray-500">District</dt><dd className="text-gray-900">{student.district || '—'}</dd></div>
            </dl>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Guardian Information</h3>
            {student.guardians && student.guardians.length > 0 ? (
              student.guardians.map((g: any) => (
                <dl key={g.id} className="space-y-2 text-sm mb-4">
                  <div className="flex"><dt className="w-32 text-gray-500">Name</dt><dd className="text-gray-900">{g.parent?.firstName} {g.parent?.lastName}</dd></div>
                  <div className="flex"><dt className="w-32 text-gray-500">Relationship</dt><dd className="text-gray-900">{g.relationship}</dd></div>
                  <div className="flex"><dt className="w-32 text-gray-500">Phone</dt><dd className="text-gray-900">{g.parent?.phone || '—'}</dd></div>
                </dl>
              ))
            ) : <p className="text-sm text-gray-400">No guardians recorded</p>}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Attendance Records</h3>
          <p className="text-gray-400 text-sm">Attendance summary will load from the API.</p>
        </div>
      )}

      {tab === 'results' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Exam Results</h3>
          <p className="text-gray-400 text-sm">Academic results will load from the API.</p>
        </div>
      )}

      {tab === 'fees' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Fee Balances</h3>
          <p className="text-gray-400 text-sm">Fee records will load from the API.</p>
        </div>
      )}
    </div>
  );
}
