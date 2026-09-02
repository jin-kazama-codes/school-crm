import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/attendance/rfid — no auth (called by RFID hardware)
export async function POST(req: NextRequest) {
  const r = applyRateLimit(req); if (r) return r;
  try {
    const payload = await req.json();
    const { parent_id, school_id, class_id, section_id, parent } = payload;

    // Find today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        parent_id: parseInt(parent_id),
        school_id: parseInt(school_id),
        date: { gte: today, lt: tomorrow },
      },
    });

    if (!existing) {
      await prisma.attendance.create({
        data: {
          school_id: parseInt(school_id),
          parent,
          parent_id: parseInt(parent_id),
          class_id: class_id ? parseInt(class_id) : undefined,
          section_id: section_id ? parseInt(section_id) : undefined,
          date: new Date(),
          status: "present",
          created_at: new Date(),
        },
      });
    }

    return NextResponse.json(Utility.formatResponse(200, "Attendance Marked"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
