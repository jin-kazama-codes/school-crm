# School CRM Core Technical & Operational Skills

This document details the exact technical reference, database foreign-key mapping rules, API endpoint specifications, and frontend component conventions for developing and maintaining the School CRM platform.

---

## 1. Domain Directory Map

```
school-crm-next/
├── app/
│   ├── api/v1/                   # Route Handlers
│   │   ├── [...slug]/route.ts    # Universal fallback dispatcher
│   │   ├── marksheet/            # Marksheet CRUD & report queries
│   │   ├── school-house/         # School Houses & Captains
│   │   ├── attendance/           # Attendance recording & stats
│   │   ├── timetable/            # Class & Section Timetable
│   │   ├── homework/             # Homework assignments
│   │   ├── payment/              # Fee collections & history
│   │   ├── student/              # Student directory & profile
│   │   ├── teacher/              # Teacher records & assignments
│   │   ├── user/                 # System users & credentials
│   │   ├── school/               # Multi-tenant School registry
│   │   └── ...                   # Amenity, Bus, Class, Section, Subject, etc.
│   ├── login/page.jsx            # Authentication page
│   ├── reset-password/page.jsx   # Password recovery page
│   └── page.tsx                  # ClientApp mount
├── apis/                         # Axios client wrappers
│   ├── config/axiosConfig.jsx    # Interceptors (Headers: Type, X-Access-Token, School)
│   ├── MarksheetAPI.jsx
│   ├── SchoolHouseAPI.jsx
│   ├── AttendanceAPI.jsx
│   └── ...
├── components/
│   ├── common/
│   │   ├── Datagrid.jsx          # ServerPaginationGrid with pagination & sorting
│   │   ├── Search.jsx            # Live & debounced search input
│   │   ├── Sidebar.jsx           # Role-aware collapsible navigation sidebar
│   │   ├── TopBar.jsx            # School switcher (SuperAdmin) & profile menu
│   │   └── ViewDetailModal.jsx   # Generic drawer/modal for record detail inspection
│   └── <domain>/                 # Feature directories (marksheet, attendance, etc.)
│       ├── ListingComponent.jsx  # Grid wrapper with top filter controls
│       ├── FormComponent.jsx     # Formik create/edit interface
│       └── <Domain>Config.jsx    # Column definitions with styled renderers
├── redux/
│   ├── actions/                  # Redux dispatchers (set<Domain>s, setSchoolData)
│   ├── reducers/                 # Root & modular state stores
│   └── store.jsx                 # Redux store configuration
└── lib/
    ├── prisma.ts                 # Prisma Client singleton
    ├── utility.ts                # AES-256 encryption & token verification
    ├── apiHelpers.ts             # withAuth & rate limiter middleware
    └── crudHelpers.ts            # Generic database operations
```

---

## 2. Multi-Tenant Scoping Workflow

### SuperAdmin (`rolePriority: 1`)
- Can select **"All Schools"** (no `school_id` filter) or switch to a specific school from the Topbar.
- When querying database, if `schoolId === null`, omit the `AND school_id = ...` filter in SQL.
- When mutating global configurations (`Class`, `Section`, `Subject`, `Amenity`, `Role`, `Payment Method`), requests are scoped globally.

### School Admin & Staff (`rolePriority: 2, 3, 4, 5`)
- Locked to their assigned `school_id`.
- Request header contains encrypted `School` token.
- Every SELECT / INSERT / UPDATE / DELETE must include `school_id = ${schoolId}`.

---

## 3. Database Entity & Foreign Key Resolution Map

| UI Display Column | Source Table | Referenced Table | Join Condition & Selected Field |
| :--- | :--- | :--- | :--- |
| **Student Name** | `marksheet`, `attendance`, `payment`, `school_house` | `student` | `LEFT JOIN student st ON (st.id = m.student_id OR st.parent_id = m.student_id)`<br>`TRIM(CONCAT(st.firstname, ' ', COALESCE(st.lastname, '')))` |
| **Roll Number** | `marksheet`, `student` | `student` | `st.roll_no` (Do not query `st.admission_no`) |
| **Enrollment Number**| `student`, `marksheet` | `student` | `st.enrollment_no` |
| **Teacher Name** | `timetable`, `homework`, `school_house` | `teacher` | `LEFT JOIN teacher t ON t.id = ...`<br>`TRIM(CONCAT(t.firstname, ' ', COALESCE(t.lastname, '')))` |
| **Class Name** | `marksheet`, `timetable`, `homework`, `student` | `class` / `school_class` | `LEFT JOIN class cl ON cl.id = ...`<br>`cl.name AS class_name` |
| **Section Name** | `marksheet`, `timetable`, `homework`, `student` | `section` | `LEFT JOIN section se ON se.id = ...`<br>`se.name AS section_name` |
| **Subject Name** | `timetable`, `homework` | `subject` | `LEFT JOIN subject sub ON sub.id = ...`<br>`sub.name AS subject_name` |
| **House Captain**| `school_house` | `student` | `LEFT JOIN student cap ON (cap.id = sh.captain OR cap.parent_id = sh.captain)` |
| **Vice Captain** | `school_house` | `student` | `LEFT JOIN student vc ON (vc.id = sh.vice_captain OR vc.parent_id = sh.vice_captain)` |
| **Teacher In-Charge** | `school_house` | `teacher` | `LEFT JOIN teacher tin ON (tin.id = sh.teacher_incharge OR tin.parent_id = sh.teacher_incharge)` |

---

## 4. UI Design & Component Rules

1. **Initial Filter Dropdowns**:
   - Must initialize as `{ class_id: "", section_id: "" }` with `<option value="">Select Class</option>`.
   - Never force-select the first item on initial page render.
   - Grid must query and display all records on load without requiring user filter selection first.
2. **Datagrid Columns (`<Domain>Config.jsx`)**:
   - Must export `datagridColumns(rolePriority, ...)` function.
   - Use `headerAlign: "center"` and `align: "center"` for clean grid typography.
   - Action buttons (Edit / Delete) must be conditionally included:
     ```javascript
     ...(rolePriority !== 1 ? [{
       field: "action",
       headerName: "Action",
       headerAlign: "center",
       align: "center",
       renderCell: ({ row }) => ( ... )
     }] : [])
     ```
3. **Modal Form Patterns (`FormInModalComponent.jsx`)**:
   - Keep modal open/close state controlled from `ListingComponent.jsx`.
   - On successful submit, close modal, reload grid via `getPaginatedData(0, 10, ...)`, and reset form state.
