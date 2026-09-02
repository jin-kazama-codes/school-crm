import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { applyRateLimit } from "@/lib/apiHelpers";

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  return NextResponse.json(
    Utility.formatResponse(200, "API Working Fine."),
    { status: 200 }
  );
}
