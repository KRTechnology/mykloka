# Kimberly Ryan HR Management System

A modern, role-based HR management system built with Next.js 15, featuring real-time attendance tracking, task management, user administration, and comprehensive permission management. The system is designed for Kimberly Ryan and provides a complete solution for managing employees, departments, attendance, and tasks.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Database Seeding](#database-seeding)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Permissions System](#permissions-system)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Default Credentials](#default-credentials)
- [Key Concepts](#key-concepts)
- [Troubleshooting](#troubleshooting)

## Features

### Role-Based Access Control

The system implements a comprehensive RBAC system with four distinct roles:

- **Super Admin**: Full system access including user management, role management, system settings, and all administrative functions
- **HR Manager**: Company-wide oversight including user management, department management, attendance oversight, and task management across all departments
- **Department Manager**: Departmental oversight including team management, department attendance tracking, and task approval for their department
- **Employee**: Personal access to their own tasks, attendance tracking, and profile management

### Core Functionality

#### 👥 User Management

- User invitations with email verification via Resend
- Role assignment and permission management
- Profile management with profile images
- Manager-subordinate relationships
- Work location and work structure assignment (Remote/Hybrid/Onsite)

#### ⏰ Attendance Tracking

- GPS-based clock in/out functionality
- Location-based attendance validation
- Automatic late status detection (after 8:30 AM)
- Attendance history and calendar view
- Attendance statistics (daily, weekly, monthly)
- Attendance streaks and analytics
- Average work hours calculation
- Support for remote work tracking

#### ✅ Task Management

- Create, assign, and track tasks
- Task status workflow (Pending → In Progress → Completed → Approved/Rejected)
- Task approval system for managers
- Due date tracking
- Email notifications for task updates
- Task overview dashboards
- Filter and search functionality

#### 🏢 Department Management

- Department structure creation and management
- Department head assignment
- Team organization by department
- Department-based access control

### Technical Features

- **Server-Side Rendering** with Next.js 15 (App Router)
- **Type-Safe Database Operations** with Drizzle ORM
- **PostgreSQL Database** (Neon for production, local PostgreSQL for development)
- **JWT-based Authentication** with secure token management
- **Email Notifications** with Resend and React Email templates
- **Modern UI** with Tailwind CSS and shadcn/ui components
- **Smooth Animations** with Framer Motion
- **Theme Support** with next-themes (light/dark mode)
- **Form Validation** with React Hook Form + Zod
- **Location-based Services** for attendance tracking
- **Caching** for performance optimization

## Tech Stack

- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL (Neon for production)
- **ORM**: Drizzle ORM 0.39.2
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion 12.4.1
- **Email**: Resend API (@react-email/components)
- **Forms**: React Hook Form 7.54.2 + Zod 3.24.1
- **Authentication**: JWT (jose library)
- **Password Hashing**: Argon2
- **Charts**: Recharts 2.15.1
- **Notifications**: Sonner (toast notifications)
- **Date Management**: date-fns 4.1.0
- **Icons**: Lucide React 0.475.0

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (local or Neon)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd kloka-hrs
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment files:**

   - Create `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Set up the database:**

   - See [Database Setup](#database-setup) section

5. **Seed the database:**

   - See [Database Seeding](#database-seeding) section

6. **Run the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL_LOCAL=postgresql://user:password@localhost:5432/kloka_hrs
DATABASE_URL=postgresql://user:password@neon.tech/kloka_hrs  # Production (Neon)
DATABASE_URL_UNPOOLED=postgresql://user:password@neon.tech/kloka_hrs  # For migrations

# Authentication
JWT_SECRET=your-secret-key-here-min-32-characters-long

# Email Configuration (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=Kimberly Ryan

# Node Environment
NODE_ENV=development
```

**Important Notes:**

- `DATABASE_URL_LOCAL` is used for local development with PostgreSQL
- `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are used for production (Neon)
- `JWT_SECRET` should be a strong, random string (minimum 32 characters)
- `RESEND_API_KEY` can be obtained from [resend.com](https://resend.com)
- `RESEND_FROM_EMAIL` should be a verified domain email in Resend
- `NEXT_PUBLIC_APP_URL` is used for email links and should match your deployment URL

### Database Setup

#### Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed)

2. **Create a database:**

```bash
createdb kloka_hrs
```

3. **Update your `.env.local`** with your PostgreSQL connection string:

```env
DATABASE_URL_LOCAL=postgresql://username:password@localhost:5432/kloka_hrs
```

#### Neon Database Setup (Production)

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and add it to your `.env.local` as `DATABASE_URL`
4. For migrations, use the connection pooler URL as `DATABASE_URL_UNPOOLED`

#### Run Migrations

After setting up your database connection:

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to the database
npm run db:migrate

# Or push schema directly (development only)
npm run db:push
```

### Database Seeding

The project includes seed scripts to populate initial data. **Run them in this order:**

1. **Seed Roles** (must be first):

```bash
npm run seed:roles
```

This creates four roles: Super Admin, HR Manager, Department Manager, and Employee with their respective permissions.

2. **Seed Super Admin** (requires roles to be seeded):

```bash
npm run seed:admin
```

Creates the default super admin user (see [Default Credentials](#default-credentials)).

3. **Seed Departments** (optional):

```bash
npm run seed:departments
```

Creates default departments: MANAGEMENT, PEOPLE SERVICE DEPARTMENT, TECH AND PRODUCT, SALES, OUTSOURCING, LEARNING AND DEVELOPMENT, FINANCE, STRATEGY AND COMMUNICATIONS, RECRUITMENT.

4. **Seed Work Locations** (optional):

```bash
npm run seed:locations
```

Creates default work locations (Lagos and Abuja offices) with GPS coordinates.

**Note:** All seed scripts are idempotent - they check for existing data before seeding.

## Project Structure

```
kloka-hrs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (login, verify, etc.)
│   │   ├── login/
│   │   ├── verify/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── users/                # User management endpoints
│   │   ├── departments/          # Department endpoints
│   │   └── roles/                # Role endpoints
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── actions/                       # Server actions
│   ├── attendance/               # Attendance actions
│   ├── auth.ts                   # Authentication actions
│   ├── dashboard.ts              # Dashboard actions
│   ├── departments.ts            # Department actions
│   ├── tasks.ts                  # Task actions
│   └── users.ts                  # User actions
├── components/                   # React components
│   ├── attendance/               # Attendance components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── departments/              # Department components
│   ├── profile/                  # User profile components
│   ├── settings/                 # Settings components
│   ├── tasks/                    # Task components
│   ├── ui/                       # shadcn/ui components
│   └── users/                    # User management components
├── contexts/                     # React contexts
│   └── TasksContext.tsx          # Tasks context provider
├── drizzle/                      # Database migrations
│   └── meta/                     # Migration metadata
├── lib/                          # Core libraries and utilities
│   ├── api/                      # API client functions
│   ├── attendance/               # Attendance service and types
│   ├── auth/                     # Authentication service and utilities
│   ├── db/                       # Database configuration and schema
│   │   └── schema/               # Drizzle schema files
│   ├── departments/              # Department utilities
│   ├── email/                    # Email service and templates
│   ├── tasks/                    # Task service
│   ├── users/                    # User service
│   ├── utils/                    # Utility functions
│   └── utils.ts                  # Shared utilities (cn, etc.)
├── migrations/                   # Custom database migrations
├── scripts/                      # Database seeding scripts
│   ├── seed-roles.ts
│   ├── seed-super-admin.ts
│   ├── seed-departments.ts
│   └── seed-work-locations.ts
├── middleware.ts                 # Next.js middleware for auth
├── drizzle.config.ts             # Drizzle configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Database Schema

The database uses PostgreSQL with the following main tables:

### Core Tables

- **users**: User accounts with authentication, roles, and profile information
- **roles**: System roles with permission arrays (JSONB)
- **departments**: Organizational departments with head assignments
- **work_locations**: Office locations with GPS coordinates and radius
- **attendance**: Clock in/out records with location data and status
- **tasks**: Task management with approval workflow
- **email_verification_tokens**: Email verification tokens with expiration

### Key Relationships

- Users → Roles (many-to-one)
- Users → Departments (many-to-one)
- Users → Work Locations (many-to-one)
- Users → Users (self-referential for manager relationships)
- Attendance → Users (many-to-one)
- Tasks → Users (many-to-one, multiple relationships: creator, assignee, approver)
- Departments → Users (one-to-many for department head)

### Important Enums

- **work_structure**: `FULLY_REMOTE`, `HYBRID`, `FULLY_ONSITE`
- **attendance_status**: `present`, `late`, `absent`
- **task_status**: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `APPROVED`, `REJECTED`

See `lib/db/schema/` for complete schema definitions.

## API Routes

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify` - Email verification

### Users

- `GET /api/users` - Get users (with filtering, pagination, sorting)
- `POST /api/users` - Create new user (requires `create_users` permission)

### Departments

- `GET /api/departments` - Get departments (filtered by access)
- `POST /api/departments` - Create department (requires `create_departments` permission)
- `GET /api/departments/[id]` - Get specific department
- `PATCH /api/departments/[id]` - Update department (requires `edit_departments` permission)

### Roles

- `GET /api/roles` - Get all roles

All API routes are protected by middleware and permission checks. See individual route files in `app/api/` for detailed documentation.

## Authentication & Authorization

### Authentication Flow

1. User logs in with email and password
2. Credentials are validated against the database (Argon2 password verification)
3. JWT token is created with user payload (includes permissions, role, department, etc.)
4. Token is stored in HTTP-only cookie named `auth_token`
5. Token expires after 24 hours

### Middleware

The `middleware.ts` file handles:

- Route protection (redirects unauthenticated users to login)
- Token verification on protected routes
- Public route access (login, verify, reset-password, forgot-password)
- User info injection into request headers

### Authorization

Authorization is handled through:

- **Permission-based**: Using the `validatePermission()` function
- **Department-based**: Using `validateDepartmentAccess()` and `validateUserAccess()`
- **Role-based**: Permissions are attached to roles, which are assigned to users

### Session Management

Server-side session is retrieved using:

```typescript
import { getServerSession } from "@/lib/auth/auth";
const session = await getServerSession();
```

The session includes:

- User ID, name, email
- Role ID and name
- Permissions array
- Department ID
- Manager ID
- Work structure and location

## Permissions System

The system uses a granular permission-based access control system. Permissions are stored as JSONB arrays in the roles table.

### Permission Categories

#### User Management Permissions

- `view_users` - View user list
- `create_users` - Invite/create new users
- `edit_users` - Edit user information
- `delete_users` - Delete users
- `view_user_profiles` - View detailed user profiles

#### Department Permissions

- `view_all_departments` - View all departments (company-wide)
- `view_department` - View own department
- `view_department_members` - View department team members
- `create_departments` - Create new departments
- `edit_departments` - Edit department information
- `delete_departments` - Delete departments

#### Attendance Permissions

- `view_all_attendance` - View all attendance records
- `view_department_attendance` - View department attendance
- `view_own_attendance` - View personal attendance
- `create_attendance` - Clock in/out
- `view_attendance_reports` - Access attendance analytics
- `view_department_attendance_reports` - Department-level reports

#### Task Permissions

- `view_all_tasks` - View all tasks
- `view_department_tasks` - View department tasks
- `view_own_tasks` - View personal tasks
- `create_tasks` - Create tasks
- `create_tasks_for_others` - Create tasks for other users
- `create_tasks_for_department` - Create tasks for department members
- `edit_tasks` - Edit any task
- `edit_own_tasks` - Edit own tasks
- `delete_tasks` - Delete any task
- `delete_own_tasks` - Delete own tasks
- `approve_tasks` - Approve any task
- `approve_department_tasks` - Approve department tasks

#### System Management Permissions

- `manage_roles` - Create/edit/delete roles
- `view_system_reports` - Access system-wide reports
- `manage_system_settings` - Manage system configuration

### Default Role Permissions

See `scripts/seed-roles.ts` for the complete permission structure assigned to each role.

## Development Workflow

### Making Schema Changes

1. **Modify schema files** in `lib/db/schema/`
2. **Generate migration:**

```bash
npm run db:generate
```

3. **Review generated migration** in `drizzle/` directory
4. **Apply migration:**

```bash
npm run db:migrate
```

### Creating New Features

1. **Create database schema** (if needed) in `lib/db/schema/`
2. **Create service layer** in `lib/[feature]/`
3. **Create server actions** in `actions/[feature].ts`
4. **Create API routes** in `app/api/[feature]/`
5. **Create UI components** in `components/[feature]/`
6. **Create pages** in `app/(dashboard)/[feature]/`

### Testing Email Templates

```bash
npm run email
```

This starts the React Email development server for previewing email templates.

## Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run email` - Preview email templates (React Email dev server)

### Database Scripts

- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema directly (development only)
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:drop` - Drop database (use with caution)

### Seeding Scripts

- `npm run seed:roles` - Seed default roles and permissions
- `npm run seed:admin` - Seed super admin user
- `npm run seed:departments` - Seed default departments
- `npm run seed:locations` - Seed work locations

## Default Credentials

After running the seed scripts, you can log in with:

- **Email**: `super-admin@kimberly-ryan.net`
- **Password**: `Admin@123`

**⚠️ IMPORTANT:** Change these credentials immediately after first login in production!

## Key Concepts

### Work Structure

Users can have three work structure types:

- `FULLY_REMOTE`: No office attendance required
- `HYBRID`: Combination of remote and office work
- `FULLY_ONSITE`: Office attendance required

### Attendance Status

- `present`: Clocked in before 8:30 AM
- `late`: Clocked in after 8:30 AM
- `absent`: No attendance record for the day

### Task Approval Workflow

1. Task created → `PENDING`
2. Manager approves to start → `IN_PROGRESS`
3. User marks complete → `COMPLETED`
4. Manager approves completion → `APPROVED`
5. Or manager rejects → `REJECTED`

### Location-based Attendance

- Clock in/out requires GPS coordinates
- System validates location against assigned work location
- Supports geofencing with configurable radius

### Email Verification

- New users receive invitation email with verification link
- Link expires after 24 hours
- User sets password during verification process

## Troubleshooting

### Database Connection Issues

**Error**: "Database URL not found"

- Ensure `.env.local` has `DATABASE_URL_LOCAL` set
- Check PostgreSQL is running (local) or Neon connection is valid

**Error**: "Connection timeout"

- Verify database credentials
- Check network connectivity
- For Neon, ensure connection pooler URL is used for production

### Migration Issues

**Error**: "Migration conflicts"

- Review migration files in `drizzle/` directory
- Ensure database is up to date: `npm run db:migrate`
- For development, you can reset: `npm run db:drop` (then recreate)

### Authentication Issues

**Error**: "Invalid token"

- Clear browser cookies
- Check `JWT_SECRET` is set in environment variables
- Ensure token hasn't expired (24 hours)

### Email Issues

**Error**: "Failed to send email"

- Verify `RESEND_API_KEY` is correct
- Check `RESEND_FROM_EMAIL` is verified in Resend dashboard
- Ensure domain is verified in Resend

### Build Issues

**Error**: TypeScript errors

- Run `npm run lint` to see specific errors
- Ensure all environment variables are set
- Check `tsconfig.json` paths are correct

## Contributing

When adding new features:

1. Follow the existing project structure
2. Update TypeScript types as needed
3. Add proper error handling
4. Include permission checks for protected operations
5. Update this README if adding major features

## License

[Add your license information here]

---

**Note**: This README is comprehensive and should provide all necessary context for new developers joining the project. For questions or clarifications, refer to the code comments or reach out to the development team.
