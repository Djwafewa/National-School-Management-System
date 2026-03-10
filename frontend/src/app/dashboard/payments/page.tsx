'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/payments?page=${page}&limit=20`);
      setPayments(data.data);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">{total} payment records</p>
        </div>
        <button onClick={() => setShowRecordModal(true)} className="btn-primary">
          + Record Payment
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Receipt #</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Amount (PGK)</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No payments found</td></tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">{p.receiptNumber || '—'}</td>
                    <td className="px-6 py-3 text-sm">
                      {p.student?.firstName} {p.student?.lastName}
                      <br />
                      <span className="text-xs text-gray-400">{p.student?.studentNumber}</span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold">K{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{p.paymentMethod?.replace('_', ' ')}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        p.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        p.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button className="text-sm text-primary-500 hover:underline">Receipt</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRecordModal && (
        <RecordPaymentModal
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => { setShowRecordModal(false); fetchPayments(); }}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/payments', {
        ...form,
        schoolId: user.schoolId,
        studentId: parseInt(form.studentId),
        amount: parseFloat(form.amount),
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="number"
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
              className="input-field"
              placeholder="Enter student ID"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PGK)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                className="input-field"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CHEQUE">Cheque</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={e => setForm({ ...form, paymentDate: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="e.g., Term 1 School Fees"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
