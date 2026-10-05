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

---

### 9.12 Form Validation Focus, Smooth Scrolling & Toast Dismissal Lifecycle (Bug #16)

**Enhancements:**
1. **Always-Visible Dustbin on Image Preview**: Uploaded image previews in [PreviewImage.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/image/PreviewImage.jsx) display a persistent dustbin (`Trash2`) icon at the top-right corner with smooth hover scaling and instant removal.
2. **Smooth Scroll & Focus on Form Validation Errors**: When submitting forms in [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), if any required field fails validation, `focusAndScrollToField(firstKey)` is invoked to smoothly center the viewport on the first invalid input and focus the cursor on it.
3. **Mandatory Crimson Rose Indicator**: All required input labels render `* (Mandatory)` styled in crimson rose (`#e05353`).
4. **Toast Blue Info Flash Fix**: In [Toast.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/common/Toast.jsx) and [Utility index.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/utility/index.jsx), prevented the empty blue info banner from flashing during toast dismissal when `toastSeverity` resets to empty.
5. **Strict Production ERP Validation**: Applied 10-digit mobile (`/^[6-9]\d{9}$/`), 12-digit Aadhaar (`/^\d{12}$/`), RFC email, enrolled subjects requirement, and 6-digit postal code validation across student, parent, and address schemas in [Validation.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/Validation.jsx).
6. **DOB & Admission Date Constraints**: Restricts student Date of Birth to a minimum of 10 years ago (`max = Today - 10 Years` in UI date picker and Yup validation test), and restricts Admission Date from selecting future dates.

---

### 9.13 Header Scoped `school_id` Integer Parsing in Prisma Queries (Bug #17)

**Problem:**
On submitting user registration or student creation (`POST /api/v1/register`), Prisma threw `PrismaClientValidationError: Argument 'school_id': Invalid value provided. Expected Int or Null, provided String.`. The UI loading overlay remained permanently mid-opaque.

**Root Cause:**
`Utility.getSchoolIdFromHeader(request)` in `lib/utility.ts` decrypted the school token string (e.g. `"1"`) and returned `{ school_id: "1" }`. Prisma schema defines `User.school_id`, `Student.school_id`, and other models as `Int?`. Passing string `"1"` in `prisma.user.create({ data: { ...payload, ...schoolCondition } })` caused validation failure.

**Fix Pattern:**
1. In [utility.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/utility.ts), parse `parseInt(decrypted_school_id, 10)` in `getSchoolIdFromHeader`, returning `{ school_id: number }`.
2. In [register/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/register/route.ts) and [user/register/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/user/register/route.ts), parse `payload.school_id` to integer if present as an extra safeguard.
3. In [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), added error handling fallback for non-success API responses to ensure loading state resets cleanly (`setLoading(false)`) and displays the error toast.

---

### 9.14 Prisma Dynamic Payload Sanitization & Glassmorphism Save Loader (Bug #18)

**Problem:**
1. On `create-student` (`POST /api/v1/create-student`), Prisma threw validation errors:
   - `Failed to parse empty string. Expected decimal String` on empty Decimal fields (`guardian_contact_no: ""`, `guardian_aadhar: ""`).
   - String integer fields (`section: "1"`, `waived_fees: "15000"`) and non-existent model payload fields (`age: ""`, `password`, `bus`) caused validation failures.
2. The UI displayed a plain opaque overlay without a visible animated loader, and the Save button lacked a loading state with "Saving..." text.

**Root Cause:**
`genericCreate` in `lib/crudHelpers.ts` did not sanitize input types or filter model columns for models not in `MODEL_ALLOWED_FIELDS`. Empty strings were passed directly to `Decimal?`, `Int?`, and `DateTime?` columns in Prisma.

**Fix Pattern:**
1. In [crudHelpers.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/crudHelpers.ts):
   - Implemented schema-aware field definitions (`STATIC_MODEL_FIELDS` merged with dynamic `Prisma.dmmf`).
   - `sanitizePayload`: Strips columns not in the target Prisma model, parses string numbers to `Int`/`Float`, converts empty strings `""` to `null` for `Int`, `Float`, `Decimal`, and `DateTime` columns, and converts boolean representations.
2. In [Loader.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/common/Loader.jsx): Built a sleek, glassmorphic loader with dual-ring spinning gradients and customizable title/subtext.
3. In [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx): Added spinning `Loader2` and `"Saving..."` / `"Updating..."` indicator on the Save/Update button and linked the backdrop loader card.
4. In [StudentFormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/StudentFormComponent.jsx): Converted Mother, Father, and Guardian Contact (`maxLength={10}`) and Aadhaar (`maxLength={12}`) inputs from `type="number"` to `type="text"` to match the student basic details form and preserve exact string formatting for validation.

---

### 9.15 Form Submit Disabled State & Multi-Section State Sync (Bug #19)

**Problem:**
When a validation error occurred and the user corrected the invalid field, the "Save Student" button remained disabled, preventing form submission.

**Root Cause:**
1. The submit button evaluated `disabled={!dirty || submitted || loading}`. When child forms reinitialized (e.g. dropdown options loaded) or when a validation error returned early without resetting `submitted`, `!dirty` or `submitted` kept the button disabled.
2. `handleFormChange` used object spread over existing state (`setFormData({ ...formData, [formKey]: data })`), which could cause race conditions or stale state captures when multiple child forms dispatched validation states simultaneously.

**Fix Pattern:**
1. In [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), updated the submit button disabled state to `disabled={loading}` so the button is always interactive and allows immediate re-validation on click.
2. Used functional state updates in `handleFormChange` (`setFormData(prev => ({ ...prev, [formKey]: data }))`) to guarantee consistent state across student, address, and media sections.
3. Ensured `setSubmitted(false)` is explicitly reset if validation errors are detected during `handleSubmit`.

---

### 9.16 Direct Form Dispatch & Atomic Payload Assembly (Bug #20)

**Problem:**
Clicking "Save Student" did nothing after form validation passed.

**Root Cause:**
`handleSubmit` previously set `submitted = true` and relied on an asynchronous `useEffect` that checked `if (formValidated)`. Because child formik states update asynchronously, `formValidated` was still evaluated as `false` on the initial `submitted` state flip, causing the `useEffect` to immediately reset `submitted = false` and abort the submission flow.

**Fix Pattern:**
1. In [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), `handleSubmit` directly extracts current form values from child refs (`studentFormRef.current?.formik.values`, `addressFormRef.current?.formik.values`, `imageFormRef.current?.formik.values`) and triggers `createStudent(payloadData)` / `updateStudentAndAddress(payloadData)` immediately without waiting for deferred `useEffect` cycles.
2. In [ImagePicker.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/image/ImagePicker.jsx), exposed `formik` and `validate` in `useImperativeHandle`.

---

### 9.17 Prisma Enum Mapping for BloodGroup and Hyphenated Identifiers (Bug #21)

**Problem:**
On student creation, Prisma threw `Invalid value for argument blood_group. Expected BloodGroup.` when given `"B+"`.

**Root Cause:**
In Prisma schema, `BloodGroup` enum members are defined as `A_POS @map("A+")`, `B_POS @map("B+")`, etc. The Prisma Client runtime queries require the enum key (`"B_POS"`), whereas the HTML UI options send standard strings (`"B+"`).

**Fix Pattern:**
1. In [crudHelpers.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/crudHelpers.ts), introduced `ENUM_VALUE_MAPPINGS` in `sanitizePayload` to automatically map `"B+"` -> `"B_POS"`, `"A+"` -> `"A_POS"`, `"co-ed"` -> `"co_ed"`, `"senior-sec"` -> `"senior_sec"`, `"sub-admin"` -> `"sub_admin"`, etc.
2. In [StudentFormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/StudentFormComponent.jsx), normalized backend `A_POS` / `B_POS` back to `"A+"` / `"B+"` when initializing `updatedValues` for edit mode.

---

### 9.18 Supabase Storage Upload Naming & Student Roll/Enrollment Number Generation (Bug #22)

**Problem:**
1. Image uploads failed with `{"status":"Error","msg":"Endpoint upload-image-s3 not found"}` because routes were under `/api/v1/image/...` while frontend called `/api/v1/upload-image-s3`. AWS S3 was removed and replaced with Supabase Storage, requiring function naming cleanup to avoid confusion.
2. In Supabase `student` table, `roll_no`, `enrollment_no`, and `head` were not saved or were null/empty.

**Root Cause:**
1. Frontend API helper used `uploadImageToS3` calling the old endpoint. Next.js route handlers needed `/api/v1/upload-image` and `/api/v1/upload-image-s3` pointing to Supabase Storage client (`supabaseAdmin.storage`).
2. `roll_no` and `enrollment_no` were not generated automatically on student creation if omitted from frontend payload, and `head` was not defaulting to `0`.

**Fix Pattern:**
1. In [apis/ImageAPI.jsx](file:///d:/School%20CRM%20Project/school-crm-next/apis/ImageAPI.jsx): Renamed/standardized upload method to `uploadImageToSupabase` (with backward compatibility aliases `uploadImageToS3` and `uploadImage`) uploading to `/upload-image` (resolved to `/api/v1/upload-image`).
2. In [app/api/v1/upload-image/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/upload-image/route.ts) and [app/api/v1/upload-image-s3/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/upload-image-s3/route.ts): Direct zero-overhead upload to configured `SUPABASE_STORAGE_BUCKET` via `supabaseAdmin.storage.from(BUCKET).upload(...)` and returned public URL.
3. In [lib/crudHelpers.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/crudHelpers.ts):
   - In `genericCreate` for `student`:
     - Defaulted `head` to `0` if undefined/null.
     - Generated sequential `roll_no` for `(school_id, class, section)` starting from 1.
     - Generated sequential `enrollment_no` composed of Academic Session Year prefix (e.g. `2025` from `"2025-2026"`) + 4 sequential digits (e.g. `20250001`).
4. In [components/student/FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), [components/teacher/FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/teacher/FormComponent.jsx), [components/school/FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/school/FormComponent.jsx), and [components/attendance/FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/attendance/FormComponent.jsx): Replaced `uploadImageToS3` with `uploadImageToSupabase` and ensured all upload promises are properly resolved via `Promise.all`.

---

### 9.19 Login Form Validation & Whitespace Sanitization (Bug #23)

**Problem:**
When attempting to log in with valid credentials containing leading/trailing whitespace, login failed with "User does not exist" or "Username and Password do not match". There was no strict validation schema enforcing email and password complexity rules on the login form.

**Root Cause:**
1. [Login.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/login/Login.jsx) did not have a Formik `validationSchema` attached, allowing invalid/untrimmed strings to be dispatched directly.
2. In [app/api/v1/login/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/login/route.ts) and [app/api/v1/user/login/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/user/login/route.ts), database user search was performed without trimming and without case-insensitive mode (`mode: 'insensitive'`).

**Fix Pattern:**
1. In [components/login/Validation.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/login/Validation.jsx): Created `loginSchema` and `forgotPasswordSchema` using Yup:
   - `email`: Required, trimmed, valid email format.
   - `password`: Required, trimmed, 8–20 chars, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
2. In [components/login/Login.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/login/Login.jsx):
   - Attached `loginSchema` to `<Formik>`.
   - Trimmed inputs on both `onBlur` and `onSubmit`.
   - Updated button disabled state to `disabled={loading}`.
3. In [components/login/ForgetPw.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/login/ForgetPw.jsx):
   - Attached `forgotPasswordSchema` to `<Formik>` and trimmed email on blur and submit.
4. In [app/api/v1/login/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/login/route.ts) and [app/api/v1/user/login/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/user/login/route.ts):
   - Trimmed `email`, `contact_no`, and `password`.
   - Added case-insensitive matching (`mode: "insensitive"`) for email and username lookups.
   - Enhanced password comparison to check trimmed password with fallback to raw payload password.

---

### 9.20 Address school_id & parent_id Resolution and Decimal Contact Sanitization (Bug #24)

**Problem:**
1. When creating a student, two address records are created (one for the parent `user` and one for the `student`). Both address records had `school_id` saved as `NULL`, and the student address had `parent_id` saved as `NULL`.
2. Parent/Guardian contact numbers and Aadhaar numbers (`mother_contact_no`, `father_contact_no`, `mother_aadhar`, `father_aadhar`, `guardian_contact_no`, `guardian_aadhar`) were getting stored/displayed with floating points (e.g. `8956230231.000000000000`).

**Root Cause:**
1. `address` was omitted from `MODELS_WITH_SCHOOL_ID` in `lib/crudHelpers.ts`, preventing backend auto-scoping from attaching `school_id`.
2. `/api/v1/create-student` and `/api/v1/register` returned simple success strings or incomplete payloads instead of `{ id, school_id }`, leading to `undefined` IDs during subsequent address creation calls.
3. In `prisma/schema.prisma`, `mother_contact_no`, `father_contact_no`, etc., are defined as `Decimal?`. PostgreSQL's default `numeric` representation pads trailing decimal zeros unless truncated before storage and formatted when loaded in the UI.

**Fix Pattern:**
1. In [lib/crudHelpers.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/crudHelpers.ts):
   - Added `"address"` to `MODELS_WITH_SCHOOL_ID`.
   - In `genericCreate`, returned `{ id: record.id, school_id: record.school_id }` when `returnId = true`.
   - In `sanitizePayload`, stripped trailing decimal places for fields ending with `_contact_no`, `_aadhar`, or `_no` before Prisma Decimal serialization (`strVal.replace(/\..*$/, "")`).
2. In [app/api/v1/[...slug]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/[...slug]/route.ts): Set `returnId: true` for `create-` endpoints.
3. In [app/api/v1/register/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/register/route.ts): Returned `{ token, id: user.id, school_id: user.school_id }`.
4. In [components/student/FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx): Passed resolved `school_id` and correct `parent_id` (`userId` for `parent: 'user'` and `studentId` for `parent: 'student'`).
5. In [components/student/StudentFormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/StudentFormComponent.jsx): Added regex/split normalization in `updatedValues` `useEffect` to strip trailing `.000000` when loading existing student records into form inputs.

---

### 9.21 Official Student Register Dossier Modal (Feature & UI Elevation)

**Implementation:**
1. Created [StudentDossierModal.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/StudentDossierModal.jsx) to replace the generic `ViewDetailModal` for students with a production-grade Student Register Dossier.
2. Included official school letterhead header (School Name, Code, Crest, Academic Session), dual portrait toggle (Student & Parent photos), Enrollment Matrix (Enrollment #, Roll #, Admission Date), and 5 structured tabs:
   - **Identity & Register**: Full legal name, DOB, exact age, gender, blood group, Aadhaar, nationality, religion, caste, identification mark, disability status.
   - **Academics & House**: Class, section, session, school house, bus transport route, enrolled subjects chips.
   - **Parents & Guardians**: Father, mother, and guardian cards with contact numbers, Aadhaar, and portal user link.
   - **Address & Contact**: Formatted residential address with interactive Google Maps link and emergency contact.
   - **Fees & Concessions**: Concession category (Partial/Full/None) and waived amount.
4. Fixed enum deserialization for `image.type = 'parent'` across all image GET endpoints:
   - In [app/api/v1/[...slug]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/[...slug]/route.ts), [app/api/v1/image/get-image/[parent]/[parent_id]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/image/get-image/[parent]/[parent_id]/route.ts), and [app/api/v1/image/get-image/[parent]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/image/get-image/[parent]/route.ts), converted image retrieval queries to raw parameterized SQL with `type::text` and `parent::text`. This completely eliminates `Value 'parent' not found in enum 'ImageType'` runtime errors from Prisma Client.

---

### 9.22 PreviewImage & ImagePicker updatedImage Single Object vs Array Handling (Bug #22)

**Problem:**
Navigating to student update page `/student/update/:id` caused Next.js to crash with `Runtime TypeError: updatedImage.map is not a function` at `PreviewImage.useEffect (components/image/PreviewImage.jsx:36:26)`.

**Root Cause:**
When fetching student and parent images via `/get-image/student/:id` and `/get-image/parent/:id`, the API returns a single image object `{ id, image_src: "...", ... }` rather than an array. In [PreviewImage.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/image/PreviewImage.jsx), `updatedImage.map` was called directly assuming `updatedImage` was always an Array.

**Fix Pattern:**
1. In [PreviewImage.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/image/PreviewImage.jsx), added `getOldImageList(raw)` helper that safely normalizes `updatedImage` into an array whether it is passed as a single object `{ image_src: "..." }`, an array, or `null`.
2. In [ImagePicker.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/image/ImagePicker.jsx), updated `hasOldImage` detection and `setInitialState` to support both single object and array `updatedImage`.
3. In [FormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/FormComponent.jsx), normalized `studentImg` and `parentImg` to arrays during `populateStudentData`.

---

### 9.23 Controlled Input Null & Undefined Defaults Normalization (Bug #23)

**Problem:**
When opening `/student/update/:id`, React logged console errors:
`StudentFormComponent.jsx:1226 'value' prop on 'input' should not be null. Consider using an empty string to clear the component or 'undefined' for uncontrolled components.`
and `A component is changing a controlled input to be uncontrolled.`

**Root Cause:**
Database columns in PostgreSQL that have `NULL` values (e.g., `guardian_name: null`, `guardian_contact_no: null`, `guardian_aadhar: null`, `birth_mark: null`, etc.) were directly copied into Formik's state when applying `updatedValues`. Passing `value={formik.values.guardian_contact_no}` with `null` caused React to warn about null input values and controlled-to-uncontrolled transitions.

**Fix Pattern:**
1. In [StudentFormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/student/StudentFormComponent.jsx), merged `updatedValues` over `initialValues` and iterated over all keys to ensure non-date properties default to empty strings (`""`), booleans (`false`), numbers (`0`), or arrays (`[]`).
2. In [AddressFormComponent.jsx](file:///d:/School%20CRM%20Project/school-crm-next/components/address/AddressFormComponent.jsx), normalized `updatedValues` with `initialValues` so `street`, `landmark`, `zipcode`, `state`, and `city` never pass `null` to input/select elements.

---

### 9.24 Supabase Pooler Idle Connection Socket Drop & P1001 Error (Bug #24)

**Problem:**
After being logged out or idle for a few minutes, logging back in failed with `Error [PrismaClientKnownRequestError]: Can't reach database server at aws-0-ap-south-1.pooler.supabase.com (P1001 / DatabaseNotReachable)`.

**Root Cause:**
Supabase's PgBouncer transaction pooler (port 6543) terminates idle client sockets after several minutes of inactivity. When Next.js dev server reuses a stale connection from Node's `pg.Pool`, the TCP socket is already closed upstream, resulting in a ~12s connection timeout.

**Fix Pattern:**
1. In [prisma.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/prisma.ts), configured `pg.Pool` with `keepAlive: true`, `keepAliveInitialDelayMillis: 10000`, aggressive idle reaper `idleTimeoutMillis: 20000`, `connectionTimeoutMillis: 10000`, and an error listener on the pool to cleanly discard severed idle sockets without failing incoming login/API requests.

---

### 9.25 `delete-image` Endpoint Implementation & `updated_by` User Tracking (Bug #25)

**Problem:**
1. When updating a student with new or deleted photos, `DELETE /api/v1/delete-image` failed with `404 Not Found (Endpoint delete-image not found)`.
2. When updating student, user, or address records, `updated_by` field remained `null` in the database.

**Root Cause:**
1. The DELETE handler in `app/api/v1/[...slug]/route.ts` only handled specific mapping endpoints and lacked a route branch for `delete-image`.
2. `getAuthUserId(req)` was missing in slug route handlers, causing `userId` to fallback to default `1` or `null` when parsing authorization headers with or without `"Bearer "` prefix. `genericCreate` and `genericUpdate` also didn't guarantee `updated_by` assignment on record creation and modification.

**Fix Pattern:**
1. Created dedicated [delete-image/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/delete-image/route.ts) and added `delete-image` handler in [[...slug]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/[...slug]/route.ts) executing parameterized raw queries with `CAST($1::text AS "public"."ImageParent")` supporting single strings and string arrays.
2. Implemented `getAuthUserId(req)` in [[...slug]/route.ts](file:///d:/School%20CRM%20Project/school-crm-next/app/api/v1/[...slug]/route.ts) to accurately decode user IDs from `x-access-token` / `authorization` JWT tokens.
3. In [crudHelpers.ts](file:///d:/School%20CRM%20Project/school-crm-next/lib/crudHelpers.ts), updated `genericCreate` and `genericUpdate` to automatically populate `updated_by` with the authenticated user ID across all models.










