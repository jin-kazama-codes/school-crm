import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/student/get-class-of-student/[studentId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { studentId } = await params;

  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: { class: true, section: true },
    });
    if (!student) {
      return NextResponse.json(Utility.formatResponse(404, "Student Not Found"), { status: 404 });
    }
    return NextResponse.json(Utility.formatResponse(200, student), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
