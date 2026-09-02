import { NextRequest } from "next/server";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

// GET /api/v1/get-user-roles
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericList(req, "user_role", ["name", "status"]);
});
