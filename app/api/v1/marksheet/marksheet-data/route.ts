import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

/**
 * POST /api/v1/marksheet/marksheet-data
 * Creates a subject-marks row in marksheet_data (mapping table).
 * Called by MarksheetAPI.insertIntoMappingTable on the frontend.
 *
 * Body: { marksheet_id, subject_id, marks, max_marks, grade }
 */
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id
    ? parseInt(String(schoolCond.school_id))
    : undefined;

  try {
    const body = await req.json();
    const { marksheet_id, subject_id, marks, max_marks, grade } = body;

    if (!marksheet_id || !subject_id) {
      return NextResponse.json(
        Utility.formatResponse(400, "Missing required parameters: marksheet_id, subject_id"),
        { status: 400 }
      );
    }

    await prisma.marksheet_data.create({
      data: {
        marksheet_id: parseInt(String(marksheet_id)),
        subject_id:   parseInt(String(subject_id)),
        marks:        marks   !== undefined ? parseFloat(String(marks))     : undefined,
        max_marks:    max_marks !== undefined ? parseFloat(String(max_marks)) : undefined,
        grade:        grade   ?? null,
      },
    });

    return NextResponse.json(
      Utility.formatResponse(200, "Created Successfully"),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});

/**
 * DELETE /api/v1/marksheet/marksheet-data
 * Deletes all rows from marksheet_data for a given marksheet_id.
 * Called by MarksheetAPI.deleteFromMappingTable on the frontend.
 *
 * Body: { marksheet_id }
 */
export const DELETE = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id
    ? parseInt(String(schoolCond.school_id))
    : undefined;

  try {
    const body = await req.json();
    const { marksheet_id } = body;

    if (!marksheet_id) {
      return NextResponse.json(
        Utility.formatResponse(400, "Missing required parameter: marksheet_id"),
        { status: 400 }
      );
    }

    await prisma.marksheet_data.deleteMany({
      where: { marksheet_id: parseInt(String(marksheet_id)) },
    });

    return NextResponse.json(
      Utility.formatResponse(200, "Deleted Successfully"),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});
