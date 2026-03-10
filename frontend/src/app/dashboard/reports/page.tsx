'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ReportsPage() {
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [feeData, setFeeData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/enrollment'),
      api.get('/reports/fee-collection'),
      api.get('/reports/attendance-summary'),
    ])
      .then(([enrollment, fees, attendance]) => {
        setEnrollmentData(enrollment);
        setFeeData(fees);
        setAttendanceData(attendance);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">School performance and statistics</p>
      </div>

      {/* Enrollment Report */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Enrollment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Students</p>
            <p className="text-3xl font-bold text-blue-900">{enrollmentData?.total || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">By Gender</p>
            {enrollmentData?.byGender?.map((g: any) => (
              <p key={g.gender} className="text-sm font-medium text-green-900">{g.gender}: {g._count}</p>
            ))}
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600">By Status</p>
            {enrollmentData?.byStatus?.map((s: any) => (
              <p key={s.status} className="text-sm font-medium text-yellow-900">{s.status}: {s._count}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Collection Report */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Fee Collection Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Total Collected</p>
            <p className="text-3xl font-bold text-green-900">
              K{(feeData?.totalCollected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">Outstanding</p>
            <p className="text-3xl font-bold text-red-900">
              K{(feeData?.totalOutstanding || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Transactions</p>
            <p className="text-3xl font-bold text-blue-900">{feeData?.transactionCount || 0}</p>
          </div>
        </div>
        {feeData?.byMethod && Object.keys(feeData.byMethod).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Method</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(feeData.byMethod).map(([method, amount]) => (
                <div key={method} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{method.replace('_', ' ')}</p>
                  <p className="text-sm font-semibold">K{(amount as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Report */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold">{attendanceData?.total || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600">Present</p>
            <p className="text-2xl font-bold text-green-900">{attendanceData?.present || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-sm text-red-600">Absent</p>
            <p className="text-2xl font-bold text-red-900">{attendanceData?.absent || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-600">Late</p>
            <p className="text-2xl font-bold text-yellow-900">{attendanceData?.late || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-900">{attendanceData?.attendanceRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
