import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/teacher/get-teacher-detail/[teacherId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { teacherId } = await params;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) },
    });
    if (!teacher) {
      return NextResponse.json(Utility.formatResponse(404, "Teacher Not Found"), { status: 404 });
    }
    return NextResponse.json(Utility.formatResponse(200, teacher), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
