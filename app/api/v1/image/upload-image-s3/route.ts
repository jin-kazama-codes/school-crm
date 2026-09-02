import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { supabaseAdmin } from "@/lib/supabase";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "school-crm";

// POST /api/v1/image/upload-image-s3 — replaces AWS S3 upload, now Supabase Storage
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!image || !folder) {
      return NextResponse.json(Utility.formatResponse(400, "No file uploaded"), { status: 400 });
    }
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(Utility.formatResponse(400, "Invalid file type"), { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(folder, buffer, {
        contentType: image.type,
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        Utility.formatResponse(500, "Error occurred while uploading the file"),
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(folder);

    return NextResponse.json(
      Utility.formatResponse(200, urlData.publicUrl),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
