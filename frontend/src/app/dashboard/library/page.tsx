'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'books' | 'overdue'>('books');

  useEffect(() => {
    Promise.all([
      api.get(`/library/books?search=${encodeURIComponent(search)}`),
      api.get('/library/loans/overdue'),
    ])
      .then(([b, o]) => { setBooks(b); setOverdue(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-sm text-gray-500">Manage books and loans</p>
        </div>
        <button className="btn-primary">+ Add Book</button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setTab('books')} className={`pb-2 text-sm font-medium border-b-2 ${tab === 'books' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}>Books ({books.length})</button>
        <button onClick={() => setTab('overdue')} className={`pb-2 text-sm font-medium border-b-2 ${tab === 'overdue' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}>
          Overdue ({overdue.length})
        </button>
      </div>

      {tab === 'books' && (
        <>
          <div className="card">
            <input type="text" placeholder="Search books by title, author, or ISBN..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="col-span-3 text-center text-gray-400 py-8">Loading...</p> :
              books.length === 0 ? <p className="col-span-3 text-center text-gray-400 py-8">No books found</p> :
              books.map((b: any) => (
                <div key={b.id} className="card">
                  <h3 className="text-sm font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-xs text-gray-500">{b.author || 'Unknown Author'}</p>
                  {b.isbn && <p className="text-xs text-gray-400 mt-1">ISBN: {b.isbn}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{b.category || 'General'}</span>
                    <span className="text-xs text-gray-500">{b.availableCopies}/{b.totalCopies} available</span>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {tab === 'overdue' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Days Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overdue.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No overdue loans</td></tr>
              ) : (
                overdue.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{l.book.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{l.student.firstName} {l.student.lastName}</td>
                    <td className="px-6 py-3 text-sm text-red-600">{new Date(l.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-red-600">
                      {Math.floor((Date.now() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </td>
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
