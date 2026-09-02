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
    const whereClause: Record<string, unknown> = { parent, parent_id: parseInt(parent_id) };
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
