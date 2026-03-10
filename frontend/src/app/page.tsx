'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const DEMO_CREDENTIALS = {
    email: 'admin@nsms.edu.pg',
    password: 'Admin@2025',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo mode: allow login with demo credentials when no backend is running
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const demoUser = {
        id: 1,
        firstName: 'System',
        lastName: 'Administrator',
        email: DEMO_CREDENTIALS.email,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      };
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('refreshToken', 'demo-refresh');
      localStorage.setItem('user', JSON.stringify(demoUser));
      window.location.href = '/dashboard';
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Invalid credentials. Use demo: admin@nsms.edu.pg / Admin@2025');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NSMS</h1>
            <p className="text-sm text-gray-500 mt-1">
              National School Management System
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Papua New Guinea
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@school.pg"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials</p>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between"><span>Email:</span><span className="font-mono">admin@nsms.edu.pg</span></div>
              <div className="flex justify-between"><span>Password:</span><span className="font-mono">Admin@2025</span></div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} NSMS Papua New Guinea. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
