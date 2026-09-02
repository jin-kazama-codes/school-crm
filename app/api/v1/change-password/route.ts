import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/change-password
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const payload = await request.json();
    const user = await prisma.user.findFirst({ where: { id: payload.userId || userId } });

    if (!user) {
      return NextResponse.json(Utility.formatResponse(200, "User does not exist"), { status: 200 });
    }

    const isMatch = await Utility.comparePassword(payload.oldPassword, user.password!);
    if (!isMatch) {
      return NextResponse.json(Utility.formatResponse(200, "Old Password do not match"), { status: 200 });
    }

    const hash = await Utility.createHash(payload.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, updated_by: payload.userId || userId },
    });
    return NextResponse.json(Utility.formatResponse(200, "Password Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
