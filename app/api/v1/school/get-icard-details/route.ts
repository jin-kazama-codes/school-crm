import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/school/get-icard-details
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id;
  const condition = schoolId ? `WHERE school.id=${schoolId}` : "";

  try {
    const data = await prisma.$queryRawUnsafe<any[]>(`
      SELECT school.name, school.registered_by,
             address.street, address.landmark, address.zipcode,
             city.name AS city, state.name AS state, country.name AS country
      FROM school
      JOIN address ON school.id = address.parent_id AND address.parent='school'
      JOIN city ON address.city = city.id
      JOIN state ON address.state = state.id
      JOIN country ON address.country = country.id
      ${condition}
    `);
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
