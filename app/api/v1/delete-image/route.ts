import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// DELETE /api/v1/delete-image
export const DELETE = withAuth(async (req: NextRequest) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const body = await req.json();
    const parentId = parseInt(String(body.parent_id), 10);
    if (isNaN(parentId)) {
      return NextResponse.json(Utility.formatResponse(400, "Invalid parent_id"), { status: 400 });
    }

    const parents: string[] = Array.isArray(body.parent)
      ? body.parent
      : body.parent
      ? [body.parent]
      : [];

    if (parents.length > 0) {
      for (const p of parents) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "public"."image" WHERE "parent" = CAST($1::text AS "public"."ImageParent") AND "parent_id" = $2`,
          p,
          parentId
        );
      }
    }
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
