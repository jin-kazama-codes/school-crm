import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

/**
 * GET /api/v1/marksheet
 *
 * Enriched marksheet listing with joined student name, class name, and section name.
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const search = (searchParams.get("search") || "").trim();
  const classId = searchParams.get("classId") || searchParams.get("class_id");
  const sectionId = searchParams.get("sectionId") || searchParams.get("section_id");
  const term = searchParams.get("term");
  const session = searchParams.get("session");
  const result = searchParams.get("result");

  const { limit, offset } = Utility.getPagination(page, size);

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = searchParams.get("school_id")
    ? parseInt(searchParams.get("school_id")!, 10)
    : (schoolCond.school_id ? parseInt(String(schoolCond.school_id), 10) : null);

  try {
    const searchWild = `%${search}%`;
    const schoolClause = schoolId ? Prisma.sql`AND m.school_id = ${schoolId}` : Prisma.sql``;
    const classClause = classId ? Prisma.sql`AND m.class_id = ${parseInt(classId, 10)}` : Prisma.sql``;
    const sectionClause = sectionId ? Prisma.sql`AND m.section_id = ${parseInt(sectionId, 10)}` : Prisma.sql``;
    const termClause = term ? Prisma.sql`AND m.term::text = ${term}` : Prisma.sql``;
    const sessionClause = session ? Prisma.sql`AND m.session ILIKE ${session}` : Prisma.sql``;
    const resultClause = result ? Prisma.sql`AND m.result::text = ${result}` : Prisma.sql``;
    const searchClause = search
      ? Prisma.sql`AND (
          st.firstname ILIKE ${searchWild} OR st.lastname ILIKE ${searchWild} OR
          m.session ILIKE ${searchWild} OR m.term::text ILIKE ${searchWild} OR
          m.result::text ILIKE ${searchWild} OR cl.name ILIKE ${searchWild} OR se.name ILIKE ${searchWild}
        )`
      : Prisma.sql``;

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        m.id,
        m.school_id,
        m.student_id,
        m.class_id,
        m.section_id,
        m.session,
        m.term,
        m.result,
        m.created_at,
        m.updated_at,
        m.created_by,
        m.updated_by,
        COALESCE(
          NULLIF(TRIM(CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))), ''),
          NULLIF(TRIM(st.firstname), '')
        ) AS student_name,
        COALESCE(
          NULLIF(TRIM(CONCAT(st.firstname, ' ', COALESCE(st.lastname, ''))), ''),
          NULLIF(TRIM(st.firstname), '')
        ) AS "studentName",
        st.roll_no,
        st.enrollment_no,
        cl.name AS class_name,
        se.name AS section_name,
        COUNT(*) OVER() AS count
      FROM marksheet m
      LEFT JOIN student st ON (st.id = m.student_id OR st.parent_id = m.student_id)
      LEFT JOIN class   cl ON cl.id = m.class_id
      LEFT JOIN section se ON se.id = m.section_id
      WHERE 1=1
        ${schoolClause}
        ${classClause}
        ${sectionClause}
        ${termClause}
        ${sessionClause}
        ${resultClause}
        ${searchClause}
      ORDER BY m.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    if (rows.length > 0) {
      const count = Number(rows[0]?.count || 0);
      const cleanRows = rows.map(({ count: _c, ...rest }) => rest);
      return NextResponse.json(Utility.formatResponse(200, { count, rows: cleanRows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "marksheet", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "marksheet", userId);
});

