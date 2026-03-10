'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Students', href: '/dashboard/students', icon: '🎓' },
  { name: 'Teachers', href: '/dashboard/teachers', icon: '👨‍🏫' },
  { name: 'Classes', href: '/dashboard/classes', icon: '🏫' },
  { name: 'Subjects', href: '/dashboard/subjects', icon: '📚' },
  { name: 'Attendance', href: '/dashboard/attendance', icon: '📋' },
  { name: 'Exams & Grades', href: '/dashboard/exams', icon: '📝' },
  { name: 'Fee Management', href: '/dashboard/fees', icon: '💰' },
  { name: 'Payments', href: '/dashboard/payments', icon: '💳' },
  { name: 'Timetable', href: '/dashboard/timetable', icon: '🕐' },
  { name: 'Library', href: '/dashboard/library', icon: '📖' },
  { name: 'Announcements', href: '/dashboard/announcements', icon: '📢' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
];

const adminNavigation = [
  { name: 'Schools', href: '/dashboard/schools', icon: '🏛️' },
  { name: 'Users', href: '/dashboard/users', icon: '👥' },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: '🔒' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/');
        return;
      }
      setUser(currentUser);
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!user) return null;

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'SCHOOL_ADMIN';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">NSMS</h2>
            <p className="text-xs text-gray-500">School Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={pathname === item.href ? 'sidebar-link-active' : 'sidebar-link'}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase">
                  Administration
                </p>
              </div>
              {adminNavigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={pathname === item.href ? 'sidebar-link-active' : 'sidebar-link'}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-500">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-8">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">
                Papua New Guinea - National School Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
