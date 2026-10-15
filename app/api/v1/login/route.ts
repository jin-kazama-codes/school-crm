import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { applyRateLimit } from "@/lib/apiHelpers";

// POST /api/v1/login
export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request);
  if (rateLimit) return rateLimit;

  try {
    const payload = await request.json();
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const contact_no = typeof payload.contact_no === "string" ? payload.contact_no.trim() : "";
    const password = typeof payload.password === "string" ? payload.password.trim() : "";

    if (!email && !contact_no) {
      return NextResponse.json(
        Utility.formatResponse(200, "Email or contact number is required"),
        { status: 200 }
      );
    }

    const searchCriteria: Record<string, unknown>[] = [];
    if (email) {
      searchCriteria.push({ email: { equals: email, mode: "insensitive" } });
      searchCriteria.push({ username: { equals: email, mode: "insensitive" } });
      searchCriteria.push({ contact_no: email });
    }
    if (contact_no) {
      searchCriteria.push({ contact_no: contact_no });
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

    let isMatch = await Utility.comparePassword(password, user.password!);
    if (!isMatch && payload.password && payload.password !== password) {
      isMatch = await Utility.comparePassword(payload.password, user.password!);
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

      if (isMatch) {
        let studentProfile: any = null;
        if (user.role === 6) {
          const enrollNum = user.username ? parseInt(user.username, 10) : NaN;
          const rawStudent = await prisma.student.findFirst({
            where: {
              OR: [
                { user_id: user.id },
                ...(!isNaN(enrollNum) ? [{ enrollment_no: enrollNum }] : []),
              ],
            },
            select: {
              id: true,
              school_id: true,
              firstname: true,
              lastname: true,
              class: true,
              section: true,
              roll_no: true,
              enrollment_no: true,
            },
          });

          if (rawStudent) {
            const classRec = rawStudent.class ? await prisma.school_class.findUnique({ where: { id: rawStudent.class } }) : null;
            const secRec = rawStudent.section ? await prisma.section.findUnique({ where: { id: rawStudent.section } }) : null;
            const imgRec = await prisma.image.findFirst({
              where: { parent: "student" as any, parent_id: rawStudent.id },
              orderBy: { id: "desc" },
            });
            const fullName = `${rawStudent.firstname || ""} ${rawStudent.lastname || ""}`.trim();

            studentProfile = {
              ...rawStudent,
              fullName: fullName || "Student",
              name: fullName || "Student",
              class_name: classRec?.name || (rawStudent.class ? String(rawStudent.class) : null),
              section_name: secRec?.name || (rawStudent.section ? String(rawStudent.section) : null),
              photo_url: imgRec?.image_src || null,
            };
          }
        }

        const token = Utility.getSignedToken(user.id);
        return NextResponse.json(
          Utility.formatResponse(200, {
            token,
            school_info: encrypted_school_info,
            school_name: school.name,
            school_code: school.school_code,
            school_capacity: school.capacity,
            school_id: school.id,
            id: user.id,
            role: user.role,
            rolePriority: user.role,
            designation: user.designation || (user.role === 6 ? "student" : undefined),
            username: user.username,
            student: studentProfile,
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
      Utility.formatResponse(500, String(err)),
      { status: 500 }
    );
  }
}
