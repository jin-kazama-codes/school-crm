import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import sendEmail from "@/lib/email";
import { applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/forgot-password
export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const payload = await request.json();
    const user = await prisma.user.findFirst({ where: { email: payload.email } });

    if (!user) {
      return NextResponse.json(Utility.formatResponse(200, "User does not exist"), { status: 200 });
    }

    const token = Utility.getSignedToken(user.id);
    const mailOptions = {
      from: process.env.SMTP_USER,
      template: "resetPw",
      to: user.email,
      subject: "Reset Password Link",
      context: {
        name: user.username
          ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
          : "",
        token,
        company: "The Skolar",
      },
    };

    sendEmail(mailOptions, user.email!, user.role!, "reset password", user.school_id ?? null);
    return NextResponse.json(Utility.formatResponse(200, "Success"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, String(err)), { status: 409 });
  }
}
