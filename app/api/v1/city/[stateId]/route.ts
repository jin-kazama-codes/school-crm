import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/city/[stateId] — get cities by state
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ stateId: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { stateId } = await params;
  try {
    const rows = await prisma.city.findMany({
      where: { state_id: stateId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(Utility.formatResponse(200, rows), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
