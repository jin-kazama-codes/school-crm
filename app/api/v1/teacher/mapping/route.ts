import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/teacher/create-teacher-class-mapping
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  try {
    const payload = await req.json();
    const { teacher_id, class_id, section_id, subject_ids } = payload;

    await prisma.teacher_class_section_subject.create({
      data: { school_id: schoolId, teacher_id, class_id, section_id, subject_ids },
    });
    return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});

// DELETE /api/v1/teacher/delete-from-teacher-mapping
export const DELETE = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    const { teacher_id } = payload;
    await prisma.teacher_class_section_subject.deleteMany({ where: { teacher_id } });
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});
