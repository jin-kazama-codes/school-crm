import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/get-role-by-id
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  try {
    const payload = await req.json();
    const roleId = typeof payload === "number" ? payload : payload.id;

    if (!roleId) {
      return NextResponse.json(Utility.formatResponse(400, "Role ID required"), { status: 400 });
    }

    const userRole = await prisma.user_role.findUnique({
      where: { id: parseInt(String(roleId)) },
      select: { name: true, priority: true },
    });

    if (!userRole) {
      return NextResponse.json(Utility.formatResponse(404, "Role Not Found"), { status: 404 });
    }

    return NextResponse.json(Utility.formatResponse(200, userRole), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
