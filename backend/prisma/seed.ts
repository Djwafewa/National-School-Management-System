import { PrismaClient, SchoolType, SchoolLevel, UserRole, UserStatus, Gender, StudentStatus, TermName, FeeType, PaymentMethod, PaymentStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// PNG Provinces
const PNG_PROVINCES = [
  { name: 'Central', code: 'CPL', region: 'Southern' },
  { name: 'Chimbu (Simbu)', code: 'CPH', region: 'Highlands' },
  { name: 'Eastern Highlands', code: 'EHP', region: 'Highlands' },
  { name: 'East New Britain', code: 'ENB', region: 'Islands' },
  { name: 'East Sepik', code: 'ESP', region: 'Momase' },
  { name: 'Enga', code: 'EPG', region: 'Highlands' },
  { name: 'Gulf', code: 'GPH', region: 'Southern' },
  { name: 'Hela', code: 'HLA', region: 'Highlands' },
  { name: 'Jiwaka', code: 'JWK', region: 'Highlands' },
  { name: 'Madang', code: 'MPL', region: 'Momase' },
  { name: 'Manus', code: 'MRL', region: 'Islands' },
  { name: 'Milne Bay', code: 'MBA', region: 'Southern' },
  { name: 'Morobe', code: 'MPM', region: 'Momase' },
  { name: 'NCD (Port Moresby)', code: 'NCD', region: 'Southern' },
  { name: 'New Ireland', code: 'NIP', region: 'Islands' },
  { name: 'Northern (Oro)', code: 'NPP', region: 'Southern' },
  { name: 'Bougainville (ABG)', code: 'NSA', region: 'Islands' },
  { name: 'Southern Highlands', code: 'SHP', region: 'Highlands' },
  { name: 'Western', code: 'WPD', region: 'Southern' },
  { name: 'Western Highlands', code: 'WHP', region: 'Highlands' },
  { name: 'West New Britain', code: 'WBR', region: 'Islands' },
  { name: 'West Sepik (Sandaun)', code: 'WSP', region: 'Momase' },
];

async function main() {
  console.log('🌱 Seeding NSMS database...\n');

  // 1. Provinces
  console.log('📍 Creating provinces...');
  const provinces = await Promise.all(
    PNG_PROVINCES.map(p =>
      prisma.province.upsert({
        where: { code: p.code },
        update: {},
        create: p,
      })
    )
  );
  const ncdProvince = provinces.find(p => p.code === 'NCD')!;
  const ehpProvince = provinces.find(p => p.code === 'EHP')!;
  const morobeProvince = provinces.find(p => p.code === 'MPM')!;
  console.log(`  ✓ ${provinces.length} provinces created`);

  // 2. Schools
  console.log('🏫 Creating demo schools...');
  const governmentSchool = await prisma.school.upsert({
    where: { code: 'GOV-NCD-001' },
    update: {},
    create: {
      name: 'Boroko Primary School',
      code: 'GOV-NCD-001',
      schoolType: SchoolType.GOVERNMENT,
      schoolLevel: SchoolLevel.PRIMARY,
      provinceId: ncdProvince.id,
      address: 'Boroko, NCD, Papua New Guinea',
      phone: '+675 321 1234',
      email: 'admin@borokoprimary.edu.pg',
      motto: 'Learning for Life',
      established: 1975,
      isActive: true,
    },
  });

  const churchSchool = await prisma.school.upsert({
    where: { code: 'CHR-EHP-001' },
    update: {},
    create: {
      name: 'Sacred Heart Secondary School',
      code: 'CHR-EHP-001',
      schoolType: SchoolType.CHURCH_AGENCY,
      schoolLevel: SchoolLevel.SECONDARY,
      provinceId: ehpProvince.id,
      address: 'Goroka, Eastern Highlands',
      phone: '+675 532 1100',
      email: 'info@sacredheart.edu.pg',
      churchAgency: 'Catholic',
      motto: 'In Faith We Grow',
      established: 1962,
      isActive: true,
    },
  });

  const privateSchool = await prisma.school.upsert({
    where: { code: 'PVT-NCD-001' },
    update: {},
    create: {
      name: 'Port Moresby International School',
      code: 'PVT-NCD-001',
      schoolType: SchoolType.INTERNATIONAL,
      schoolLevel: SchoolLevel.COMBINED,
      provinceId: ncdProvince.id,
      address: 'Waigani, NCD, Papua New Guinea',
      phone: '+675 325 5500',
      email: 'enrolment@pomis.edu.pg',
      motto: 'Excellence Through Diversity',
      established: 1990,
      isActive: true,
    },
  });
  console.log('  ✓ 3 demo schools created');

  // 3. Super Admin
  console.log('👤 Creating admin users...');
  const passwordHash = await bcrypt.hash('Admin@2025', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@nsms.edu.pg' },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@nsms.edu.pg',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+675 300 0001',
    },
  });

  // School Admin for Boroko Primary
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'principal@borokoprimary.edu.pg' },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      firstName: 'Michael',
      lastName: 'Somare',
      email: 'principal@borokoprimary.edu.pg',
      passwordHash,
      role: UserRole.SCHOOL_ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+675 321 1235',
    },
  });

  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher.kila@borokoprimary.edu.pg' },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      firstName: 'Mary',
      lastName: 'Kila',
      email: 'teacher.kila@borokoprimary.edu.pg',
      passwordHash,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher.wari@borokoprimary.edu.pg' },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      firstName: 'Joseph',
      lastName: 'Wari',
      email: 'teacher.wari@borokoprimary.edu.pg',
      passwordHash,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  // Accountant
  await prisma.user.upsert({
    where: { email: 'finance@borokoprimary.edu.pg' },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      firstName: 'Ruth',
      lastName: 'Tau',
      email: 'finance@borokoprimary.edu.pg',
      passwordHash,
      role: UserRole.ACCOUNTANT,
      status: UserStatus.ACTIVE,
    },
  });

  // Librarian
  await prisma.user.upsert({
    where: { email: 'library@borokoprimary.edu.pg' },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      firstName: 'Sarah',
      lastName: 'Mond',
      email: 'library@borokoprimary.edu.pg',
      passwordHash,
      role: UserRole.LIBRARIAN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log('  ✓ Users created (password: Admin@2025)');

  // 4. Teacher Profiles
  console.log('👩‍🏫 Creating teacher profiles...');
  const tp1 = await prisma.teacherProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: {
      userId: teacher1.id,
      employeeNumber: 'TCH-NCD-001',
      qualification: 'Bachelor of Education',
      specialization: 'Mathematics & Science',
      yearsExperience: 8,
      dateJoined: new Date('2017-01-15'),
      salary: 1800.00,
    },
  });

  const tp2 = await prisma.teacherProfile.upsert({
    where: { userId: teacher2.id },
    update: {},
    create: {
      userId: teacher2.id,
      employeeNumber: 'TCH-NCD-002',
      qualification: 'Diploma in Teaching (Primary)',
      specialization: 'English & Social Science',
      yearsExperience: 5,
      dateJoined: new Date('2020-02-01'),
      salary: 1500.00,
    },
  });
  console.log('  ✓ Teacher profiles created');

  // 5. Academic Year & Terms
  console.log('📅 Creating academic year & terms...');
  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_year: { schoolId: governmentSchool.id, year: 2025 } },
    update: {},
    create: {
      schoolId: governmentSchool.id,
      year: 2025,
      startDate: new Date('2025-01-27'),
      endDate: new Date('2025-11-28'),
      isCurrent: true,
    },
  });

  const terms = await Promise.all([
    prisma.term.upsert({
      where: { academicYearId_termName: { academicYearId: academicYear.id, termName: TermName.TERM_1 } },
      update: {},
      create: { academicYearId: academicYear.id, termName: TermName.TERM_1, startDate: new Date('2025-01-27'), endDate: new Date('2025-04-11') },
    }),
    prisma.term.upsert({
      where: { academicYearId_termName: { academicYearId: academicYear.id, termName: TermName.TERM_2 } },
      update: {},
      create: { academicYearId: academicYear.id, termName: TermName.TERM_2, startDate: new Date('2025-04-28'), endDate: new Date('2025-07-11') },
    }),
    prisma.term.upsert({
      where: { academicYearId_termName: { academicYearId: academicYear.id, termName: TermName.TERM_3 } },
      update: {},
      create: { academicYearId: academicYear.id, termName: TermName.TERM_3, startDate: new Date('2025-07-28'), endDate: new Date('2025-10-10') },
    }),
    prisma.term.upsert({
      where: { academicYearId_termName: { academicYearId: academicYear.id, termName: TermName.TERM_4 } },
      update: {},
      create: { academicYearId: academicYear.id, termName: TermName.TERM_4, startDate: new Date('2025-10-27'), endDate: new Date('2025-11-28') },
    }),
  ]);
  console.log('  ✓ Academic year 2025 with 4 terms created');

  // 6. Classes
  console.log('🏛️ Creating classes...');
  const grade6A = await prisma.class.upsert({
    where: { schoolId_academicYearId_gradeLevel_section: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 6', section: 'A' } },
    update: {},
    create: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 6', section: 'A', capacity: 40 },
  });

  const grade6B = await prisma.class.upsert({
    where: { schoolId_academicYearId_gradeLevel_section: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 6', section: 'B' } },
    update: {},
    create: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 6', section: 'B', capacity: 40 },
  });

  const grade7A = await prisma.class.upsert({
    where: { schoolId_academicYearId_gradeLevel_section: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 7', section: 'A' } },
    update: {},
    create: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 7', section: 'A', capacity: 40 },
  });

  const grade8A = await prisma.class.upsert({
    where: { schoolId_academicYearId_gradeLevel_section: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 8', section: 'A' } },
    update: {},
    create: { schoolId: governmentSchool.id, academicYearId: academicYear.id, gradeLevel: 'Grade 8', section: 'A', capacity: 35 },
  });

  // Assign teachers to classes
  await prisma.classTeacher.upsert({
    where: { classId_teacherId: { classId: grade6A.id, teacherId: tp1.id } },
    update: {},
    create: { classId: grade6A.id, teacherId: tp1.id, isClassTeacher: true },
  });
  await prisma.classTeacher.upsert({
    where: { classId_teacherId: { classId: grade7A.id, teacherId: tp2.id } },
    update: {},
    create: { classId: grade7A.id, teacherId: tp2.id, isClassTeacher: true },
  });
  console.log('  ✓ 4 classes created with teacher assignments');

  // 7. Subjects
  console.log('📚 Creating subjects...');
  const subjectData = [
    { subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 6', isCompulsory: true },
    { subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 6', isCompulsory: true },
    { subjectName: 'Science', subjectCode: 'SCI', gradeLevel: 'Grade 6', isCompulsory: true },
    { subjectName: 'Social Science', subjectCode: 'SS', gradeLevel: 'Grade 6', isCompulsory: true },
    { subjectName: 'Health & Physical Education', subjectCode: 'HPE', gradeLevel: 'Grade 6', isCompulsory: true },
    { subjectName: 'Tok Pisin', subjectCode: 'TP', gradeLevel: 'Grade 6', isCompulsory: false },
    { subjectName: 'Agriculture', subjectCode: 'AGRIC', gradeLevel: 'Grade 6', isCompulsory: false },
    { subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 7', isCompulsory: true },
    { subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 7', isCompulsory: true },
    { subjectName: 'Science', subjectCode: 'SCI', gradeLevel: 'Grade 7', isCompulsory: true },
    { subjectName: 'Social Science', subjectCode: 'SS', gradeLevel: 'Grade 7', isCompulsory: true },
    { subjectName: 'Mathematics', subjectCode: 'MATH', gradeLevel: 'Grade 8', isCompulsory: true },
    { subjectName: 'English', subjectCode: 'ENG', gradeLevel: 'Grade 8', isCompulsory: true },
    { subjectName: 'Science', subjectCode: 'SCI', gradeLevel: 'Grade 8', isCompulsory: true },
  ];

  const subjects = await Promise.all(
    subjectData.map(s =>
      prisma.subject.upsert({
        where: { schoolId_subjectCode_gradeLevel: { schoolId: governmentSchool.id, subjectCode: s.subjectCode!, gradeLevel: s.gradeLevel } },
        update: {},
        create: { schoolId: governmentSchool.id, ...s },
      })
    )
  );
  console.log(`  ✓ ${subjects.length} subjects created`);

  // 8. Students
  console.log('👨‍🎓 Creating demo students...');
  const studentNames = [
    { firstName: 'Peter', lastName: 'Kumul', gender: Gender.MALE, dob: '2013-03-15', province: 'NCD' },
    { firstName: 'Janet', lastName: 'Waigani', gender: Gender.FEMALE, dob: '2013-07-22', province: 'Central' },
    { firstName: 'James', lastName: 'Tari', gender: Gender.MALE, dob: '2013-01-10', province: 'Hela' },
    { firstName: 'Rose', lastName: 'Manus', gender: Gender.FEMALE, dob: '2013-11-30', province: 'Manus' },
    { firstName: 'David', lastName: 'Wewak', gender: Gender.MALE, dob: '2013-09-05', province: 'East Sepik' },
    { firstName: 'Grace', lastName: 'Kieta', gender: Gender.FEMALE, dob: '2013-04-18', province: 'Bougainville' },
    { firstName: 'Paul', lastName: 'Goroka', gender: Gender.MALE, dob: '2012-06-12', province: 'Eastern Highlands' },
    { firstName: 'Martha', lastName: 'Lae', gender: Gender.FEMALE, dob: '2012-08-25', province: 'Morobe' },
    { firstName: 'John', lastName: 'Kimbe', gender: Gender.MALE, dob: '2012-02-14', province: 'West New Britain' },
    { firstName: 'Elizabeth', lastName: 'Rabaul', gender: Gender.FEMALE, dob: '2012-12-01', province: 'East New Britain' },
    { firstName: 'Simon', lastName: 'Wabag', gender: Gender.MALE, dob: '2011-05-20', province: 'Enga' },
    { firstName: 'Ruth', lastName: 'Daru', gender: Gender.FEMALE, dob: '2011-10-08', province: 'Western' },
    { firstName: 'Thomas', lastName: 'Mendi', gender: Gender.MALE, dob: '2010-07-30', province: 'Southern Highlands' },
    { firstName: 'Maria', lastName: 'Kundiawa', gender: Gender.FEMALE, dob: '2010-03-22', province: 'Chimbu' },
    { firstName: 'Andrew', lastName: 'Vanimo', gender: Gender.MALE, dob: '2010-11-15', province: 'West Sepik' },
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const studentNumber = `NSMS-2025-${String(i + 1).padStart(5, '0')}`;
    const student = await prisma.student.upsert({
      where: { studentNumber },
      update: {},
      create: {
        schoolId: governmentSchool.id,
        studentNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dateOfBirth: new Date(s.dob),
        province: s.province,
        citizenship: 'Papua New Guinean',
        status: StudentStatus.ENROLLED,
      },
    });
    students.push(student);
  }
  console.log(`  ✓ ${students.length} students created`);

  // 9. Enroll students into classes
  console.log('📝 Enrolling students into classes...');
  // First 5 in Grade 6A, next 3 in Grade 6B, next 4 in Grade 7A, last 3 in Grade 8A
  const classAssignments = [
    ...students.slice(0, 5).map(s => ({ classId: grade6A.id, studentId: s.id })),
    ...students.slice(5, 8).map(s => ({ classId: grade6B.id, studentId: s.id })),
    ...students.slice(8, 12).map(s => ({ classId: grade7A.id, studentId: s.id })),
    ...students.slice(12, 15).map(s => ({ classId: grade8A.id, studentId: s.id })),
  ];
  for (const ca of classAssignments) {
    await prisma.classEnrollment.upsert({
      where: { classId_studentId: { classId: ca.classId, studentId: ca.studentId } },
      update: {},
      create: ca,
    });
  }
  console.log('  ✓ Students enrolled');

  // 10. Fee Structures
  console.log('💰 Creating fee structures...');
  const feeStructures = await Promise.all([
    prisma.feeStructure.create({
      data: { schoolId: governmentSchool.id, termId: terms[0].id, feeType: FeeType.TUITION, amount: 350.00, description: 'Term 1 Tuition Fee', gradeLevel: 'Grade 6' },
    }),
    prisma.feeStructure.create({
      data: { schoolId: governmentSchool.id, termId: terms[0].id, feeType: FeeType.BOOK_FEE, amount: 85.00, description: 'Term 1 Book & Stationery Fee', gradeLevel: 'Grade 6' },
    }),
    prisma.feeStructure.create({
      data: { schoolId: governmentSchool.id, termId: terms[0].id, feeType: FeeType.SPORT_FEE, amount: 50.00, description: 'Term 1 Sports Fee', gradeLevel: 'Grade 6' },
    }),
    prisma.feeStructure.create({
      data: { schoolId: governmentSchool.id, termId: terms[0].id, feeType: FeeType.TUITION, amount: 500.00, description: 'Term 1 Tuition Fee', gradeLevel: 'Grade 7' },
    }),
    prisma.feeStructure.create({
      data: { schoolId: governmentSchool.id, termId: terms[0].id, feeType: FeeType.TUITION, amount: 650.00, description: 'Term 1 Tuition Fee', gradeLevel: 'Grade 8' },
    }),
  ]);
  console.log(`  ✓ ${feeStructures.length} fee structures created (PGK)`);

  // 11. Payments
  console.log('💳 Creating sample payments...');
  await prisma.payment.create({
    data: {
      schoolId: governmentSchool.id,
      studentId: students[0].id,
      amount: 350.00,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.COMPLETED,
      receiptNumber: 'RCP-2025-00001',
      description: 'Tuition payment - Term 1',
      paidAt: new Date('2025-02-05'),
    },
  });
  await prisma.payment.create({
    data: {
      schoolId: governmentSchool.id,
      studentId: students[1].id,
      amount: 200.00,
      paymentMethod: PaymentMethod.MOBILE_MONEY,
      paymentStatus: PaymentStatus.COMPLETED,
      receiptNumber: 'RCP-2025-00002',
      description: 'Partial tuition payment - Term 1',
      paidAt: new Date('2025-02-10'),
    },
  });
  await prisma.payment.create({
    data: {
      schoolId: governmentSchool.id,
      studentId: students[7].id,
      amount: 500.00,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.COMPLETED,
      receiptNumber: 'RCP-2025-00003',
      description: 'Tuition payment - Term 1',
      paidAt: new Date('2025-01-30'),
    },
  });
  console.log('  ✓ Sample payments recorded');

  // 12. Library Books
  console.log('📖 Creating library books...');
  const bookData = [
    { title: 'Mathematics for PNG Grade 6', author: 'NDOE PNG', isbn: '978-9980-001-01', category: 'Mathematics', totalCopies: 30, availableCopies: 28 },
    { title: 'English Language Arts Grade 6', author: 'NDOE PNG', isbn: '978-9980-001-02', category: 'English', totalCopies: 30, availableCopies: 27 },
    { title: 'Science for PNG Primary', author: 'NDOE PNG', isbn: '978-9980-001-03', category: 'Science', totalCopies: 25, availableCopies: 24 },
    { title: 'Social Science Textbook', author: 'NDOE PNG', isbn: '978-9980-001-04', category: 'Social Science', totalCopies: 25, availableCopies: 25 },
    { title: 'Tales from PNG Villages', author: 'Sir Paulias Matane', isbn: '978-9980-002-01', category: 'Literature', totalCopies: 15, availableCopies: 12 },
    { title: 'PNG History & Culture', author: 'Institute of PNG Studies', isbn: '978-9980-002-02', category: 'History', totalCopies: 10, availableCopies: 10 },
  ];
  const books = await Promise.all(
    bookData.map(b => prisma.libraryBook.create({ data: { schoolId: governmentSchool.id, ...b } }))
  );
  console.log(`  ✓ ${books.length} library books created`);

  // 13. Announcements
  console.log('📢 Creating announcements...');
  await prisma.announcement.create({
    data: {
      schoolId: governmentSchool.id,
      title: 'Welcome to 2025 Academic Year',
      content: 'Welcome back to Boroko Primary School for the 2025 academic year. Classes begin on Monday, 27th January. All students must be in full uniform.',
      priority: 'HIGH',
      createdById: schoolAdmin.id,
    },
  });
  await prisma.announcement.create({
    data: {
      schoolId: governmentSchool.id,
      title: 'Fee Payment Deadline',
      content: 'All outstanding fees for Term 1 must be paid by 28th February 2025. Payments can be made via cash, bank transfer, or mobile money (MoniPlus/CellMoni).',
      priority: 'URGENT',
      createdById: schoolAdmin.id,
    },
  });
  await prisma.announcement.create({
    data: {
      schoolId: governmentSchool.id,
      title: 'Inter-School Sports Day',
      content: 'The annual NCD Inter-School Sports Day will be held on March 15th at Sir John Guise Stadium. Students selected for athletics and team sports should report to their PE teacher.',
      priority: 'NORMAL',
      createdById: schoolAdmin.id,
    },
  });
  console.log('  ✓ Announcements created');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo login credentials:');
  console.log('  Super Admin:  admin@nsms.edu.pg / Admin@2025');
  console.log('  School Admin: principal@borokoprimary.edu.pg / Admin@2025');
  console.log('  Teacher:      teacher.kila@borokoprimary.edu.pg / Admin@2025');
  console.log('  Accountant:   finance@borokoprimary.edu.pg / Admin@2025');
  console.log('  Librarian:    library@borokoprimary.edu.pg / Admin@2025');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
