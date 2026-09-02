import { NextRequest, NextResponse } from "next/server";
import Utility from "@/lib/utility";
import { supabaseAdmin } from "@/lib/supabase";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "school-crm";

// GET /api/v1/image/download?folder=&file= — replaces AWS S3 download
export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const r = applyRateLimit(req); if (r) return r;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || BUCKET;
  const file = searchParams.get("file");

  if (!file) {
    return NextResponse.json(Utility.formatResponse(400, "File parameter required"), { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(folder)
      .download(file);

    if (error || !data) {
      return NextResponse.json(
        Utility.formatResponse(500, "Error occurred while fetching the file"),
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
});
