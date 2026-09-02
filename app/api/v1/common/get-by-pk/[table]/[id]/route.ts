import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/common/get-by-pk/[table]/[id] — no auth
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { table, id } = await params;

  const modelName = Utility.getPrismaModelName(table);
  if (!modelName) {
    return NextResponse.json(Utility.formatResponse(400, "Invalid table"), { status: 400 });
  }

  try {
    const model = (prisma as any)[modelName];
    const data = await model.findUnique({ where: { id: parseInt(id) } });
    if (!data) {
      return NextResponse.json(Utility.formatResponse(404, "Data Not Found"), { status: 404 });
    }
    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
