const API_BASE = '/api';

function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('token') === 'demo-token';
}

// Demo data for preview mode
const DEMO_DATA: Record<string, any> = {
  '/dashboard': {
    stats: {
      totalStudents: 1247,
      totalTeachers: 68,
      totalSchools: 3,
      feesCollected: 485600,
      outstandingFees: 124300,
      currency: 'PGK',
    },
    recentPayments: [
      { id: 1, student: { firstName: 'Peter', lastName: 'Kumul' }, amount: 350, paymentMethod: 'CASH', paymentDate: '2025-02-05T00:00:00Z', receiptNumber: 'RCP-2025-00001' },
      { id: 2, student: { firstName: 'Janet', lastName: 'Waigani' }, amount: 200, paymentMethod: 'MOBILE_MONEY', paymentDate: '2025-02-10T00:00:00Z', receiptNumber: 'RCP-2025-00002' },
      { id: 3, student: { firstName: 'Martha', lastName: 'Lae' }, amount: 500, paymentMethod: 'BANK_TRANSFER', paymentDate: '2025-01-30T00:00:00Z', receiptNumber: 'RCP-2025-00003' },
      { id: 4, student: { firstName: 'David', lastName: 'Wewak' }, amount: 350, paymentMethod: 'CASH', paymentDate: '2025-02-12T00:00:00Z', receiptNumber: 'RCP-2025-00004' },
    ],
    recentAnnouncements: [
      { id: 1, title: 'Welcome to 2025 Academic Year', content: 'Classes begin on Monday, 27th January. All students must be in full uniform.', type: 'ANNOUNCEMENT', createdAt: '2025-01-20T00:00:00Z' },
      { id: 2, title: 'Fee Payment Deadline - Term 1', content: 'All outstanding fees must be paid by 28th February 2025.', type: 'FEE_REMINDER', createdAt: '2025-01-25T00:00:00Z' },
      { id: 3, title: 'Inter-School Sports Day', content: 'The annual NCD Inter-School Sports Day will be held on March 15th.', type: 'GENERAL', createdAt: '2025-02-01T00:00:00Z' },
    ],
  },
  '/students': {
    data: [
      { id: 1, studentNumber: 'NSMS-2025-00001', firstName: 'Peter', lastName: 'Kumul', gender: 'MALE', status: 'ENROLLED', province: 'NCD', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'A' } }] },
      { id: 2, studentNumber: 'NSMS-2025-00002', firstName: 'Janet', lastName: 'Waigani', gender: 'FEMALE', status: 'ENROLLED', province: 'Central', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'A' } }] },
      { id: 3, studentNumber: 'NSMS-2025-00003', firstName: 'James', lastName: 'Tari', gender: 'MALE', status: 'ENROLLED', province: 'Hela', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'A' } }] },
      { id: 4, studentNumber: 'NSMS-2025-00004', firstName: 'Rose', lastName: 'Manus', gender: 'FEMALE', status: 'ENROLLED', province: 'Manus', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'A' } }] },
      { id: 5, studentNumber: 'NSMS-2025-00005', firstName: 'David', lastName: 'Wewak', gender: 'MALE', status: 'ENROLLED', province: 'East Sepik', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'A' } }] },
      { id: 6, studentNumber: 'NSMS-2025-00006', firstName: 'Grace', lastName: 'Kieta', gender: 'FEMALE', status: 'ENROLLED', province: 'Bougainville', classEnrollments: [{ class: { gradeLevel: 'Grade 6', section: 'B' } }] },
      { id: 7, studentNumber: 'NSMS-2025-00007', firstName: 'Paul', lastName: 'Goroka', gender: 'MALE', status: 'ENROLLED', province: 'Eastern Highlands', classEnrollments: [{ class: { gradeLevel: 'Grade 7', section: 'A' } }] },
      { id: 8, studentNumber: 'NSMS-2025-00008', firstName: 'Martha', lastName: 'Lae', gender: 'FEMALE', status: 'ENROLLED', province: 'Morobe', classEnrollments: [{ class: { gradeLevel: 'Grade 7', section: 'A' } }] },
      { id: 9, studentNumber: 'NSMS-2025-00009', firstName: 'John', lastName: 'Kimbe', gender: 'MALE', status: 'ENROLLED', province: 'West New Britain', classEnrollments: [{ class: { gradeLevel: 'Grade 7', section: 'A' } }] },
      { id: 10, studentNumber: 'NSMS-2025-00010', firstName: 'Elizabeth', lastName: 'Rabaul', gender: 'FEMALE', status: 'ENROLLED', province: 'East New Britain', classEnrollments: [{ class: { gradeLevel: 'Grade 8', section: 'A' } }] },
    ],
    total: 10,
  },
  '/teachers': [
    { id: 1, firstName: 'Mary', lastName: 'Kila', email: 'teacher.kila@borokoprimary.edu.pg', role: 'TEACHER', teacherProfile: { qualification: 'Bachelor of Education', specialization: 'Mathematics & Science', yearsExperience: 8 } },
    { id: 2, firstName: 'Joseph', lastName: 'Wari', email: 'teacher.wari@borokoprimary.edu.pg', role: 'TEACHER', teacherProfile: { qualification: 'Diploma in Teaching (Primary)', specialization: 'English & Social Science', yearsExperience: 5 } },
    { id: 3, firstName: 'Anna', lastName: 'Sepik', email: 'anna.sepik@borokoprimary.edu.pg', role: 'TEACHER', teacherProfile: { qualification: 'Bachelor of Science Education', specialization: 'Science & Agriculture', yearsExperience: 12 } },
    { id: 4, firstName: 'Thomas', lastName: 'Buka', email: 'thomas.buka@borokoprimary.edu.pg', role: 'TEACHER', teacherProfile: { qualification: 'Diploma in Education', specialization: 'Health & Physical Education', yearsExperience: 3 } },
  ],
  '/classes': [
    { id: 1, gradeLevel: 'Grade 6', section: 'A', capacity: 40, _count: { enrollments: 5 }, teachers: [{ teacher: { user: { firstName: 'Mary', lastName: 'Kila' } }, isClassTeacher: true }] },
    { id: 2, gradeLevel: 'Grade 6', section: 'B', capacity: 40, _count: { enrollments: 3 }, teachers: [{ teacher: { user: { firstName: 'Joseph', lastName: 'Wari' } }, isClassTeacher: true }] },
    { id: 3, gradeLevel: 'Grade 7', section: 'A', capacity: 40, _count: { enrollments: 4 }, teachers: [{ teacher: { user: { firstName: 'Anna', lastName: 'Sepik' } }, isClassTeacher: true }] },
    { id: 4, gradeLevel: 'Grade 8', section: 'A', capacity: 35, _count: { enrollments: 3 }, teachers: [{ teacher: { user: { firstName: 'Thomas', lastName: 'Buka' } }, isClassTeacher: true }] },
  ],
  '/subjects': [
    { id: 1, subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 6', isCompulsory: true, _count: { teachers: 1, exams: 2 } },
    { id: 2, subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 6', isCompulsory: true, _count: { teachers: 1, exams: 2 } },
    { id: 3, subjectName: 'Science', subjectCode: 'SCI', gradeLevel: 'Grade 6', isCompulsory: true, _count: { teachers: 1, exams: 1 } },
    { id: 4, subjectName: 'Social Science', subjectCode: 'SS', gradeLevel: 'Grade 6', isCompulsory: true, _count: { teachers: 1, exams: 1 } },
    { id: 5, subjectName: 'Health & Physical Education', subjectCode: 'HPE', gradeLevel: 'Grade 6', isCompulsory: true, _count: { teachers: 1, exams: 0 } },
    { id: 6, subjectName: 'Tok Pisin', subjectCode: 'TP', gradeLevel: 'Grade 6', isCompulsory: false, _count: { teachers: 1, exams: 0 } },
    { id: 7, subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 7', isCompulsory: true, _count: { teachers: 1, exams: 1 } },
    { id: 8, subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 7', isCompulsory: true, _count: { teachers: 1, exams: 1 } },
  ],
  '/exams': [
    { id: 1, examName: 'Term 1 Mid-Year Exam', subject: { subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 6' }, term: { termName: 'TERM_1' }, maxMarks: 100, _count: { results: 8 } },
    { id: 2, examName: 'Term 1 Mid-Year Exam', subject: { subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 6' }, term: { termName: 'TERM_1' }, maxMarks: 100, _count: { results: 8 } },
    { id: 3, examName: 'Term 1 Final Exam', subject: { subjectName: 'Science', subjectCode: 'SCI', gradeLevel: 'Grade 7' }, term: { termName: 'TERM_1' }, maxMarks: 100, _count: { results: 5 } },
  ],
  '/fees': [
    { id: 1, feeType: 'TUITION', amount: 350, gradeLevel: 'Grade 6', description: 'Term 1 Tuition Fee', term: { termName: 'TERM_1' } },
    { id: 2, feeType: 'BOOK_FEE', amount: 85, gradeLevel: 'Grade 6', description: 'Term 1 Book & Stationery Fee', term: { termName: 'TERM_1' } },
    { id: 3, feeType: 'SPORT_FEE', amount: 50, gradeLevel: 'Grade 6', description: 'Term 1 Sports Fee', term: { termName: 'TERM_1' } },
    { id: 4, feeType: 'TUITION', amount: 500, gradeLevel: 'Grade 7', description: 'Term 1 Tuition Fee', term: { termName: 'TERM_1' } },
    { id: 5, feeType: 'TUITION', amount: 650, gradeLevel: 'Grade 8', description: 'Term 1 Tuition Fee', term: { termName: 'TERM_1' } },
  ],
  '/fees/outstanding': [
    { id: 1, student: { firstName: 'James', lastName: 'Tari', studentNumber: 'NSMS-2025-00003' }, feeStructure: { feeType: 'TUITION', description: 'Term 1 Tuition' }, amount: 350, paid: 0, balance: 350 },
    { id: 2, student: { firstName: 'Rose', lastName: 'Manus', studentNumber: 'NSMS-2025-00004' }, feeStructure: { feeType: 'TUITION', description: 'Term 1 Tuition' }, amount: 350, paid: 150, balance: 200 },
    { id: 3, student: { firstName: 'David', lastName: 'Wewak', studentNumber: 'NSMS-2025-00005' }, feeStructure: { feeType: 'BOOK_FEE', description: 'Book Fee' }, amount: 85, paid: 0, balance: 85 },
  ],
  '/payments': {
    data: [
      { id: 1, student: { firstName: 'Peter', lastName: 'Kumul', studentNumber: 'NSMS-2025-00001' }, amount: 350, paymentMethod: 'CASH', paymentStatus: 'COMPLETED', receiptNumber: 'RCP-2025-00001', paymentDate: '2025-02-05T00:00:00Z' },
      { id: 2, student: { firstName: 'Janet', lastName: 'Waigani', studentNumber: 'NSMS-2025-00002' }, amount: 200, paymentMethod: 'MOBILE_MONEY', paymentStatus: 'COMPLETED', receiptNumber: 'RCP-2025-00002', paymentDate: '2025-02-10T00:00:00Z' },
      { id: 3, student: { firstName: 'Martha', lastName: 'Lae', studentNumber: 'NSMS-2025-00008' }, amount: 500, paymentMethod: 'BANK_TRANSFER', paymentStatus: 'COMPLETED', receiptNumber: 'RCP-2025-00003', paymentDate: '2025-01-30T00:00:00Z' },
      { id: 4, student: { firstName: 'David', lastName: 'Wewak', studentNumber: 'NSMS-2025-00005' }, amount: 350, paymentMethod: 'CASH', paymentStatus: 'COMPLETED', receiptNumber: 'RCP-2025-00004', paymentDate: '2025-02-12T00:00:00Z' },
      { id: 5, student: { firstName: 'Grace', lastName: 'Kieta', studentNumber: 'NSMS-2025-00006' }, amount: 485, paymentMethod: 'MOBILE_MONEY', paymentStatus: 'COMPLETED', receiptNumber: 'RCP-2025-00005', paymentDate: '2025-02-15T00:00:00Z' },
    ],
    total: 5,
  },
  '/announcements': [
    { id: 1, title: 'Welcome to 2025 Academic Year', content: 'Welcome back to Boroko Primary School for the 2025 academic year. Classes begin on Monday, 27th January. All students must be in full uniform.', priority: 'HIGH', createdAt: '2025-01-20T00:00:00Z', createdBy: { firstName: 'Michael' } },
    { id: 2, title: 'Fee Payment Deadline', content: 'All outstanding fees for Term 1 must be paid by 28th February 2025. Payments can be made via cash, bank transfer, or mobile money (MoniPlus/CellMoni).', priority: 'URGENT', createdAt: '2025-01-25T00:00:00Z', createdBy: { firstName: 'Michael' } },
    { id: 3, title: 'Inter-School Sports Day', content: 'The annual NCD Inter-School Sports Day will be held on March 15th at Sir John Guise Stadium.', priority: 'NORMAL', createdAt: '2025-02-01T00:00:00Z', createdBy: { firstName: 'Michael' } },
  ],
  '/library/books': [
    { id: 1, title: 'Mathematics for PNG Grade 6', author: 'NDOE PNG', isbn: '978-9980-001-01', category: 'Mathematics', totalCopies: 30, availableCopies: 28 },
    { id: 2, title: 'English Language Arts Grade 6', author: 'NDOE PNG', isbn: '978-9980-001-02', category: 'English', totalCopies: 30, availableCopies: 27 },
    { id: 3, title: 'Science for PNG Primary', author: 'NDOE PNG', isbn: '978-9980-001-03', category: 'Science', totalCopies: 25, availableCopies: 24 },
    { id: 4, title: 'Tales from PNG Villages', author: 'Sir Paulias Matane', isbn: '978-9980-002-01', category: 'Literature', totalCopies: 15, availableCopies: 12 },
    { id: 5, title: 'PNG History & Culture', author: 'Institute of PNG Studies', isbn: '978-9980-002-02', category: 'History', totalCopies: 10, availableCopies: 10 },
  ],
  '/library/loans/overdue': [
    { id: 1, book: { title: 'Tales from PNG Villages' }, student: { firstName: 'James', lastName: 'Tari' }, dueDate: '2025-02-20T00:00:00Z' },
    { id: 2, book: { title: 'English Language Arts Grade 6' }, student: { firstName: 'Rose', lastName: 'Manus' }, dueDate: '2025-02-25T00:00:00Z' },
  ],
  '/reports/enrollment': { total: 1247, byGrade: { 'Grade 6': 310, 'Grade 7': 295, 'Grade 8': 280, 'Grade 9': 210, 'Grade 10': 152 }, byGender: [{ gender: 'MALE', _count: 648 }, { gender: 'FEMALE', _count: 599 }], byStatus: [{ status: 'ENROLLED', _count: 1180 }, { status: 'GRADUATED', _count: 52 }, { status: 'TRANSFERRED', _count: 15 }] },
  '/reports/fee-collection': { totalCollected: 485600, totalOutstanding: 124300, collectionRate: 79.6, transactionCount: 892, byMethod: { CASH: 245300, MOBILE_MONEY: 128700, BANK_TRANSFER: 111600 } },
  '/reports/attendance-summary': { total: 18750, present: 16312, absent: 1500, late: 938, attendanceRate: 87.3 },
  '/schools': {
    schools: [
      { id: 1, name: 'Boroko Primary School', code: 'GOV-NCD-001', type: 'GOVERNMENT', level: 'PRIMARY', province: { name: 'NCD' }, isActive: true, _count: { students: 485 } },
      { id: 2, name: 'Sacred Heart Secondary School', code: 'CHR-EHP-001', type: 'CHURCH_AGENCY', level: 'SECONDARY', province: { name: 'Eastern Highlands' }, isActive: true, _count: { students: 620 } },
      { id: 3, name: 'Port Moresby International School', code: 'PVT-NCD-001', type: 'INTERNATIONAL', level: 'COMBINED', province: { name: 'NCD' }, isActive: true, _count: { students: 142 } },
    ],
    total: 3,
  },
  '/users': {
    users: [
      { id: 1, firstName: 'System', lastName: 'Administrator', email: 'admin@nsms.edu.pg', role: 'SUPER_ADMIN', status: 'ACTIVE', school: null, lastLoginAt: '2025-03-10T00:00:00Z' },
      { id: 2, firstName: 'Michael', lastName: 'Somare', email: 'principal@borokoprimary.edu.pg', role: 'SCHOOL_ADMIN', status: 'ACTIVE', school: { name: 'Boroko Primary School' }, lastLoginAt: '2025-03-09T00:00:00Z' },
      { id: 3, firstName: 'Mary', lastName: 'Kila', email: 'teacher.kila@borokoprimary.edu.pg', role: 'TEACHER', status: 'ACTIVE', school: { name: 'Boroko Primary School' }, lastLoginAt: '2025-03-08T00:00:00Z' },
      { id: 4, firstName: 'Ruth', lastName: 'Tau', email: 'finance@borokoprimary.edu.pg', role: 'ACCOUNTANT', status: 'ACTIVE', school: { name: 'Boroko Primary School' }, lastLoginAt: '2025-03-07T00:00:00Z' },
      { id: 5, firstName: 'Sarah', lastName: 'Mond', email: 'library@borokoprimary.edu.pg', role: 'LIBRARIAN', status: 'ACTIVE', school: { name: 'Boroko Primary School' }, lastLoginAt: '2025-03-05T00:00:00Z' },
    ],
  },
  '/users/audit-logs': {
    logs: [
      { id: 1, action: 'LOGIN', resource: 'Auth', details: 'Super Admin login', ipAddress: '203.0.113.1', createdAt: '2025-03-10T08:30:00Z', user: { firstName: 'System', lastName: 'Administrator' } },
      { id: 2, action: 'CREATE', resource: 'Student', details: 'Enrolled Peter Kumul (NSMS-2025-00001)', ipAddress: '203.0.113.2', createdAt: '2025-03-09T10:15:00Z', user: { firstName: 'Michael', lastName: 'Somare' } },
      { id: 3, action: 'CREATE', resource: 'Payment', details: 'Payment RCP-2025-00001 - K350.00', ipAddress: '203.0.113.2', createdAt: '2025-03-08T14:20:00Z', user: { firstName: 'Ruth', lastName: 'Tau' } },
      { id: 4, action: 'UPDATE', resource: 'Attendance', details: 'Recorded Grade 6A attendance', ipAddress: '203.0.113.3', createdAt: '2025-03-07T09:00:00Z', user: { firstName: 'Mary', lastName: 'Kila' } },
    ],
    total: 4,
  },
};

function getDemoData(path: string): any {
  // Strip query params for matching
  const cleanPath = path.split('?')[0];
  if (DEMO_DATA[cleanPath]) return DEMO_DATA[cleanPath];
  // Partial match for nested paths
  for (const key of Object.keys(DEMO_DATA)) {
    if (cleanPath.startsWith(key)) return DEMO_DATA[key];
  }
  return [];
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('token', data.token);
        return null; // Caller should retry
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  async get(path: string) {
    if (isDemoMode()) return getDemoData(path);
    const res = await fetch(`${API_BASE}${path}`, { headers: await getAuthHeaders() });
    return handleResponse(res);
  },

  async post(path: string, body: unknown) {
    if (isDemoMode()) return { success: true };
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(path: string, body: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async patch(path: string, body: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  api.post('/auth/logout', {}).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/';
}
