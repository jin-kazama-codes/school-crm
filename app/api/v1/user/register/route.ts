import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import sendEmail from "@/lib/email";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/user/register
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const payload = await request.json();
    const unhashedPass = payload.password;
    const schoolCondition = Utility.getSchoolIdFromHeader(request);

    const hash = await Utility.createHash(payload.password);
    payload.password = hash;

    const now = new Date();
    const user = await prisma.user.create({
      data: { ...payload, created_by: userId, created_at: now, updated_at: now, ...schoolCondition },
    });

    const token = Utility.getSignedToken(user.id);

    if (user.role === 2 || user.role === 3) {
      const school = await prisma.school.findFirst({
        where: { id: user.school_id!, status: "active" },
      });
      const mailOptions = {
        from: process.env.SMTP_USER,
        template: "email",
        to: user.email,
        subject: `Please Collect Your Login Credentials for ${school?.name}`,
        context: {
          name: user.username,
          company: "The Skolar",
          email: user.email,
          password: unhashedPass,
          schoolName: school?.name,
          schoolCode: school?.school_code,
        },
      };
      sendEmail(mailOptions, user.email!, user.role!, "school", school?.id ?? null);
    }

    return NextResponse.json(
      Utility.formatResponse(200, { token, id: user.id }),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      Utility.formatResponse(500, err),
      { status: 500 }
    );
  }
});
