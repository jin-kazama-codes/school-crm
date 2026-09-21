import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate } from "@/lib/crudHelpers";

/**
 * GET /api/v1/attendance
 *
 * Supports query params:
 *   page, size            — pagination
 *   search                — text search on status / parent
 *   month                 — 1-12, filters by calendar month (current year)
 *   classId               — filter by class_id
 *   sectionId             — filter by section_id
 *   parentId              — filter by parent_id (student or employee id)
 *
 * Joins class + section tables to include className and sectionName in results.
 * Mirrors original AttendanceController.getAttendances with year/month/class/section filtering.
 */
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const page     = parseInt(searchParams.get("page")      || "0",  10);
  const size     = parseInt(searchParams.get("size")      || "10",  10);
  const search   = searchParams.get("search")   || "";
  const month    = searchParams.get("month")    ? parseInt(searchParams.get("month") as string, 10) : null;
  const classId  = searchParams.get("classId")  ? parseInt(searchParams.get("classId")  as string, 10) : null;
  const sectionId = searchParams.get("sectionId") ? parseInt(searchParams.get("sectionId") as string, 10) : null;
  const parentId  = searchParams.get("parentId")  ? parseInt(searchParams.get("parentId")  as string, 10) : null;

  const { limit, offset } = Utility.getPagination(page, size);

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id
    ? parseInt(String(schoolCond.school_id))
    : undefined;

  try {
    const currentYear = new Date().getFullYear();

    // Build date range: current year, optionally filtered to a specific month
    let dateGte: Date;
    let dateLt: Date;
    if (month !== null && month >= 1 && month <= 12) {
      dateGte = new Date(currentYear, month - 1, 1);           // start of month
      dateLt  = new Date(currentYear, month,     1);           // start of next month
    } else {
      dateGte = new Date(currentYear,  0, 1);                  // start of current year
      dateLt  = new Date(currentYear + 1, 0, 1);              // start of next year
    }

    // Build Prisma where clause
    const where: Record<string, unknown> = {
      date: { gte: dateGte, lt: dateLt },
    };

    if (schoolId)   where.school_id  = schoolId;
    if (classId)    where.class_id   = classId;
    if (sectionId)  where.section_id = sectionId;
    if (parentId)   where.parent_id  = parentId;

    // Text search on status and parent fields
    if (search) {
      where.OR = [
        { status: { contains: search, mode: "insensitive" } },
        { parent: { contains: search, mode: "insensitive" } },
      ];
    }

    // Run count + data queries in parallel for efficiency
    const [count, rows] = await Promise.all([
      prisma.attendance.count({ where }),
      (prisma.attendance as any).findMany({
        where,
        take:    limit,
        skip:    offset,
        orderBy: { date: "desc" },
        include: {
          class:   { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      }),
    ]);

    if (count === 0) {
      return NextResponse.json(
        Utility.formatResponse(404, "No Data Found"),
        { status: 404 }
      );
    }

    // Flatten joined fields for frontend compatibility (className, sectionName)
    const flatRows = rows.map((row: any) => ({
      ...row,
      className:   row.class?.name   ?? null,
      sectionName: row.section?.name ?? null,
    }));

    return NextResponse.json(
      Utility.formatResponse(200, { count, rows: flatRows }),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});

/**
 * POST /api/v1/attendance — create attendance record(s)
 */
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "attendance", userId);
});
