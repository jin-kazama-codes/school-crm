import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

// user_role routes
export const GET = withAuth(async (req: NextRequest) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericList(req, "user_role", ["name", "status"]);
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "user_role", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "user_role", userId);
});
