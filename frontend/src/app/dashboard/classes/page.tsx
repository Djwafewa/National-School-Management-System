'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes')
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500">Manage classes and student enrollment</p>
        </div>
        <button className="btn-primary">+ Create Class</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400 col-span-3 text-center py-8">Loading...</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-8">No classes found. Create your first class.</p>
        ) : (
          classes.map((cls: any) => (
            <div key={cls.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {cls.gradeLevel} - {cls.section}
                </h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full">
                  {cls.academicYear?.year}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Students: <strong>{cls._count?.enrollments || 0}</strong>{cls.capacity ? ` / ${cls.capacity}` : ''}</p>
                <p>Teacher: {
                  cls.teachers?.find((t: any) => t.isClassTeacher)?.teacher?.user
                    ? `${cls.teachers.find((t: any) => t.isClassTeacher).teacher.user.firstName} ${cls.teachers.find((t: any) => t.isClassTeacher).teacher.user.lastName}`
                    : 'Not assigned'
                }</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-outline text-xs flex-1">View Students</button>
                <button className="btn-outline text-xs flex-1">Timetable</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
