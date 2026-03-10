'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'NORMAL' });

  const fetchAnnouncements = () => {
    setLoading(true);
    api.get('/announcements')
      .then(setAnnouncements)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async () => {
    await api.post('/announcements', form);
    setShowModal(false);
    setForm({ title: '', content: '', priority: 'NORMAL' });
    fetchAnnouncements();
  };

  const priorityColor: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600',
    NORMAL: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-yellow-100 text-yellow-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">School news and notices</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Announcement</button>
      </div>

      {loading ? <p className="text-center text-gray-400 py-12">Loading...</p> :
        announcements.length === 0 ? <p className="text-center text-gray-400 py-12">No announcements</p> :
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[a.priority] || priorityColor.NORMAL}`}>{a.priority}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                  <p className="mt-3 text-xs text-gray-400">Posted by {a.createdBy?.firstName || 'Admin'} on {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">New Announcement</h2>
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
            <textarea placeholder="Content..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field h-32" />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary" disabled={!form.title || !form.content}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
