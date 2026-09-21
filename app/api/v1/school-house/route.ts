import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

/**
 * GET /api/v1/school-house
 *
 * Enriched School House listing with joined student (captain, vice_captain) and teacher (teacher_incharge) names.
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const search = (searchParams.get("search") || "").trim();

  const { limit, offset } = Utility.getPagination(page, size);

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = searchParams.get("school_id")
    ? parseInt(searchParams.get("school_id")!, 10)
    : (schoolCond.school_id ? parseInt(String(schoolCond.school_id), 10) : null);

  try {
    const searchWild = `%${search}%`;
    const schoolClause = schoolId ? Prisma.sql`AND sh.school_id = ${schoolId}` : Prisma.sql``;
    const searchClause = search
      ? Prisma.sql`AND (
          sh.name ILIKE ${searchWild} OR
          sh.color_code ILIKE ${searchWild} OR
          sh.status::text ILIKE ${searchWild} OR
          cap.firstname ILIKE ${searchWild} OR cap.lastname ILIKE ${searchWild} OR
          vc.firstname ILIKE ${searchWild} OR vc.lastname ILIKE ${searchWild} OR
          ti.firstname ILIKE ${searchWild} OR ti.lastname ILIKE ${searchWild}
        )`
      : Prisma.sql``;

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        sh.id,
        sh.school_id,
        sh.name,
        sh.color_code,
        sh.captain,
        sh.vice_captain,
        sh.teacher_incharge,
        sh.strength,
        sh.status::text AS status,
        sh.created_at,
        sh.created_by,
        COALESCE(
          NULLIF(TRIM(CONCAT(cap.firstname, ' ', COALESCE(cap.lastname, ''))), ''),
          NULLIF(TRIM(cap.firstname), '')
        ) AS "captainName",
        COALESCE(
          NULLIF(TRIM(CONCAT(cap.firstname, ' ', COALESCE(cap.lastname, ''))), ''),
          NULLIF(TRIM(cap.firstname), '')
        ) AS captain_name,
        COALESCE(
          NULLIF(TRIM(CONCAT(vc.firstname, ' ', COALESCE(vc.lastname, ''))), ''),
          NULLIF(TRIM(vc.firstname), '')
        ) AS "viceCaptainNname",
        COALESCE(
          NULLIF(TRIM(CONCAT(vc.firstname, ' ', COALESCE(vc.lastname, ''))), ''),
          NULLIF(TRIM(vc.firstname), '')
        ) AS "viceCaptainName",
        COALESCE(
          NULLIF(TRIM(CONCAT(vc.firstname, ' ', COALESCE(vc.lastname, ''))), ''),
          NULLIF(TRIM(vc.firstname), '')
        ) AS vice_captain_name,
        COALESCE(
          NULLIF(TRIM(CONCAT(ti.firstname, ' ', COALESCE(ti.lastname, ''))), ''),
          NULLIF(TRIM(ti.firstname), '')
        ) AS "teacherName",
        COALESCE(
          NULLIF(TRIM(CONCAT(ti.firstname, ' ', COALESCE(ti.lastname, ''))), ''),
          NULLIF(TRIM(ti.firstname), '')
        ) AS teacher_name,
        COALESCE(
          NULLIF(TRIM(CONCAT(ti.firstname, ' ', COALESCE(ti.lastname, ''))), ''),
          NULLIF(TRIM(ti.firstname), '')
        ) AS teacher_incharge_name,
        COUNT(*) OVER() AS count
      FROM school_house sh
      LEFT JOIN student cap ON (cap.id = sh.captain OR cap.parent_id = sh.captain)
      LEFT JOIN student vc  ON (vc.id  = sh.vice_captain OR vc.parent_id = sh.vice_captain)
      LEFT JOIN teacher ti  ON (ti.id  = sh.teacher_incharge OR ti.parent_id = sh.teacher_incharge)
      WHERE 1=1
        ${schoolClause}
        ${searchClause}
      ORDER BY sh.id ASC
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
  return genericCreate(req, "school_house", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "school_house", userId);
});

