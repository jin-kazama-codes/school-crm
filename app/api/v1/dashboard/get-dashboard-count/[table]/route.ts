import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/dashboard/get-dashboard-count/[table]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { table } = await params;

  const modelName = Utility.getPrismaModelName(table);
  if (!modelName) {
    return NextResponse.json(Utility.formatResponse(400, "Invalid table"), { status: 400 });
  }

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  try {
    const model = (prisma as any)[modelName];
    const key = table === "school" ? "id" : "school_id";
    const condition = schoolId ? { [key]: schoolId } : {};
    const count = await model.count({ where: condition });

    if (!count) {
      return NextResponse.json(Utility.formatResponse(404, "Data Not Found"), { status: 404 });
    }
    return NextResponse.json(Utility.formatResponse(200, count), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
