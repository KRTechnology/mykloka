# Kimberly Ryan HR Management System

A modern, role-based HR management system built with Next.js 14, featuring real-time attendance tracking, task management, and user administration

## Features

### Role-Based Access Control
- **Super Admin**: Full system access and configuration
- **HR Manager**: User management and company-wide oversight
- **Department Manager**: Team management and departmental oversight
- **Employee**: Personal task and attendance management

### Core Functionality
- 👥 User Management
  - User invitations with email verification
  - Role assignment and permissions
  - Profile management

- ⏰ Attendance Tracking
  - Clock in/out functionality
  - Attendance history
  - Manager oversight

- ✅ Task Management
  - Create and assign tasks
  - Track task progress
  - Team task overview

- 🏢 Department Management
  - Department structure
  - Team organization
  - Resource allocation

### Technical Features
- Server-side rendering with Next.js 14
- Type-safe database operations with Drizzle ORM
- PostgreSQL database (Neon)
- JWT-based authentication
- Email notifications with Nodemailer
- Modern UI with Tailwind CSS and shadcn/ui
- Smooth animations with Framer Motion

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Email**: Nodemailer
- **Forms**: React Hook Form + Zod
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm/yarn

### Installation

1. Clone the repository:
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
4. Set up the database
5. Seed the database
6. Run the development server


```bash
npm run dev
```

### Default Super Admin Credentials
- Email: super-admin@kimberly-ryan.net
- Password: Admin@123

(Change these credentials after first login)

## Project Structure



# Todos


- [  ] Forgot password and reset password.
- [  ] Create single user page.
- [ x] Add an isLate flag to the attendance table.
- [  ] Get all late attendance for a duration of time.
- [  ] Edit/Update User Roles and Permissions
- [  ] Edit/Update User Profile, Departments
- [ x] Setup clock in/out
- [  ] Setup task management
- [ x] Setup role management
- [  ] Setup permission management
- [  ] Setup dashboard
- [  ] Setup static page for Tasks
