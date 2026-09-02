import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/school/create-school-class-mapping
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const body = await req.json();
    const { 0: school_id, 1: class_id, 2: section_id, 3: subject_ids,
            4: class_fee, 5: class_capacity, 6: late_fee, 7: late_fee_duration } = body;

    if (!school_id || !class_id || !section_id) {
      return NextResponse.json(Utility.formatResponse(400, "Missing required parameters"), { status: 400 });
    }

    await prisma.$executeRawUnsafe(`
      INSERT INTO school_class_data (school_id, class_id, section_id, subject_ids, class_fee, class_capacity, late_fee, late_fee_duration)
      VALUES (${school_id}, ${class_id}, ${section_id}, '${subject_ids}', ${class_fee || 0}, ${class_capacity || 0}, ${late_fee || 0}, '${late_fee_duration || ""}')
    `);
    return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});

// DELETE /api/v1/school/delete-from-school-mapping
export const DELETE = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const { school_id } = await req.json();
    await prisma.$executeRawUnsafe(`DELETE FROM school_class_data WHERE school_id = ${school_id}`);
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});
