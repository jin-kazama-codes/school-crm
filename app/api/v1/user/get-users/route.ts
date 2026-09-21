import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/user/get-users
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "10");
  const search = searchParams.get("search") || "";
  const { limit, offset } = Utility.getPagination(page, size);

  const schoolCondition = Utility.getSchoolIdFromHeader(request);
  const schoolId = schoolCondition.school_id
    ? parseInt(String(schoolCondition.school_id))
    : undefined;

  const whereCondition: Record<string, unknown> = {};
  if (schoolId) whereCondition.school_id = schoolId;

  if (search) {
    whereCondition.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { status: { startsWith: search } },
    ];
  }

  try {
    const [rows, count] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true, school_id: true, username: true, email: true,
          contact_no: true, role: true, designation: true,
          gender: true, status: true, updated_at: true,
        },
        orderBy: { updated_at: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    if (count > 0) {
      return NextResponse.json(Utility.formatResponse(200, { count, rows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
