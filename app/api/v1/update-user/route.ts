import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// PATCH /api/v1/update-user
export const PATCH = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  const schoolCondition = Utility.getSchoolIdFromHeader(request);
  const schoolId = schoolCondition.school_id
    ? parseInt(String(schoolCondition.school_id))
    : undefined;

  try {
    const payload = await request.json();
    const { id, ...updateData } = payload;

    if (updateData.password) {
      updateData.password = await Utility.createHash(updateData.password);
    }

    const whereClause: Record<string, unknown> = { id };
    if (schoolId) whereClause.school_id = schoolId;

    await prisma.user.update({
      where: { id },
      data: { ...updateData, updated_by: userId },
    });
    return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
