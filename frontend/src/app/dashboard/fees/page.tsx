'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function FeesPage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'structures' | 'outstanding'>('structures');

  useEffect(() => {
    Promise.all([
      api.get('/fees/structures'),
      api.get('/fees/outstanding'),
    ])
      .then(([structures, outstandingData]) => {
        setFeeStructures(structures);
        setOutstanding(outstandingData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500">Define and manage school fee structures</p>
        </div>
        <button className="btn-primary">+ Add Fee Structure</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('structures')}
          className={`pb-2 text-sm font-medium border-b-2 ${tab === 'structures' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}
        >
          Fee Structures
        </button>
        <button
          onClick={() => setTab('outstanding')}
          className={`pb-2 text-sm font-medium border-b-2 ${tab === 'outstanding' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}
        >
          Outstanding Balances ({outstanding.length})
        </button>
      </div>

      {tab === 'structures' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Fee Type</th>
                <th className="px-6 py-3">Grade Level</th>
                <th className="px-6 py-3">Amount (PGK)</th>
                <th className="px-6 py-3">Term</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : feeStructures.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No fee structures defined</td></tr>
              ) : (
                feeStructures.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{fee.feeType.replace('_', ' ')}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{fee.gradeLevel}</td>
                    <td className="px-6 py-3 text-sm font-semibold">K{Number(fee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{fee.term?.termName?.replace('_', ' ') || 'All Terms'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${fee.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'outstanding' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Fee Type</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Outstanding (PGK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {outstanding.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No outstanding balances</td></tr>
              ) : (
                outstanding.map((o: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">
                      {o.student.firstName} {o.student.lastName}
                      <br /><span className="text-xs text-gray-400">{o.student.studentNumber}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{o.feeStructure.feeType.replace('_', ' ')}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{o.feeStructure.gradeLevel}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-red-600">K{Number(o.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
