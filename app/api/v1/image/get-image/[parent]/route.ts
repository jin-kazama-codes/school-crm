import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

/**
 * GET /api/v1/image/get-image/[parent]
 *
 * Returns image(s) for a parent entity WITHOUT a specific parent_id.
 * Used to retrieve the school's own logo/banner (parent = "school")
 * where the school is identified from the encrypted school header.
 *
 * Mirrors original getSkoolImage in the image controller.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parent: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;

  const { parent } = await params;

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id
    ? parseInt(String(schoolCond.school_id))
    : undefined;

  try {
    let query = `SELECT id, school_id, parent::text, parent_id, priority, type::text, image_src, created_at, updated_at, created_by, updated_by
                 FROM "public"."image"
                 WHERE "parent" = CAST($1::text AS "public"."ImageParent")`;
    const queryParams: any[] = [parent];
    if (schoolId) {
      query += ` AND "school_id" = $2`;
      queryParams.push(schoolId);
    }
    query += ` ORDER BY priority DESC, id DESC`;

    const data = await prisma.$queryRawUnsafe<any[]>(query, ...queryParams);
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
