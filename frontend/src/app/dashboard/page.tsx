'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSchools: number;
    feesCollected: number;
    outstandingFees: number;
    currency: string;
  };
  recentPayments: Array<{
    id: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    student: { firstName: string; lastName: string };
  }>;
  recentAnnouncements: Array<{
    id: number;
    title: string;
    content: string;
    type: string;
    createdAt: string;
  }>;
}

function formatCurrency(amount: number): string {
  return `K${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(setData)
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

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the National School Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents?.toLocaleString() || '0'}
          icon="🎓"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers?.toLocaleString() || '0'}
          icon="👨‍🏫"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Fees Collected"
          value={formatCurrency(stats?.feesCollected || 0)}
          icon="💰"
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="Outstanding Fees"
          value={formatCurrency(stats?.outstandingFees || 0)}
          icon="📋"
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          {data?.recentPayments && data.recentPayments.length > 0 ? (
            <div className="space-y-3">
              {data.recentPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.student.firstName} {payment.student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.paymentMethod} &middot; {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No recent payments</p>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
          {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {data.recentAnnouncements.map(ann => (
                <div key={ann.id} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      ann.type === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                      ann.type === 'FEE_REMINDER' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No announcements</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
