import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { supabaseAdmin } from "@/lib/supabase";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "school-crm";

// POST /api/v1/image/upload-image — replaces local fs upload, now goes to Supabase Storage
export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const imageName = formData.get("imageName") as string | null;

    if (!image || !imageName) {
      return NextResponse.json(Utility.formatResponse(400, "No file uploaded"), { status: 400 });
    }
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(Utility.formatResponse(400, "Invalid file type"), { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(`images/${imageName}`, buffer, {
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
      .getPublicUrl(`images/${imageName}`);

    return NextResponse.json(Utility.formatResponse(200, "Uploaded Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
