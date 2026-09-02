import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/reset-password
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const { token, password } = await request.json();
    const decoded = Utility.verifyTokenString(token);

    if (!decoded) {
      return NextResponse.json(Utility.formatResponse(401, "Token Expired"), { status: 401 });
    }

    const hash = await Utility.createHash(password);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hash, updated_by: decoded.id },
    });
    return NextResponse.json(Utility.formatResponse(200, "Password Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, String(err)), { status: 409 });
  }
});
