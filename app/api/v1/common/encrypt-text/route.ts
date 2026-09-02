import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/common/encrypt-text
export const POST = withAuth(async (req: NextRequest) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const { data } = await req.json();
    const encryptedData = Utility.encryptText(data.toString());
    return NextResponse.json(Utility.formatResponse(200, encryptedData), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
