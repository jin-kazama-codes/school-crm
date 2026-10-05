import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// GET /api/v1/common/get-by-pk/[table]/[id] — no auth
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;
  const { table, id } = await params;

  const modelName = Utility.getPrismaModelName(table);
  if (!modelName) {
    return NextResponse.json(Utility.formatResponse(400, "Invalid table"), { status: 400 });
  }

  try {
    const model = (prisma as any)[modelName];
    const data = await model.findUnique({ where: { id: parseInt(id) } });
    if (!data) {
      return NextResponse.json(Utility.formatResponse(404, "Data Not Found"), { status: 404 });
    }

    if (table === "student" && data) {
      // 1. Resolve House Name
      if (data.house) {
        const houseId = parseInt(String(data.house), 10);
        if (!isNaN(houseId)) {
          const houseRecord = await prisma.school_house.findUnique({
            where: { id: houseId },
            select: { name: true, color_code: true },
          });
          if (houseRecord) {
            (data as any).house_name = houseRecord.name;
            (data as any).house_color = houseRecord.color_code;
          }
        }
      }

      // 2. Resolve Subjects if string of IDs or fallback to school_class_data
      let subjectIdsList: number[] = [];
      if (typeof data.subjects === "string" && data.subjects.trim()) {
        subjectIdsList = data.subjects
          .split(",")
          .map((s: string) => parseInt(s.trim(), 10))
          .filter((n: number) => !isNaN(n));
      } else if (Array.isArray(data.subjects)) {
        subjectIdsList = data.subjects
          .map((s: any) => (typeof s === "object" ? (s.id ?? s.subject_id) : parseInt(String(s), 10)))
          .filter((n: number) => !isNaN(n));
      }

      if (subjectIdsList.length === 0 && data.class && data.section) {
        const classSectionData = await prisma.school_class_data.findFirst({
          where: {
            class_id: data.class,
            section_id: data.section,
            ...(data.school_id ? { school_id: data.school_id } : {}),
          },
          select: { subject_ids: true },
        });
        if (classSectionData?.subject_ids) {
          subjectIdsList = classSectionData.subject_ids
            .split(",")
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((n: number) => !isNaN(n));
        }
      }

      if (subjectIdsList.length > 0) {
        const subjects = await prisma.subject.findMany({
          where: { id: { in: subjectIdsList } },
          select: { id: true, name: true },
        });
        (data as any).resolved_subjects = subjects;
        (data as any).subjects_display = subjects.map((s: any) => s.name).join(", ");
      }
    }

    return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
