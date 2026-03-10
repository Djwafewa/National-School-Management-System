# 🇵🇬 National School Management System (NSMS)

A comprehensive, multi-tenant SaaS platform designed for managing schools across Papua New Guinea — Government, Church Agency, Private, and International schools.

Built with modern web technologies, NSMS provides student enrollment, attendance tracking, exam management, fee collection (PGK), timetabling, library management, and powerful reporting — all in one platform.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### Core Modules
| Module | Description |
|--------|-------------|
| **Multi-Tenant Schools** | Isolated data per school, supports Government, Church, Private & International |
| **Student Management** | Enrollment, profiles, guardians, status tracking, auto-generated student numbers |
| **Teacher Management** | Profiles, qualifications, salary tracking, class/subject assignments |
| **Class & Enrollment** | Academic year/term structure, graded sections, bulk enrollment |
| **Attendance** | Student & teacher attendance, bulk recording, summaries |
| **Examinations** | Exam creation, bulk results entry, PNG grading system (A-E), report cards |
| **Fee Management** | Fee structures by grade/term, balance tracking, outstanding reports |
| **Payments** | Multiple methods (Cash, Bank, Mobile Money), auto receipts, FIFO balance application |
| **Timetable** | Weekly schedule builder, subject/teacher assignment, class-based view |
| **Library** | Book catalog, loan management, overdue tracking |
| **Announcements** | Priority-based notices (Normal, High, Urgent) |
| **Reports & Analytics** | Enrollment stats, fee collection, academic performance, provincial reports |
| **Audit Logging** | Full activity trail for compliance |

### PNG-Specific Features
- 🇵🇬 All 22 PNG provinces with codes and regions
- 💰 Papua New Guinea Kina (PGK) currency throughout
- 📱 Mobile Money support (MoniPlus, CellMoni)
- ⛪ 13 Church Agency school types (Catholic, Lutheran, SDA, United Church, etc.)
- 📊 PNG National Grading System (A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, E < 40)
- 🏫 PNG school levels (Elementary, Primary, Secondary, Vocational, Technical, Combined)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express.js + TypeScript |
| **Frontend** | Next.js 14 (App Router) + React 18 + TypeScript |
| **Database** | PostgreSQL via Prisma ORM |
| **Styling** | TailwindCSS (PNG flag color theme) |
| **Auth** | JWT with refresh token rotation |
| **Validation** | Zod schema validation |
| **Logging** | Winston (file + console) |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                          │
│                  Next.js 14 Frontend                          │
│                  localhost:3000                                │
├──────────────────────────────────────────────────────────────┤
│                  API Proxy (/api → :4000)                     │
├──────────────────────────────────────────────────────────────┤
│                     BACKEND SERVER                            │
│               Express.js + TypeScript                         │
│                  localhost:4000                                │
│  ┌─────────┬──────────┬────────────┬───────────────────┐     │
│  │  Auth   │  Routes  │ Middleware │    Validation     │     │
│  │  (JWT)  │ (16 APIs)│(RBAC+Audit)│    (Zod)         │     │
│  └─────────┴──────────┴────────────┴───────────────────┘     │
├──────────────────────────────────────────────────────────────┤
│              Prisma ORM (30+ Models)                          │
├──────────────────────────────────────────────────────────────┤
│              PostgreSQL Database                              │
│           Multi-tenant (School-scoped)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended 20 LTS)
- **PostgreSQL** 14+ (or Docker)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/your-org/nsms.git
cd nsms
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://nsms_user:your_password@localhost:5432/nsms
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Set Up Database

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts both backend (port 4000) and frontend (port 3000) concurrently.

Or start them separately:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Open the App

Visit **http://localhost:3000** and log in with demo credentials.

---

## 📁 Project Structure

```
nsms/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (30+ models, 13 enums)
│   │   └── seed.ts              # Demo data with PNG schools/provinces
│   ├── src/
│   │   ├── server.ts            # Entry point
│   │   ├── app.ts               # Express config, routes, middleware
│   │   ├── database.ts          # Prisma singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT auth + RBAC + school scoping
│   │   │   ├── validate.ts      # Zod validation middleware
│   │   │   ├── auditLog.ts      # Audit trail logger
│   │   │   ├── errorHandler.ts  # Global error handler
│   │   │   └── requestLogger.ts # HTTP request logger
│   │   ├── routes/              # 16 API route files
│   │   ├── schemas/             # Zod validation schemas
│   │   └── utils/               # Logger, helpers, custom errors
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Login page (PNG-themed)
│   │   │   ├── globals.css      # Tailwind + custom components
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx   # Sidebar + top bar layout
│   │   │       ├── page.tsx     # Dashboard overview
│   │   │       ├── students/    # Student list + detail view
│   │   │       ├── teachers/    # Teacher management
│   │   │       ├── classes/     # Class management
│   │   │       ├── subjects/    # Subject management
│   │   │       ├── attendance/  # Attendance tracking
│   │   │       ├── exams/       # Exam & results
│   │   │       ├── fees/        # Fee structures
│   │   │       ├── payments/    # Payment recording
│   │   │       ├── timetable/   # Weekly timetable
│   │   │       ├── library/     # Book & loan management
│   │   │       ├── announcements/ # School notices
│   │   │       ├── reports/     # Analytics & reports
│   │   │       ├── schools/     # Admin: school management
│   │   │       ├── users/       # Admin: user management
│   │   │       └── audit/       # Admin: audit logs
│   │   └── lib/
│   │       └── api.ts           # API client with auth
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml           # PostgreSQL + Redis + App
├── .github/workflows/ci.yml    # CI/CD pipeline
└── package.json                 # Monorepo workspace scripts
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout & revoke tokens |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |

### Schools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schools` | List schools (filterable) |
| POST | `/api/schools` | Create school |
| GET | `/api/schools/:id` | Get school detail |
| PUT | `/api/schools/:id` | Update school |
| DELETE | `/api/schools/:id` | Soft delete school |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students (search, filter) |
| POST | `/api/students` | Enroll new student |
| GET | `/api/students/:id` | Student profile |
| PUT | `/api/students/:id` | Update student |
| PATCH | `/api/students/:id/status` | Update status |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/record` | Bulk record attendance |
| GET | `/api/attendance/class/:classId` | Class attendance view |
| GET | `/api/attendance/student/:studentId` | Student attendance + summary |

### Fees & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fees` | List fee structures |
| POST | `/api/fees` | Create fee structure |
| POST | `/api/fees/assign` | Assign fees to students |
| GET | `/api/fees/outstanding` | Outstanding balances |
| POST | `/api/payments` | Record payment (auto receipt) |
| GET | `/api/payments` | List payments |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List exams |
| POST | `/api/exams` | Create exam |
| POST | `/api/exams/:id/results` | Bulk enter results |
| GET | `/api/exams/:id/report-card/:studentId` | Student report card |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/enrollment` | Enrollment statistics |
| GET | `/api/reports/fees` | Fee collection report |
| GET | `/api/reports/academic` | Academic performance |
| GET | `/api/reports/attendance` | Attendance summary |
| GET | `/api/reports/provincial` | Provincial aggregates |

### Additional APIs
- `/api/subjects` — Subject CRUD + teacher assignment
- `/api/teachers` — Teacher list & profile management
- `/api/classes` — Class CRUD + enrollment + teacher assignment
- `/api/timetable` — Weekly timetable management
- `/api/library` — Books CRUD + loans + overdue
- `/api/announcements` — Notice board CRUD
- `/api/dashboard` — Aggregated statistics
- `/api/users` — User management + audit logs

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| **Super Admin** | Full platform access, all schools |
| **Provincial Admin** | Provincial-level oversight |
| **School Admin** | Full access within their school |
| **Principal** | School management capabilities |
| **Teacher** | Class management, attendance, grades |
| **Accountant** | Fee & payment management |
| **Librarian** | Library management |
| **Parent** | View child's info (read-only) |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@nsms.edu.pg` | `Admin@2025` |
| School Admin | `principal@borokoprimary.edu.pg` | `Admin@2025` |
| Teacher | `teacher.kila@borokoprimary.edu.pg` | `Admin@2025` |
| Accountant | `finance@borokoprimary.edu.pg` | `Admin@2025` |
| Librarian | `library@borokoprimary.edu.pg` | `Admin@2025` |

---

## 🐳 Deployment

### Docker Compose (Recommended)

```bash
# Set environment variables
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret
export JWT_REFRESH_SECRET=your_refresh_secret

# Build and start all services
docker compose up -d --build

# Run migrations and seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Manual Deployment

```bash
# Build backend
cd backend
npm ci
npm run build
npx prisma migrate deploy

# Build frontend
cd frontend
npm ci
npm run build

# Start in production
NODE_ENV=production node backend/dist/server.js
NODE_ENV=production npx next start frontend
```

---

## 📄 License

This project is developed for the Papua New Guinea education sector.

---

Built with ❤️ for PNG Schools
