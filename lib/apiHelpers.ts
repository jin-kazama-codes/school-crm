import { NextRequest, NextResponse } from "next/server";
import Utility from "./utility";

/**
 * Auth guard for Next.js 15+ route handlers.
 * Compatible with Next.js 15/16 async params context structure.
 */
export function withAuth(
  handler: (req: NextRequest, context: { userId: number; params?: any }) => Promise<NextResponse>,
  skipAuth = false
) {
  return async (req: NextRequest, context?: { params?: Promise<any> }) => {
    const resolvedParams = context?.params ? await context.params : undefined;

    if (skipAuth) {
      return handler(req, { userId: 0, params: resolvedParams });
    }

    const authResult = Utility.verifyToken(req);

    if (authResult === null) {
      const token = req.headers.get("x-access-token");
      if (!token) {
        return NextResponse.json(
          Utility.formatResponse(401, "No Token Provided"),
          { status: 401 }
        );
      }
      return NextResponse.json(
        Utility.formatResponse(401, "Token Expired"),
        { status: 401 }
      );
    }

    return handler(req, { userId: authResult.userId, params: resolvedParams });
  };
}

/**
 * Rate limiter using in-memory LRU-style counter.
 * 5000 req/min per IP — same as original express-rate-limit config.
 */
const ipCounters = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 5000;

  const entry = ipCounters.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounters.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  if (entry.count > max) return false;
  return true;
}

/**
 * Apply rate limit and return 429 if exceeded
 */
export function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      Utility.formatResponse(429, "You have exceeded 5000 requests per minute limit!"),
      { status: 429 }
    );
  }
  return null;
}
