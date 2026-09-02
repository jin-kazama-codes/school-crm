import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate } from "@/lib/crudHelpers";

// POST /api/v1/create-student
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "student", userId, true);
});
