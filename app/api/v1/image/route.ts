import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { supabaseAdmin } from "@/lib/supabase";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericCreate, genericUpdate, genericDelete } from "@/lib/crudHelpers";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "school-crm";

// POST /api/v1/image/create-image
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericCreate(req, "image", userId);
});

// PATCH /api/v1/image/update-image
export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  return genericUpdate(req, "image", userId);
});

// DELETE /api/v1/image/delete-image
export const DELETE = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    await prisma.image.deleteMany({
      where: { parent: payload.parent, parent_id: payload.parent_id },
    });
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
