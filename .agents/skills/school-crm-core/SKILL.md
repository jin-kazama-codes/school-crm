---
name: school-crm-core
description: Comprehensive architecture guide, database schema map, multi-tenant workflows, role hierarchies, and API enrichment rules for the School CRM Next.js application.
---

# School CRM Core Skill

This skill provides complete operational knowledge, technical guidelines, database foreign key resolutions, and component conventions for developing, debugging, and extending the School CRM Next.js application.

## 1. System Architecture & Tech Stack
- **Framework**: Next.js 15+ (App Router, Turbopack, TypeScript)
- **Database**: PostgreSQL (Supabase) via Prisma ORM (`prisma/schema.prisma`)
- **Multi-Tenant Scoping**: All entities scoped by `school_id` unless SuperAdmin has "All Schools" active.
- **State Management**: Redux + Redux Thunk
- **Component Styling**: Tailwind CSS with dark-mode support and Lucide React icons.

## 2. Role Priority Mapping (1 to 5)
- `1` = **SuperAdmin**: Cross-tenant view, global configurations (`Class`, `Section`, `Subject`, `Amenity`, `Role`, `School`). Operational edit buttons hidden.
- `2` = **School Admin**: Full management within their assigned school.
- `3` = **Sub Admin**: School administrative staff (Users, Staff, Buses, Notices, Payments).
- `4` = **Teacher**: Academic records (`Marksheet`, `Homework`, `Attendance`, `Timetable`, `School House`).
- `5` = **Student / Parent**: Read-only portal for own academic and attendance data.

## 3. Database Foreign Key Reference Rules
- **Student**: `st.id`, `st.firstname`, `st.lastname`, `st.roll_no`, `st.enrollment_no` (Never use `admission_no`).
- **Teacher**: `t.id`, `t.firstname`, `t.lastname`.
- **Marksheet**: `m.id`, `m.student_id`, `m.class_id`, `m.section_id`, `m.session`, `m.term`, `m.result`. Always default `ORDER BY m.id ASC`.
- **School House**: `sh.captain` & `sh.vice_captain` join `student`, `sh.teacher_incharge` joins `teacher`.
- **Timetable**: `class_id`, `section_id`, `subject_id`, `teacher_id`.

## 4. Route Handling Standard (Dual Handlers)
When updating or adding backend queries, update both:
1. Dedicated route: `app/api/v1/<domain>/route.ts`
2. Fallback slug route: `app/api/v1/[...slug]/route.ts`

## 5. UI Component Rules
- Initial filter dropdowns in `ListingComponent.jsx` must start empty (`""`) and default to `"Select Class"` / `"Select Section"`.
- Table must load all unfiltered records immediately on initial page mount.
- Datagrid column definitions in `<Domain>Config.jsx` must use consistent alignment (`headerAlign: "center"`, `align: "center"`).
