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
    const whereClause: Record<string, unknown> = { parent };
    if (schoolId) whereClause.school_id = schoolId;

    const data = await prisma.image.findMany({
      where: whereClause,
      orderBy: { priority: "desc" },
    });

    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
