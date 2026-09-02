import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/school/get-teacher-classes
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolIdFromHeader = schoolCond.school_id;
  const { searchParams } = new URL(req.url);
  const schoolIdFromQuery = searchParams.get("school_id");
  const schoolId = schoolIdFromHeader || schoolIdFromQuery;
  const condition = schoolId ? `WHERE tcss.school_id=${schoolId}` : "";

  try {
    const data = await prisma.$queryRawUnsafe<any[]>(`
      SELECT tcss.subject_ids, class.id AS class_id, class.name AS class_name,
             section.id AS section_id, section.name AS section_name
      FROM teacher_class_section_subject tcss
      JOIN class ON tcss.class_id = class.id
      JOIN section ON tcss.section_id = section.id
      ${condition}
      ORDER BY (class_name::integer) ASC, class_name ASC, section_name ASC
    `);
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
