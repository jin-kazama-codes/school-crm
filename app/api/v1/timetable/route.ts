import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericList(req, "timetable", ["day", "batch"], { day: "asc" });
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "timetable", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "timetable", userId);
});
