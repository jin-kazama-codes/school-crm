# School CRM Next.js - Agent Architecture & Engineering Standards

## 1. System Overview & Core Philosophy
This repository is a **unified, multi-tenant School Management System & CRM** built on **Next.js 15+ (App Router with Turbopack)**, **PostgreSQL (Supabase)**, **Prisma ORM**, **Redux**, and **Tailwind CSS**.

- **Frontend & Backend in One App**: Full-stack Next.js where API routes live under `app/api/v1/` and UI components live under `components/`.
- **Multi-Tenant Scoping**: All operational entities (`student`, `teacher`, `employee`, `marksheet`, `timetable`, `homework`, `payment`, `attendance`, `noticeboard`, `school_house`, `school_duration`, `bus`, `holiday`) belong to a `school_id`.
- **Role-Based Access Control (RBAC)**: Enforced via `rolePriority` (1 to 5) across both UI navigation and API layers.

---

## 2. Role Priority & Hierarchy (1 to 5)

| Role Priority | Role Name | Scope & Capabilities | UI Permissions |
| :--- | :--- | :--- | :--- |
| **`1`** | **SuperAdmin** | System owner. Cross-school visibility. Can switch between schools or select "All Schools". Full access to global system configurations (`Class`, `Section`, `Subject`, `Amenity`, `Payment Method`, `Role`, `School`). | Sees "Configurations" menu in Sidebar. Read/write on all schools & global configs. Action buttons on school-level operational rows hidden if `rolePriority === 1` to prevent cross-tenant mutation mistakes. |
| **`2`** | **School Admin** | Head of a specific School. Full management within their assigned school. | Full CRUD on students, teachers, staff, fees, marksheets, timetable, homework, etc. Cannot access global configurations. |
| **`3`** | **Sub Admin** | School administrative staff. | CRUD on operational modules (`User`, `Teacher`, `Employee`, `Bus`, `Notice Board`, `Payment`, `ID Cards`). |
| **`4`** | **Teacher** | Teaching staff. | Access to `Marksheet`, `Attendance`, `Homework`, `Time Table`, `School Duration`, `School House`. Cannot modify school fees or staff. |
| **`5`** | **Student / Guardian** | End users (Students / Parents). | Read-only access to own profile, marksheet, homework, attendance, holidays, notices. |

---

## 3. Multi-Tenant Architecture & Header Flow

1. **Client Storage (`localStorage`)**:
   - `auth`: Stored user credentials, JWT token, role, `rolePriority`, assigned `school_id` / `school_name`.
   - `schoolInfo`: Stored active school context `{ id, name, encrypted_id, vect }` for SuperAdmin or assigned school for school admin.
2. **Request Interceptor (`apis/config/axiosConfig.jsx`)**:
   - `Type`: Defaults to `"school-admin"`.
   - `X-Access-Token`: Contains the JWT Bearer token.
   - `School`: Contains JSON string of `{ encrypted_id, vect }` (AES-256-CBC encrypted).
3. **Backend Scoping (`lib/utility.ts` & `lib/apiHelpers.ts`)**:
   - `Utility.getSchoolIdFromHeader(req)` decrypts the `School` header to extract `school_id`.
   - For SuperAdmin with no school selected ("All Schools"), `school_id` is `null`, and queries return global data across schools.
   - For all other roles or when a school is selected, queries MUST append `AND school_id = ${schoolId}` or `where: { school_id: schoolId }`.

---

## 4. API Layer Structure & Dual-Routing Standard

The backend has a **dual-routing design**:
1. **Dedicated Route Handlers** (Primary):
   - `app/api/v1/marksheet/route.ts`
   - `app/api/v1/school-house/route.ts`
   - `app/api/v1/attendance/route.ts`
   - `app/api/v1/timetable/route.ts`
   - `app/api/v1/homework/route.ts`
   - `app/api/v1/payment/route.ts`
   - `app/api/v1/student/route.ts`
   - `app/api/v1/teacher/route.ts`
   - etc.
2. **Universal Slug Router** (Fallback):
   - `app/api/v1/[...slug]/route.ts` handles legacy Express endpoint mappings (e.g. `/get-marksheet`, `/get-school-houses`, `/get-attendances`, `/create-marksheet`, `/update-marksheet`).

> [!IMPORTANT]
> Whenever you modify, enrich, or fix an API query, **ALWAYS update BOTH** the dedicated route handler (`app/api/v1/<domain>/route.ts`) AND the fallback slug handler (`app/api/v1/[...slug]/route.ts`).

---

## 5. Database Schema & Query Rules (`prisma/schema.prisma`)

### Exact Field Name Mapping (Crucial: Avoid 42703 SQL Errors)
- **`student` table**:
  - Primary Key: `id`
  - Name: `firstname`, `lastname` (Concatenate: `CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))`)
  - Identifiers: `roll_no`, `enrollment_no` (**DO NOT** use `admission_no` — it does not exist!)
  - Foreign Keys: `school_id`, `parent_id`, `class` (`Int`), `section` (`Int`)
- **`teacher` table**:
  - Primary Key: `id`
  - Name: `firstname`, `lastname`
  - Foreign Keys: `school_id`, `parent_id`, `class`
- **`marksheet` table**:
  - Fields: `id`, `school_id`, `student_id`, `class_id`, `section_id`, `session`, `term`, `result`
  - Order: Default `ORDER BY m.id ASC` for proper sequential record matching.
- **`school_house` table**:
  - Fields: `id`, `school_id`, `name`, `captain` (`student_id`), `vice_captain` (`student_id`), `teacher_incharge` (`teacher_id`), `description`, `color`
- **`timetable` table**:
  - Fields: `id`, `school_id`, `class_id`, `section_id`, `subject_id`, `teacher_id`, `day`, `period`, `start_time`, `end_time`
- **`attendance` table**:
  - Fields: `id`, `school_id`, `parent_id` (student ID or teacher ID), `parent` (`'student'` or `'teacher'`), `date`, `status` (`'present'`, `'absent'`, `'half-day'`, `'leave'`)

### SQL Enrichment Pattern for Foreign Keys
When querying tables containing foreign IDs, always use raw SQL with LEFT JOINs to return resolved human-readable names:
```sql
SELECT 
  m.*,
  COALESCE(NULLIF(TRIM(CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))), ''), NULLIF(TRIM(st.firstname), ''), CONCAT('Student #', m.student_id)) AS student_name,
  st.roll_no,
  st.enrollment_no,
  cl.name AS class_name,
  se.name AS section_name,
  COUNT(*) OVER() AS count
FROM marksheet m
LEFT JOIN student st ON (st.id = m.student_id OR (m.student_id IS NOT NULL AND st.parent_id = m.student_id))
LEFT JOIN class cl ON cl.id = m.class_id
LEFT JOIN section se ON se.id = m.section_id
WHERE 1=1
  ${schoolClause}
  ${classClause}
  ${sectionClause}
ORDER BY m.id ASC
LIMIT ${limit} OFFSET ${offset}
```

---

## 6. Frontend Component Architecture & Standards

Every domain under `components/<domain>/` consists of:
1. **`ListingComponent.jsx`**:
   - Manages table state, server pagination, filters, search flag, and modal open states.
   - Initial filter dropdowns (e.g. Class, Section) **must default to empty** (`""`) displaying `"Select Class"` / `"Select Section"`, and initial data fetch must load all un-filtered records without waiting for user selection.
   - Always connect with `ServerPaginationGrid` from `../common/Datagrid`.
2. **`FormComponent.jsx` / `FormInModalComponent.jsx`**:
   - Uses Formik + Yup schema validation.
   - Dispatches create or update actions through Redux / API layer.
3. **`<Domain>Config.jsx`**:
   - Exports `datagridColumns(rolePriority, ...)` returning DataGrid columns.
   - Column alignment: Headers and cell data must be cleanly aligned (using `headerAlign: "center"` and `align: "center"` or matching left/right layout).
   - Safe Fallback: Always use optional chaining and fallback text (e.g. `row?.student_name || `Student #${row?.student_id}``).

---

## 7. Redux State Management Patterns

- **Redux Actions**: Located in `redux/actions/<Domain>Action.jsx`.
- **Redux Reducers**: Located in `redux/reducers/<Domain>Reducer.jsx`.
- Standard action shapes:
  - `set<Domain>s(payload)` -> Sets `{ count, rows }` into `listData` and turns `loading: false`.
  - `setLoading(boolean)` -> Controls spinner during async fetch.
- All API client calls go through `apis/<Domain>API.jsx`.

---

## 8. Development & Modification Rules

1. **Do Not Delete or Overwrite Unrelated Business Logic**:
   - Preserve existing form inputs, dropdown selectors, action buttons, and modal dialogs.
2. **Preserve TypeScript & Next.js 15+ Async Signatures**:
   - Next.js 15+ route params are Promises: `{ params }: { params: Promise<{ id: string }> }` -> `const { id } = await params;`.
3. **Do Not Hardcode `NEXT_PUBLIC_BASE_URL`**:
   - Leave `NEXT_PUBLIC_BASE_URL=` empty in `.env.local` so Axios dynamically makes relative `/api/v1` requests from PC (`localhost:3000`) and mobile LAN (`192.168.x.x:3000`).
4. **Rich & Polished Aesthetics**:
   - Dark mode support (`dark:` classes).
   - Clean spacing, rounded corners (`rounded-2xl`), badges with soft backgrounds, and Lucide icons.

---

## 9. Recurring Logic Bug Patterns (Debugging Reference)

These are known, system-wide patterns that have caused bugs in this codebase. Always check these when modifying related code.

### 9.1 Formik `isSubmitting` Race Condition (Bug #13 — Fixed Across All FormComponents)
**Pattern (WRONG):**
```js
validated: formik.isSubmitting ? Object.keys(formik.errors).length === 0 : false
```
**Why it fails:** Formik sets `isSubmitting = false` *asynchronously* after `onSubmit` resolves. By the time `watchForm()` (which IS the `onSubmit` callback) reads `isSubmitting`, it's already `false`, so `validated` is always `false`. The parent `FormComponent` never sees a successful submit.

**Correct pattern:**
```js
validated: Object.keys(formik.errors).length === 0
```
> Applied to all `*FormComponent.jsx` files under `components/`. When creating new form components, always use the correct pattern.

---

### 9.2 API Body Array Index Misalignment (Bug #8 — slug router)
When `insertIntoMappingTable` sends a positional array `[school_id, class_id, section_id, subject_ids, class_fee, class_capacity, late_fee, late_fee_duration]`, the receiving route handler MUST parse indices in the **same order**. Use named keys (`??` fallback to positional) to be explicit:
```ts
const class_id       = body.class_id       ?? body[1];
const section_id     = body.section_id     ?? body[2];
const subject_ids    = body.subject_ids    ?? body[3];
const class_fee      = body.class_fee      ?? body[4];
const class_capacity = body.class_capacity ?? body[5];
const late_fee       = body.late_fee       ?? body[6];
const late_fee_duration = body.late_fee_duration ?? body[7];
```

---

### 9.3 `Promise.all` Missing on Nested Async Maps (Bug #4)
Pattern to avoid:
```js
// WRONG: inner async map is not awaited — inserts fire after navigation
outerArray.map((inner) => {
    inner.map(async (item) => { await apiCall(item); });
});
```
Correct:
```js
// CORRECT: all inserts awaited before Promise.all resolves
outerArray.map(async (inner) => {
    await Promise.all(inner.map(async (item) => { await apiCall(item); }));
});
```

---

### 9.4 Null `status` Leaves Loading Spinner Stuck (Bug #5)
In `updateImageAndClassData` (and similar update flows): if no image operation branch runs, `status` remains `null` and the success toast + `setLoading(false)` are never called, leaving the UI stuck.
**Fix:** Always resolve loading state — use `if (status || !anyImageOpPending)` or unconditionally call `setLoading(false)` after all awaited operations complete.

---

### 9.5 `rolePriority` vs `role` in Auth Checks (Bug #11)
- `auth.role` = FK integer pointing to the `user_role` table row. **Not** the priority.
- `auth.rolePriority` = the actual numeric priority (1=SuperAdmin, 2=SchoolAdmin, …).
- **Always compare `rolePriority`** when checking "is this user a SuperAdmin?":
  ```js
  getLocalStorage("auth")?.rolePriority === 1  // ✓ correct
  getLocalStorage("auth")?.role === 1           // ✗ wrong — role is a FK
  ```

---

### 9.6 `get-school-houses` (and similar enriched endpoints) Missing 404 Return (Bug #9)
When an enriched raw-SQL endpoint returns zero rows, it **must explicitly `return` a 404 response**. Without the explicit `return`, execution falls through to the generic `get-*` MODEL_MAPPING handler, which runs a plain Prisma query without JOINs, returning un-enriched data silently.

---

### 9.7 `verifyToken` Passthrough Security Hole (Bug #12)
The original code returned `{ userId: 0 }` (valid auth!) for any non-`school-admin`/`school-mobile` `type` header — including missing or custom headers. This allowed unauthenticated requests to pass `withAuth`.
**Fix:** Only permit passthrough when **no token is present** AND `type` is not `school-admin`. If a token IS present, always validate it regardless of `type`.

---

### 9.8 Staging-Row Array Index Drift (Bug #1) — `SchoolFormComponent`
In the "Add New Class" staging panel, fee/capacity/duration fields must write to `formik.values.classes.length` **at render time** (the snapshot before the class dropdown fires). Using `someArray.length` as the write index is wrong because `someArray` has a different length than `classes` after the class-select fires.
**Rule:** All staging-row fields share the same index: `formik.values.classes.length` (the current pre-add length, stable at render time).

---

### 9.9 "Same Subjects" Reset Scope (Bug #3)
When unchecking "Same Subjects For All Sections", only reset `subjects[currentIndex]` — not all class indices > 0. Wiping all subsequent classes was destructive in multi-class forms.
```js
// WRONG: wipes all classes beyond first
noSubArr.map((arr, i) => { if (i > 0) noSubArr[i] = []; });

// CORRECT: only resets the current class index
noSubArr[index] = noSubArr[index] ? [noSubArr[index][0]] : [];
```

---

### 9.10 `decrypt-text` / `encrypt-text` API Body Contract (Bug #14)

**`CommonAPI.decryptText(fields)`** sends Axios request with `data: fields` where `fields = { encrypted_id, vect }`.
The HTTP body therefore arrives at the server as `{ encrypted_id, vect }` — **no `.data` wrapper**.

**WRONG** (old handler):
```ts
body.data?.encrypted_id  // always undefined — crashes Buffer.from(undefined)
body.data?.vect
```

**CORRECT** (fixed handler):
```ts
const encrypted_id = body.encrypted_id ?? body.data?.encrypted_id;
const vect         = body.vect         ?? body.data?.vect;
```

**`CommonAPI.encryptText({ data: schoolId })`** sends `body = { data: schoolId }`. The handler reads `body.data` which is the school ID — a primitive number. Do NOT `JSON.stringify` primitives; use `String(raw)` so the decrypt round-trip returns a plain string without extra quotes.

**School selection flow (SuperAdmin):**
1. `handleSelectSchool(school)` → `encryptText({ data: school.id })` → backend returns `{ encrypted_id, vect }`
2. `setLocalStorage("schoolInfo", { encrypted_id, vect })` (saved via `JSON.stringify`)
3. Page reload → `getLocalStorage("schoolInfo")` → returns parsed `{ encrypted_id, vect }`
4. `axiosConfig` interceptor: `School = JSON.stringify({ encrypted_id, vect })` on every API request
5. Backend `getSchoolIdFromHeader`: `JSON.parse(schoolHeader)` → `decryptText(encrypted_id, vect)` → scoped `school_id`
6. Topbar display: `decryptText({ encrypted_id, vect })` → backend decrypts → returns school ID → find school in list

> **Note**: `getLocalStorage` returns the already-parsed JSON object (not a string). Do NOT double-parse.

---

### 9.11 DataGrid Server-Side Filtering & Pagination Synchronization (Bug #15)

**Problem:**
In paginated tables, applying a column filter or table quick-search on page 1 only filtered the 10 rows loaded in memory. If matching records existed on page 2 (e.g. a `sub-admin` user), the column filter showed "No User Records" on page 1 until the user navigated to page 2 and reapplied the filter.

**Root Cause:**
`Datagrid.jsx` executed `smartMatchText` on the client-side `rows` prop without notifying the server or triggering a query with the search/filter parameters.

**Fix Pattern:**
1. Derive an `activeSearchQuery` from applied `columnFilters` and `tableSearch`.
2. When a filter or quick-search is applied or changed, reset `paginationModel.page` to `0`.
3. In `useEffect`, pass `activeSearchQuery` to `getQuery(page, size, action, api, condition, activeSearchQuery)`.
4. The server-side API (e.g. `get-users` or `genericList`) queries all matching rows in the database across all pages with total `count` and returns the paginated results for page 1.

