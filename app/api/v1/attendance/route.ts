import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

/**
 * GET /api/v1/attendance
 *
 * Enriched attendance query with joined student/teacher/employee names, class, and section.
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const search = (searchParams.get("search") || "").trim();
  const parent = searchParams.get("parent");
  const parentId = searchParams.get("parentId") || searchParams.get("parent_id");
  const classId = searchParams.get("classId") || searchParams.get("class_id");
  const sectionId = searchParams.get("sectionId") || searchParams.get("section_id");
  const status = searchParams.get("status");

  const { limit, offset } = Utility.getPagination(page, size);

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = searchParams.get("school_id")
    ? parseInt(searchParams.get("school_id")!, 10)
    : (schoolCond.school_id ? parseInt(String(schoolCond.school_id), 10) : null);

  try {
    let scopedParent = parent;
    let scopedParentId = parentId ? parseInt(parentId, 10) : null;

    if (userId > 0) {
      const authUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (authUser?.role === 6) {
        const studentRec = await prisma.student.findFirst({
          where: { user_id: userId },
          select: { id: true },
        });
        if (studentRec) {
          scopedParent = "student";
          scopedParentId = studentRec.id;
        }
      }
    }

    const searchWild = `%${search}%`;
    const schoolClause = schoolId ? Prisma.sql`AND a.school_id = ${schoolId}` : Prisma.sql``;
    const parentClause = scopedParent ? Prisma.sql`AND LOWER(a.parent::text) = LOWER(${scopedParent})` : Prisma.sql``;
    const parentIdClause = scopedParentId ? Prisma.sql`AND a.parent_id = ${scopedParentId}` : Prisma.sql``;
    const classClause = classId ? Prisma.sql`AND a.class_id = ${parseInt(classId, 10)}` : Prisma.sql``;
    const sectionClause = sectionId ? Prisma.sql`AND a.section_id = ${parseInt(sectionId, 10)}` : Prisma.sql``;
    const statusClause = status ? Prisma.sql`AND LOWER(a.status::text) = LOWER(${status})` : Prisma.sql``;
    const searchClause = search
      ? Prisma.sql`AND (
          st.firstname ILIKE ${searchWild} OR st.lastname ILIKE ${searchWild} OR
          tc.firstname ILIKE ${searchWild} OR tc.lastname ILIKE ${searchWild} OR
          em.firstname ILIKE ${searchWild} OR em.lastname ILIKE ${searchWild} OR
          cl.name ILIKE ${searchWild} OR se.name ILIKE ${searchWild} OR
          a.status::text ILIKE ${searchWild} OR a.parent::text ILIKE ${searchWild}
        )`
      : Prisma.sql``;

    let rows: any[];
    try {
      rows = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT
          a.id,
          a.school_id,
          a.parent::text AS parent,
          a.parent_id,
          a.class_id,
          a.section_id,
          a.date,
          a.status::text AS status,
          a.remark,
          a.created_at,
          COALESCE(
            CASE 
              WHEN a.parent = 'student' THEN CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))
              WHEN a.parent = 'teacher' THEN CONCAT(tc.firstname, ' ', COALESCE(tc.lastname, ''))
              WHEN a.parent = 'employee' THEN CONCAT(em.firstname, ' ', COALESCE(em.lastname, ''))
            END,
            CONCAT(COALESCE(st.firstname, tc.firstname, em.firstname, ''), ' ', COALESCE(st.lastname, tc.lastname, em.lastname, ''))
          ) AS name,
          cl.name AS class_name,
          se.name AS section_name,
          COUNT(*) OVER() AS count
        FROM attendance a
        LEFT JOIN student  st ON st.id = a.parent_id AND a.parent = 'student'
        LEFT JOIN teacher  tc ON tc.id = a.parent_id AND a.parent = 'teacher'
        LEFT JOIN employee em ON em.id = a.parent_id AND a.parent = 'employee'
        LEFT JOIN class    cl ON cl.id = a.class_id
        LEFT JOIN section  se ON se.id = a.section_id
        WHERE 1=1
          ${schoolClause}
          ${parentClause}
          ${parentIdClause}
          ${classClause}
          ${sectionClause}
          ${statusClause}
          ${searchClause}
        ORDER BY a.date DESC NULLS LAST, a.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
    } catch (rawErr: any) {
      if (String(rawErr).includes("column a.remark does not exist") || String(rawErr).includes("42703")) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "remark" TEXT;`);
        rows = await prisma.$queryRaw<any[]>(Prisma.sql`
          SELECT
            a.id,
            a.school_id,
            a.parent::text AS parent,
            a.parent_id,
            a.class_id,
            a.section_id,
            a.date,
            a.status::text AS status,
            a.remark,
            a.created_at,
            COALESCE(
              CASE 
                WHEN a.parent = 'student' THEN CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))
                WHEN a.parent = 'teacher' THEN CONCAT(tc.firstname, ' ', COALESCE(tc.lastname, ''))
                WHEN a.parent = 'employee' THEN CONCAT(em.firstname, ' ', COALESCE(em.lastname, ''))
              END,
              CONCAT(COALESCE(st.firstname, tc.firstname, em.firstname, ''), ' ', COALESCE(st.lastname, tc.lastname, em.lastname, ''))
            ) AS name,
            cl.name AS class_name,
            se.name AS section_name,
            COUNT(*) OVER() AS count
          FROM attendance a
          LEFT JOIN student  st ON st.id = a.parent_id AND a.parent = 'student'
          LEFT JOIN teacher  tc ON tc.id = a.parent_id AND a.parent = 'teacher'
          LEFT JOIN employee em ON em.id = a.parent_id AND a.parent = 'employee'
          LEFT JOIN class    cl ON cl.id = a.class_id
          LEFT JOIN section  se ON se.id = a.section_id
          WHERE 1=1
            ${schoolClause}
            ${parentClause}
            ${parentIdClause}
            ${classClause}
            ${sectionClause}
            ${statusClause}
            ${searchClause}
          ORDER BY a.date DESC NULLS LAST, a.id DESC
          LIMIT ${limit} OFFSET ${offset}
        `);
      } else {
        throw rawErr;
      }
    }

    if (rows.length > 0) {
      const count = Number(rows[0]?.count || 0);
      const cleanRows = rows.map(({ count: _c, ...rest }) => rest);
      return NextResponse.json(Utility.formatResponse(200, { count, rows: cleanRows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(200, { count: 0, rows: [] }), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});

/**
 * POST /api/v1/attendance — create attendance record(s)
 */
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "attendance", userId);
});

/**
 * PATCH /api/v1/attendance — update attendance record
 */
export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "attendance", userId);
});
