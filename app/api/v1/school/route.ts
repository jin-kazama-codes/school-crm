import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

/**
 * GET /api/v1/school
 *
 * Uses Prisma.sql tagged template literals (parameterized queries) to
 * prevent SQL injection. The original $queryRawUnsafe with string
 * interpolation was vulnerable.
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get("page") || "0",  10);
  const size   = parseInt(searchParams.get("size") || "5",  10);
  const search = (searchParams.get("search") || "").trim();
  const { limit, offset } = Utility.getPagination(page, size);

  const searchWild = `%${search}%`;

  try {
    // Parameterized query — safe from SQL injection
    const rows = await prisma.$queryRaw<any[]>(
      search
        ? Prisma.sql`
            SELECT sc.id, sc.name, sc.board, sc.sub_type, sc.email, sc.contact_no_1,
                   sc.director, sc.capacity, sc.status,
                   ci.name AS city,
                   (SELECT COUNT(*) FROM school)::int AS count
            FROM school sc
            LEFT JOIN address addr ON addr.parent_id = sc.id AND addr.parent = 'school'
            LEFT JOIN city ci ON ci.id = addr.city
            WHERE sc.name ILIKE ${searchWild}
               OR sc.board ILIKE ${searchWild}
               OR sc.sub_type ILIKE ${searchWild}
               OR sc.status ILIKE ${searchWild}
               OR ci.name ILIKE ${searchWild}
               OR sc.capacity::text ILIKE ${searchWild}
            ORDER BY sc.updated_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : Prisma.sql`
            SELECT sc.id, sc.name, sc.board, sc.sub_type, sc.email, sc.contact_no_1,
                   sc.director, sc.capacity, sc.status,
                   ci.name AS city,
                   (SELECT COUNT(*) FROM school)::int AS count
            FROM school sc
            LEFT JOIN address addr ON addr.parent_id = sc.id AND addr.parent = 'school'
            LEFT JOIN city ci ON ci.id = addr.city
            ORDER BY sc.updated_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
    );

    if (rows.length > 0) {
      const count = Number(rows[0]?.count || 0);
      return NextResponse.json(Utility.formatResponse(200, { count, rows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});

// POST /api/v1/school — create school
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    const school = await prisma.school.create({ data: { ...payload, created_by: userId } });
    return NextResponse.json(Utility.formatResponse(200, { id: school.id }), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});

// PATCH /api/v1/school — update school
export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    const { id, ...updateData } = payload;
    await prisma.school.update({ where: { id }, data: { ...updateData, updated_by: userId } });
    return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
