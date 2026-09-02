import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/get-schools
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "5");
  const search = searchParams.get("search") || "";
  const { limit, offset } = Utility.getPagination(page, size);

  try {
    let whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { school_code: { contains: search, mode: "insensitive" } },
        { status: { startsWith: search } },
      ];
    }

    const [rows, count] = await Promise.all([
      prisma.school.findMany({
        where: whereCondition,
        orderBy: { updated_at: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.school.count({ where: whereCondition }),
    ]);

    if (count > 0) {
      return NextResponse.json(Utility.formatResponse(200, { count, rows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
  }
});
