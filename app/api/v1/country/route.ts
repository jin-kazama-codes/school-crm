import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

export const GET = withAuth(async (req: NextRequest) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const rows = await prisma.country.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(Utility.formatResponse(200, rows), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    const country = await prisma.country.create({ data: payload });
    return NextResponse.json(Utility.formatResponse(200, { id: country.id }), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const { id, ...data } = await req.json();
    await prisma.country.update({ where: { id }, data });
    return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
