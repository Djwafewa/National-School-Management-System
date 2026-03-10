import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  schoolType: z.enum(['GOVERNMENT', 'CHURCH_AGENCY', 'PRIVATE', 'INTERNATIONAL']),
  schoolLevel: z.enum(['ELEMENTARY', 'PRIMARY', 'SECONDARY', 'VOCATIONAL', 'TECHNICAL', 'COMBINED']),
  provinceId: z.number().int().positive(),
  districtId: z.number().int().positive().optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  churchAgency: z.string().max(100).optional(),
  motto: z.string().max(300).optional(),
  established: z.number().int().min(1800).max(2100).optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const createStudentSchema = z.object({
  schoolId: z.number().int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  placeOfBirth: z.string().max(200).optional(),
  province: z.string().max(100).optional(),
  village: z.string().max(200).optional(),
  citizenship: z.string().max(50).optional(),
  religion: z.string().max(100).optional(),
  medicalNotes: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const createClassSchema = z.object({
  schoolId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  gradeLevel: z.string().min(1).max(50),
  section: z.string().min(1).max(20),
  capacity: z.number().int().positive().optional(),
});

export const createSubjectSchema = z.object({
  schoolId: z.number().int().positive(),
  subjectName: z.string().min(1).max(100),
  subjectCode: z.string().max(20).optional(),
  gradeLevel: z.string().min(1).max(50),
  description: z.string().optional(),
  isCompulsory: z.boolean().optional(),
});

export const createPaymentSchema = z.object({
  schoolId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'ONLINE']),
  paymentDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  description: z.string().optional(),
});

export const createFeeStructureSchema = z.object({
  schoolId: z.number().int().positive(),
  termId: z.number().int().positive().optional(),
  feeType: z.enum(['TUITION', 'BOARDING', 'BOOK_FEE', 'SPORT_FEE', 'EXAM_FEE', 'PROJECT_FEE', 'UNIFORM', 'TRANSPORT', 'OTHER']),
  gradeLevel: z.string().min(1).max(50),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export const recordAttendanceSchema = z.object({
  classId: z.number().int().positive(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  records: z.array(z.object({
    studentId: z.number().int().positive(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    remarks: z.string().optional(),
  })),
});

export const createExamSchema = z.object({
  termId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  examName: z.string().min(1).max(200),
  maxMarks: z.number().positive().optional(),
  weight: z.number().min(0).max(100).optional(),
  examDate: z.string().optional(),
});

export const recordExamResultsSchema = z.object({
  examId: z.number().int().positive(),
  results: z.array(z.object({
    studentId: z.number().int().positive(),
    marks: z.number().min(0),
  })),
});

export const createAnnouncementSchema = z.object({
  schoolId: z.number().int().positive(),
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  type: z.enum(['ANNOUNCEMENT', 'FEE_REMINDER', 'EXAM_RESULT', 'ATTENDANCE_ALERT', 'GENERAL', 'EMERGENCY']),
  priority: z.number().int().min(0).max(2).optional(),
  expiresAt: z.string().optional(),
});

export const createTimetableSlotSchema = z.object({
  schoolId: z.number().int().positive(),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(1).max(5),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  room: z.string().max(50).optional(),
});
