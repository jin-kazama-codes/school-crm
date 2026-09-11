import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

/**
 * GET /api/v1/payment/get-payment-data/[classId]/[sectionId]
 *
 * Returns school-level payment configuration (session start, payment date,
 * class fee, late fee, payment methods) filtered by class and section.
 * Used by the Payment form to pre-fill fee details when creating payments.
 *
 * Mirrors original getPaymentData in payment controller (raw SQL with JOINs).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string; sectionId: string }> }
) {
  const r = applyRateLimit(req); if (r) return r;

  const { classId, sectionId } = await params;

  const cId = parseInt(classId, 10);
  const sId = parseInt(sectionId, 10);

  if (isNaN(cId) || isNaN(sId)) {
    return NextResponse.json(
      Utility.formatResponse(400, "Invalid classId or sectionId"),
      { status: 400 }
    );
  }

  const schoolCond = Utility.getSchoolIdFromHeader(req);
  const schoolId = schoolCond.school_id
    ? parseInt(String(schoolCond.school_id))
    : undefined;

  if (!schoolId) {
    return NextResponse.json(
      Utility.formatResponse(400, "School context missing from request headers"),
      { status: 400 }
    );
  }

  try {
    // Fetch school + class fee data in two separate queries
    // (avoids $queryRawUnsafe SQL injection; reconstructs the original JOIN logic)
    const school = await prisma.school.findFirst({
      where: { id: schoolId },
      select: {
        id: true,
        session_start: true,
        payment_date: true,
        payment_methods: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        Utility.formatResponse(404, "School not found"),
        { status: 404 }
      );
    }

    const classData = await prisma.school_class_data.findFirst({
      where: {
        school_id: schoolId,
        class_id: cId,
        section_id: sId,
      },
      select: {
        class_fee: true,
        late_fee: true,
        late_fee_duration: true,
      },
    });

    if (!classData) {
      return NextResponse.json(
        Utility.formatResponse(404, "No class fee data found for this class and section"),
        { status: 404 }
      );
    }

    // Resolve payment method names from comma-separated IDs stored in school.payment_methods
    let methodNames: string[] = [];
    if (school.payment_methods) {
      const methodIds = school.payment_methods
        .split(",")
        .map((id: string) => parseInt(id.trim(), 10))
        .filter((id: number) => !isNaN(id));

      if (methodIds.length > 0) {
        const methods = await prisma.payment_method.findMany({
          where: { id: { in: methodIds } },
          select: { name: true },
        });
        methodNames = methods.map((m: { name: string | null }) => m.name ?? "").filter(Boolean);
      }
    }

    const result = {
      id: school.id,
      session_start: school.session_start,
      payment_date: school.payment_date,
      payment_methods: school.payment_methods,
      class_fee: classData.class_fee,
      classLateFee: classData.late_fee,
      late_fee_duration: classData.late_fee_duration,
      methodName: methodNames.join(", "),
    };

    return NextResponse.json(Utility.formatResponse(200, [result]), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
