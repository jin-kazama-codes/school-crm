import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

// GET /api/v1/teacher
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "10");
  const search = (searchParams.get("search") || "").trim();
  const { limit, offset } = Utility.getPagination(page, size);
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : null;

  try {
    const searchWild = `%${search}%`;

    // Build WHERE clauses
    const schoolClause = schoolId ? Prisma.sql`AND t.school_id = ${schoolId}` : Prisma.sql``;
    const searchClause = search
      ? Prisma.sql`AND (t.firstname ILIKE ${searchWild} OR t.lastname ILIKE ${searchWild} OR t.email ILIKE ${searchWild} OR t.status ILIKE ${searchWild})`
      : Prisma.sql``;

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        t.id,
        t.school_id,
        t.firstname,
        t.lastname,
        CONCAT(t.firstname, ' ', COALESCE(t.lastname, '')) AS "teacherName",
        t.email,
        t.contact_no,
        t.gender,
        t.grade,
        t.qualification,
        t.is_class_teacher,
        t.status,
        t.created_at,
        t.updated_at,

        -- Class teacher's own class+section label
        CASE
          WHEN t.is_class_teacher = true THEN
            CONCAT(COALESCE(ct_cls.name, ''), '-', COALESCE(ct_sec.name, ''))
          ELSE NULL
        END AS class_section_name,

        -- All classes this teacher is assigned to (via mapping table)
        (
          SELECT STRING_AGG(DISTINCT CONCAT(mc.name, '-', ms.name), ',' ORDER BY CONCAT(mc.name, '-', ms.name))
          FROM teacher_class_section_subject tcss
          JOIN class mc ON mc.id = tcss.class_id
          JOIN section ms ON ms.id = tcss.section_id
          WHERE tcss.teacher_id = t.id AND tcss.school_id = t.school_id
        ) AS classnames,

        -- All subjects this teacher teaches (resolve IDs → names)
        (
          SELECT STRING_AGG(DISTINCT sub.name, ',' ORDER BY sub.name)
          FROM teacher_class_section_subject tcss2
          JOIN subject sub ON sub.id = ANY(
            string_to_array(tcss2.subject_ids, ',')::int[]
          )
          WHERE tcss2.teacher_id = t.id AND tcss2.school_id = t.school_id
        ) AS subjects,

        -- Total count for pagination
        COUNT(*) OVER() AS count

      FROM teacher t
      LEFT JOIN class  ct_cls ON ct_cls.id = t.class
      LEFT JOIN section ct_sec ON ct_sec.id = t.section

      WHERE 1=1
        ${schoolClause}
        ${searchClause}

      ORDER BY t.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    if (rows.length > 0) {
      const count = Number(rows[0]?.count || 0);
      // Remove the count field from each row
      const cleanRows = rows.map(({ count: _c, ...rest }) => rest);
      return NextResponse.json(Utility.formatResponse(200, { count, rows: cleanRows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});



export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "teacher", userId, true);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "teacher", userId);
});
