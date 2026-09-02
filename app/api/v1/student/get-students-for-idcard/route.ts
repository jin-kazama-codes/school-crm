import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/student/get-students-for-idcard
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  try {
    const rows = await prisma.student.findMany({
      where: schoolId ? { school_id: schoolId } : {},
      select: {
        id: true, firstname: true, lastname: true, roll_no: true,
        class: true, section: true, house: true, dob: true,
        admission_date: true, blood_group: true, gender: true,
        father_name: true, mother_name: true, id_card: true,
      },
    });
    return NextResponse.json(Utility.formatResponse(200, rows), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
