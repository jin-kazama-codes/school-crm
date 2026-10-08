import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

/**
 * GET /api/v1/marksheet/get-marksheet-data/[marksheetId]
 * Returns all marksheet_data rows for a specific marksheet header.
 * Called by MarksheetAPI.getMarksheetData on the frontend.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marksheetId: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;

  const { marksheetId } = await params;

  const id = parseInt(marksheetId, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      Utility.formatResponse(400, "Invalid marksheetId"),
      { status: 400 }
    );
  }

  try {
    const data = await prisma.marksheet_data.findMany({
      where: { marksheet_id: id },
      orderBy: { subject_id: "asc" },
    });

    const formattedData = (data || []).map((row: any) => ({
      ...row,
      marks_obtained: row.marks,
      total_marks: row.max_marks,
    }));

    return NextResponse.json(Utility.formatResponse(200, formattedData), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
