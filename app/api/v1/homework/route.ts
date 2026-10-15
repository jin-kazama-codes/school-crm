import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const search = (searchParams.get("search") || "").trim();
    const classId = searchParams.get("classId") || searchParams.get("class_id");
    const sectionId = searchParams.get("sectionId") || searchParams.get("section_id");

    const { limit, offset } = Utility.getPagination(page, size);
    const schoolCond = Utility.getSchoolIdFromHeader(req);
    const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : null;

    let scopedClass = classId ? parseInt(classId, 10) : null;
    let scopedSection = sectionId ? parseInt(sectionId, 10) : null;

    if (userId > 0) {
      const authUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (authUser?.role === 6) {
        const studentRec = await prisma.student.findFirst({
          where: { user_id: userId },
          select: { class: true, section: true },
        });
        if (studentRec) {
          scopedClass = studentRec.class;
          scopedSection = studentRec.section;
        }
      }
    }

    const searchWild = `%${search}%`;
    const schoolClause = schoolId ? Prisma.sql`AND h.school_id = ${schoolId}` : Prisma.sql``;
    const classClause = scopedClass ? Prisma.sql`AND h.class_id = ${scopedClass}` : Prisma.sql``;
    const sectionClause = scopedSection ? Prisma.sql`AND h.section_id = ${scopedSection}` : Prisma.sql``;
    const searchClause = search
      ? Prisma.sql`AND (h.title ILIKE ${searchWild} OR h.description ILIKE ${searchWild} OR cl.name ILIKE ${searchWild} OR se.name ILIKE ${searchWild} OR sub.name ILIKE ${searchWild} OR h.status::text ILIKE ${searchWild})`
      : Prisma.sql``;

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        h.id,
        h.school_id,
        h.teacher_id,
        h.class_id,
        h.section_id,
        h.subject_id,
        h.title,
        h.description,
        h.status,
        h.created_at,
        h.updated_at,
        cl.name AS class_name,
        se.name AS section_name,
        sub.name AS subject_name,
        CONCAT(t.firstname, ' ', COALESCE(t.lastname, '')) AS teacher_name,
        COUNT(*) OVER() AS count
      FROM homework h
      LEFT JOIN class   cl  ON cl.id  = h.class_id
      LEFT JOIN section se  ON se.id  = h.section_id
      LEFT JOIN subject sub ON sub.id = h.subject_id
      LEFT JOIN teacher t   ON t.id   = h.teacher_id
      WHERE 1=1
        ${schoolClause}
        ${classClause}
        ${sectionClause}
        ${searchClause}
      ORDER BY h.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

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

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "homework", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "homework", userId);
});
