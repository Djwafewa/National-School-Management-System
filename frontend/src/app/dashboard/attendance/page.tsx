'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(setClasses).catch(() => {});
  }, []);

  const fetchAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await api.get(`/attendance/class/${selectedClass}?date=${date}`);
      setRecords(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAttendance(); }, [selectedClass, date]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500">Record and view daily attendance</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a class...</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.gradeLevel} - {c.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button onClick={fetchAttendance} className="btn-primary">View Attendance</button>
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Student #</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No attendance records for this date</td></tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{r.student.firstName} {r.student.lastName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{r.student.studentNumber}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        r.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        r.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        r.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{r.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
