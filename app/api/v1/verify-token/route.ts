import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET & POST /api/v1/verify-token
const handler = async (req: NextRequest, { userId }: { userId: number }) => {
  const r = applyRateLimit(req); if (r) return r;
  return NextResponse.json(Utility.formatResponse(200, "Verified"), { status: 200 });
};

export const GET = withAuth(handler);
export const POST = withAuth(handler);
