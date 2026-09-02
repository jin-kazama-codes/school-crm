import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/dashboard/get-student-graph-data
export async function GET(req: NextRequest) {
  const r = applyRateLimit(req); if (r) return r;

  try {
    const data = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        CONCAT(cs.name) AS class_name, 
        COUNT(*) AS total_students,
        CAST((COUNT(CASE WHEN result = 'pass' THEN 1 END)::float / COUNT(*)) * 100 AS INTEGER) AS passing_percentage
      FROM marksheet
      JOIN class cs ON marksheet.class_id = cs.id
      GROUP BY marksheet.class_id, cs.name
    `);
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
