'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    api.get(`/timetable/class/${selectedClass}`)
      .then(setTimetable)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-sm text-gray-500">View and manage class schedules</p>
        </div>
        <button className="btn-primary">+ Add Slot</button>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="input-field max-w-sm"
        >
          <option value="">Choose a class...</option>
          {classes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.gradeLevel} - {c.section}</option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {loading ? (
            <p className="col-span-5 text-center text-gray-400 py-8">Loading...</p>
          ) : timetable.length === 0 ? (
            <p className="col-span-5 text-center text-gray-400 py-8">No timetable set for this class</p>
          ) : (
            timetable.map((day: any) => (
              <div key={day.day} className="card">
                <h3 className="font-semibold text-gray-900 mb-3">{day.day}</h3>
                <div className="space-y-2">
                  {day.slots.length === 0 ? (
                    <p className="text-xs text-gray-400">No classes</p>
                  ) : (
                    day.slots.map((slot: any) => (
                      <div key={slot.id} className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs font-mono text-gray-500">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-sm font-medium text-gray-900">{slot.subject?.subjectName}</p>
                        {slot.room && <p className="text-xs text-gray-400">Room: {slot.room}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
