import { NextRequest } from "next/server";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate } from "@/lib/crudHelpers";

// POST /api/v1/create-user-role
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "user_role", userId);
});
