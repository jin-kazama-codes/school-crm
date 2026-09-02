import { NextRequest } from "next/server";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericList(req, "school_house", ["name", "color_code", "status"]);
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "school_house", userId);
});

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "school_house", userId);
});
