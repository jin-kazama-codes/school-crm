import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate } from "@/lib/crudHelpers";

// GET /api/v1/student/get-students
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "10");
  const search = searchParams.get("search") || "";
  const { limit, offset } = Utility.getPagination(page, size);
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  const whereCondition: Record<string, unknown> = {};
  if (schoolId) whereCondition.school_id = schoolId;
  if (search) {
    whereCondition.OR = [
      { firstname: { contains: search, mode: "insensitive" } },
      { lastname: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { status: { startsWith: search } },
    ];
  }

  try {
    const [rows, count] = await Promise.all([
      prisma.student.findMany({
        where: whereCondition,
        orderBy: { updated_at: "desc" },
        take: limit, skip: offset,
      }),
      prisma.student.count({ where: whereCondition }),
    ]);
    if (count > 0) return NextResponse.json(Utility.formatResponse(200, { count, rows }), { status: 200 });
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "student", userId, true);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "student", userId);
});
