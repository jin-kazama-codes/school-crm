import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/profile
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, school_id: true, username: true, email: true,
        contact_no: true, role: true, designation: true,
        gender: true, status: true, created_at: true, updated_at: true,
        created_by: true, updated_by: true,
      },
    });
    if (!user) {
      return NextResponse.json(Utility.formatResponse(404, "User Not Found"), { status: 404 });
    }
    return NextResponse.json(Utility.formatResponse(200, user), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
