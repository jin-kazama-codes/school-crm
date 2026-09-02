import { NextRequest } from "next/server";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList } from "@/lib/crudHelpers";

// GET /api/v1/get-employees
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericList(req, "employee", ["firstname", "lastname", "email", "status"]);
});
