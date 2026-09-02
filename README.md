# School CRM — Unified Next.js Application

Single unified Next.js 15 (App Router) multi-tenant application for School CRM, completely migrated from separate CRA React frontend and Express/MySQL backend.

## Features
- **Multi-Tenant Architecture**: Encrypted `School` header resolution supporting tenant-isolated data access.
- **Role-Based Access Control**: Prioritized access levels (1: Super Admin, 2: Admin, 3: Staff/Teacher, 4: Parent, 5: Guardian/Guest).
- **Comprehensive School Management**: Students, Teachers, Employees, Attendance, TimeTables, Marksheets, Payments, Buses, Holidays, Noticeboard, Amenities, and ID Card Generation.
- **Supabase Cloud Storage**: Replacement of local disk uploads and AWS S3 with Supabase Storage.
- **Vercel Ready**: Edge/Serverless compatible route handlers and Prisma client pooling.

## Setup & Deployment
Please see [SETUP.md](./SETUP.md) for detailed instructions.
