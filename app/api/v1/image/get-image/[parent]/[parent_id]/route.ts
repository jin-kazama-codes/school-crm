import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/image/get-image/[parent]/[parent_id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parent: string; parent_id: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { parent, parent_id } = await params;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  try {
    let query = `SELECT id, school_id, parent::text, parent_id, priority, type::text, image_src, created_at, updated_at, created_by, updated_by
                 FROM "public"."image"
                 WHERE "parent" = CAST($1::text AS "public"."ImageParent") AND "parent_id" = $2`;
    const queryParams: any[] = [parent, parseInt(parent_id, 10)];
    if (schoolId) {
      query += ` AND "school_id" = $3`;
      queryParams.push(schoolId);
    }
    query += ` ORDER BY priority DESC, id DESC`;

    const data = await prisma.$queryRawUnsafe<any[]>(query, ...queryParams);
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
