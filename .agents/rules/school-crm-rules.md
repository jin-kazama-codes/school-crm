# School CRM Engineering Rules & Constraints

## Rule 1: Multi-Tenant Scoping
- Always scope database queries by `school_id` when `school_id` is present in the decrypted request header.
- For SuperAdmin (`rolePriority: 1`) with "All Schools", omit the `school_id` filter to allow cross-school aggregation.

## Rule 2: Dual Route Handler Updates
- Whenever an API endpoint is added or modified, update both:
  1. `app/api/v1/<domain>/route.ts`
  2. `app/api/v1/[...slug]/route.ts`

## Rule 3: Database Schema Naming Integrity
- Never guess column names. Verify in `prisma/schema.prisma`.
- The `student` table uses `roll_no` and `enrollment_no` (there is no `admission_no`).
- Always use `CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))` for full names.

## Rule 4: Frontend Filter Dropdown Standards
- In `ListingComponent.jsx`, initial filter state must be `{ class_id: "", section_id: "" }`.
- Default option must be `"Select Class"` / `"Select Section"` with `value=""`.
- Never force-select the first item on initial page render.
- All unfiltered records must load immediately on page mount.

## Rule 5: Preservation of Business Logic
- Never remove existing Formik form fields, Redux actions, or validation schemas unless explicitly requested.
- Preserve role-based action buttons (`rolePriority !== 1`).
