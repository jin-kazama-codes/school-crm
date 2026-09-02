import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/user/login
export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const payload = await request.json();

    if (!payload.email && !payload.contact_no) {
      return NextResponse.json(
        Utility.formatResponse(200, "Email or contact number is required"),
        { status: 200 }
      );
    }

    const searchCriteria: Record<string, unknown>[] = [];
    if (payload.email) {
      searchCriteria.push({ email: payload.email });
      searchCriteria.push({ username: payload.email });
      searchCriteria.push({ contact_no: payload.email });
    }
    if (payload.contact_no) {
      searchCriteria.push({ contact_no: payload.contact_no });
    }

    const user = await prisma.user.findFirst({
      where: { OR: searchCriteria, status: "active" },
    });

    if (!user) {
      return NextResponse.json(
        Utility.formatResponse(200, "User does not exist"),
        { status: 200 }
      );
    }

    if (user && user.school_id) {
      const encrypted_school_info = Utility.encryptText(user.school_id.toString());
      const school = await prisma.school.findFirst({
        where: { id: user.school_id, status: "active" },
      });

      if (!school) {
        return NextResponse.json(
          Utility.formatResponse(200, "User does not exist"),
          { status: 200 }
        );
      }

      const isMatch = await Utility.comparePassword(
        payload.password,
        user.password!
      );
      if (isMatch) {
        const token = Utility.getSignedToken(user.id);
        return NextResponse.json(
          Utility.formatResponse(200, {
            token,
            school_info: encrypted_school_info,
            school_name: school.name,
            school_capacity: school.capacity,
            school_id: school.id,
            id: user.id,
            role: user.role,
            designation: user.designation,
            username: user.username,
          }),
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          Utility.formatResponse(200, "Username and Password do not match"),
          { status: 200 }
        );
      }
    } else {
      const isMatch = await Utility.comparePassword(
        payload.password,
        user.password!
      );
      if (isMatch) {
        if (user.role !== 1) {
          return NextResponse.json(
            Utility.formatResponse(200, "User Didn't have any school"),
            { status: 200 }
          );
        }
        const token = Utility.getSignedToken(user.id);
        return NextResponse.json(
          Utility.formatResponse(200, {
            token,
            id: user.id,
            role: user.role,
            username: user.username,
          }),
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          Utility.formatResponse(200, "Username and Password do not match"),
          { status: 200 }
        );
      }
    }
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      Utility.formatResponse(500, err),
      { status: 500 }
    );
  }
}
