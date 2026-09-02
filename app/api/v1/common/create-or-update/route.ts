import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/common/create-or-update  — upsert endpoint
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;

  try {
    const payload = await req.json();
    const modelName = Utility.getPrismaModelName(payload.table);
    if (!modelName) {
      return NextResponse.json(Utility.formatResponse(400, "Invalid table"), { status: 400 });
    }

    const model = (prisma as any)[modelName];
    const whereClause = { ...payload.condition };
    if (schoolId) whereClause.school_id = schoolId;

    let obj = await model.findFirst({ where: whereClause });

    if (obj) {
      if (payload.table === "user" && payload.password) {
        payload.password = await Utility.createHash(payload.password);
      }
      await model.update({
        where: { id: obj.id },
        data: { ...payload, updated_by: userId },
      });
      return NextResponse.json(Utility.formatResponse(200, { id: obj.id }), { status: 200 });
    } else {
      if (payload.table === "user" && payload.password) {
        payload.password = await Utility.createHash(payload.password);
      }
      const record = await model.create({
        data: { ...payload, created_by: userId, ...(schoolId ? { school_id: schoolId } : {}) },
      });
      return NextResponse.json(Utility.formatResponse(200, { id: record.id }), { status: 200 });
    }
  } catch (err) {
    console.error("Error in upsertAPI:", err);
    return NextResponse.json(Utility.formatResponse(500, "Internal Server Error"), { status: 500 });
  }
});
