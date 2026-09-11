import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

// Mapping of route endpoint names to Prisma model names
const MODEL_MAPPING: Record<string, { model: string; searchFields: string[] }> = {
  "employees": { model: "employee", searchFields: ["firstname", "lastname", "email"] },
  "employee": { model: "employee", searchFields: ["firstname", "lastname", "email"] },
  "classes": { model: "school_class", searchFields: ["name"] },
  "class": { model: "school_class", searchFields: ["name"] },
  "schools": { model: "school", searchFields: ["name", "email", "school_code", "director", "principal"] },
  "school": { model: "school", searchFields: ["name", "email", "school_code", "director", "principal"] },
  "teachers": { model: "teacher", searchFields: ["firstname", "lastname", "email"] },
  "teacher": { model: "teacher", searchFields: ["firstname", "lastname", "email"] },
  "students": { model: "student", searchFields: ["firstname", "lastname", "email", "session"] },
  "student": { model: "student", searchFields: ["firstname", "lastname", "email", "session"] },
  "buses": { model: "bus", searchFields: ["registration_no", "driver", "route"] },
  "bus": { model: "bus", searchFields: ["registration_no", "driver", "route"] },
  "noticeboards": { model: "noticeboard", searchFields: ["title", "description"] },
  "noticeboard": { model: "noticeboard", searchFields: ["title", "description"] },
  "notice": { model: "noticeboard", searchFields: ["title", "description"] },
  "payments": { model: "payment", searchFields: ["type_duration", "academic_year"] },
  "payment": { model: "payment", searchFields: ["type_duration", "academic_year"] },
  "payment-methods": { model: "payment_method", searchFields: ["name"] },
  "payment-method": { model: "payment_method", searchFields: ["name"] },
  "holidays": { model: "holiday", searchFields: ["title", "notes"] },
  "holiday": { model: "holiday", searchFields: ["title", "notes"] },
  "school-durations": { model: "school_duration", searchFields: [] },
  "school-duration": { model: "school_duration", searchFields: [] },
  "school-houses": { model: "school_house", searchFields: ["name", "color_code"] },
  "school-house": { model: "school_house", searchFields: ["name", "color_code"] },
  "time-tables": { model: "timetable", searchFields: ["batch", "duration"] },
  "time-table": { model: "timetable", searchFields: ["batch", "duration"] },
  "timetables": { model: "timetable", searchFields: ["batch", "duration"] },
  "timetable": { model: "timetable", searchFields: ["batch", "duration"] },
  "attendance": { model: "attendance", searchFields: [] },
  "user-roles": { model: "user_role", searchFields: ["name"] },
  "user-role": { model: "user_role", searchFields: ["name"] },
  "sections": { model: "section", searchFields: ["name"] },
  "section": { model: "section", searchFields: ["name"] },
  "subjects": { model: "subject", searchFields: ["name"] },
  "subject": { model: "subject", searchFields: ["name"] },
  "amenities": { model: "amenity", searchFields: ["name", "description"] },
  "amenity": { model: "amenity", searchFields: ["name", "description"] },
  "users": { model: "user", searchFields: ["username", "email", "contact_no"] },
  "user": { model: "user", searchFields: ["username", "email", "contact_no"] },
  "marksheets": { model: "marksheet", searchFields: ["session"] },
  "marksheet": { model: "marksheet", searchFields: ["session"] },
  "homeworks": { model: "homework", searchFields: ["title", "description"] },
  "homework": { model: "homework", searchFields: ["title", "description"] },
  "all-cities": { model: "city", searchFields: ["name"] },
  "cities": { model: "city", searchFields: ["name"] },
  "city": { model: "city", searchFields: ["name"] },
  "all-states": { model: "state", searchFields: ["name"] },
  "states": { model: "state", searchFields: ["name"] },
  "state": { model: "state", searchFields: ["name"] },
  "countries": { model: "country", searchFields: ["name", "country_code", "phone_code"] },
  "country": { model: "country", searchFields: ["name", "country_code", "phone_code"] },
};

async function handleGet(req: NextRequest, endpoint: string, params: string[]) {
  // Test endpoint
  if (endpoint === "test") {
    return new NextResponse("API Working Fine.", { status: 200 });
  }

  // Verify Token
  if (endpoint === "verify-token") {
    const authHeader = req.headers.get("x-access-token") || req.headers.get("authorization");
    const payload = Utility.verifyTokenString(authHeader as string);
    if (!payload) return NextResponse.json(Utility.formatResponse(401, "Unauthorized"), { status: 401 });
    return NextResponse.json(Utility.formatResponse(200, "Verified"), { status: 200 });
  }

  // Dashboard counts
  if (endpoint.startsWith("get-dashboard-count/") || endpoint === "get-dashboard-count") {
    const table = params[1] || endpoint.replace("get-dashboard-count/", "");
    const modelName = table === "school_class" ? "school_class" : table;
    try {
      const count = await (prisma as any)[modelName]?.count() || 0;
      return NextResponse.json(Utility.formatResponse(200, count), { status: 200 });
    } catch {
      return NextResponse.json(Utility.formatResponse(200, 0), { status: 200 });
    }
  }

  // School Classes mapping list
  if (endpoint === "get-school-classes" || endpoint === "get-teacher-classes") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const { searchParams } = new URL(req.url);
      const schoolId = searchParams.get("school_id")
        ? parseInt(searchParams.get("school_id")!)
        : (schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined);

      const where = schoolId ? Prisma.sql`WHERE scd.school_id = ${schoolId}` : Prisma.empty;
      const data = await prisma.$queryRaw`
        SELECT scd.id, scd.class_fee, scd.class_capacity, scd.late_fee, scd.late_fee_duration, scd.subject_ids,
               cl.id AS class_id, cl.name AS class_name,
               se.id AS section_id, se.name AS section_name
        FROM school_class_data scd
        LEFT JOIN class cl ON cl.id = scd.class_id
        LEFT JOIN section se ON se.id = scd.section_id
        ${where}
      `;
      return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Teacher detail by ID
  if (endpoint.startsWith("get-teacher-detail/")) {
    try {
      const teacherId = parseInt(endpoint.replace("get-teacher-detail/", ""), 10);
      const data = await prisma.$queryRaw`
        SELECT tcss.subject_ids, cl.id AS class_id, cl.name AS class_name, 
               se.id AS section_id, se.name AS section_name
        FROM teacher_class_section_subject tcss
        LEFT JOIN class cl ON cl.id = tcss.class_id
        LEFT JOIN section se ON se.id = tcss.section_id
        WHERE tcss.teacher_id = ${teacherId}
      `;
      return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Marksheet data by ID
  if (endpoint.startsWith("get-marksheet-data/")) {
    try {
      const marksheetId = parseInt(endpoint.replace("get-marksheet-data/", ""), 10);
      const data = await prisma.marksheet_data.findMany({
        where: { marksheet_id: marksheetId },
        orderBy: { subject_id: "asc" },
      });
      return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // ICard Details
  if (endpoint === "get-icard-details") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;
      const data = await prisma.school.findFirst({
        where: schoolId ? { id: schoolId } : {},
        select: { id: true, name: true, contact_no_1: true, email: true, board: true },
      });
      return NextResponse.json(Utility.formatResponse(200, data), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Generic List Handler for get-X endpoints
  if (endpoint.startsWith("get-")) {
    const entityKey = endpoint.replace("get-", "");
    const mapping = MODEL_MAPPING[entityKey];
    if (mapping) {
      return genericList(req, mapping.model, mapping.searchFields);
    }
  }

  return NextResponse.json(Utility.formatResponse(404, `Endpoint ${endpoint} not found`), { status: 404 });
}

async function handlePost(req: NextRequest, endpoint: string) {
  // Login Endpoint
  if (endpoint === "login") {
    try {
      const body = await req.json();
      const { email, username, password } = body;
      const userIdent = email || username;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userIdent },
            { username: userIdent },
            { contact_no: userIdent },
          ],
          status: "active",
        },
      });

      if (!user) {
        return NextResponse.json(Utility.formatResponse(200, "User does not exist"), { status: 200 });
      }

      const isValid = await Utility.comparePassword(password, user.password || "");
      if (!isValid) {
        return NextResponse.json(Utility.formatResponse(200, "Username and Password do not match"), { status: 200 });
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
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Role By ID
  if (endpoint === "get-role-by-id") {
    try {
      const body = await req.json();
      const roleId = typeof body === "object" ? body.id || body.roleId : body;
      const role = await prisma.user_role.findUnique({ where: { id: parseInt(String(roleId)) } });
      if (role) return NextResponse.json(Utility.formatResponse(200, role), { status: 200 });
      return NextResponse.json(Utility.formatResponse(404, "Role Not Found"), { status: 404 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Encrypt / Decrypt Text
  if (endpoint === "encrypt-text") {
    try {
      const body = await req.json();
      const encrypted = Utility.encryptText(JSON.stringify(body.data));
      return NextResponse.json(Utility.formatResponse(200, encrypted), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  if (endpoint === "decrypt-text") {
    try {
      const body = await req.json();
      const decrypted = Utility.decryptText(body.data?.encrypted_id, body.data?.vect);
      return NextResponse.json(Utility.formatResponse(200, decrypted ? JSON.parse(decrypted) : null), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // School Class Mapping
  if (endpoint === "create-school-class-mapping") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;
      const body = await req.json();
      const class_id = body[1] || body.class_id;
      const section_id = body[2] || body.section_id;
      const class_fee = parseFloat(body[0] || body.class_fee || 0);
      const subject_ids = String(body[3] || body.subject_ids || "");
      const late_fee = parseFloat(body[4] || body.late_fee || 0);
      const late_fee_duration = String(body[5] || body.late_fee_duration || "");
      const class_capacity = parseInt(body[6] || body.class_capacity || 0);

      await prisma.school_class_data.create({
        data: {
          school_id: schoolId,
          class_id: parseInt(String(class_id)),
          section_id: parseInt(String(section_id)),
          class_fee,
          subject_ids,
          late_fee,
          late_fee_duration,
          class_capacity,
        },
      });
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(409, String(err)), { status: 409 });
    }
  }

  // Teacher Class Mapping
  if (endpoint === "create-teacher-class-mapping") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;
      const body = await req.json();
      const teacher_id = body[0] || body.teacher_id;
      const class_id = body[1] || body.class_id;
      const section_id = body[2] || body.section_id;
      const subject_ids = String(body[3] || body.subject_ids || "");

      await prisma.teacher_class_section_subject.create({
        data: {
          school_id: schoolId,
          teacher_id: parseInt(String(teacher_id)),
          class_id: parseInt(String(class_id)),
          section_id: parseInt(String(section_id)),
          subject_ids,
        },
      });
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(409, String(err)), { status: 409 });
    }
  }

  // Marksheet Data mapping
  if (endpoint === "create-marksheet-data") {
    try {
      const body = await req.json();
      const { marksheet_id, subject_id, marks, max_marks, grade } = body;
      await prisma.marksheet_data.create({
        data: {
          marksheet_id: parseInt(String(marksheet_id)),
          subject_id: parseInt(String(subject_id)),
          marks: marks !== undefined ? parseFloat(String(marks)) : undefined,
          max_marks: max_marks !== undefined ? parseFloat(String(max_marks)) : undefined,
          grade: grade ?? null,
        },
      });
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(409, String(err)), { status: 409 });
    }
  }

  // Generic Create Handler for create-X endpoints
  if (endpoint.startsWith("create-")) {
    const entityKey = endpoint.replace("create-", "");
    const mapping = MODEL_MAPPING[entityKey];
    if (mapping) {
      const authHeader = req.headers.get("x-access-token") || req.headers.get("authorization");
      const payload = Utility.verifyTokenString(authHeader as string);
      const userId = payload ? (payload as any).id : 1;
      return genericCreate(req, mapping.model, userId);
    }
  }

  return NextResponse.json(Utility.formatResponse(404, `Endpoint ${endpoint} not found`), { status: 404 });
}

async function handlePatch(req: NextRequest, endpoint: string) {
  // Generic Update Handler for update-X endpoints
  if (endpoint.startsWith("update-")) {
    const entityKey = endpoint.replace("update-", "");
    const mapping = MODEL_MAPPING[entityKey];
    if (mapping) {
      const authHeader = req.headers.get("x-access-token") || req.headers.get("authorization");
      const payload = Utility.verifyTokenString(authHeader as string);
      const userId = payload ? (payload as any).id : 1;
      return genericUpdate(req, mapping.model, userId);
    }
  }

  return NextResponse.json(Utility.formatResponse(404, `Endpoint ${endpoint} not found`), { status: 404 });
}

async function handleDelete(req: NextRequest, endpoint: string) {
  // Delete from marksheet mapping
  if (endpoint === "delete-from-marksheet-mapping") {
    try {
      const body = await req.json();
      if (body?.marksheet_id) {
        await prisma.marksheet_data.deleteMany({
          where: { marksheet_id: parseInt(String(body.marksheet_id)) },
        });
      }
      return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Delete from school mapping
  if (endpoint === "delete-from-school-mapping") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;
      const body = await req.json();
      const where: any = {};
      if (schoolId) where.school_id = schoolId;
      if (body?.class_id) where.class_id = parseInt(String(body.class_id));
      if (body?.section_id) where.section_id = parseInt(String(body.section_id));
      await prisma.school_class_data.deleteMany({ where });
      return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Delete from teacher mapping
  if (endpoint === "delete-from-teacher-mapping") {
    try {
      const schoolCond = Utility.getSchoolIdFromHeader(req);
      const schoolId = schoolCond.school_id ? parseInt(String(schoolCond.school_id)) : undefined;
      const body = await req.json();
      const where: any = {};
      if (schoolId) where.school_id = schoolId;
      if (body?.teacher_id) where.teacher_id = parseInt(String(body.teacher_id));
      if (body?.class_id) where.class_id = parseInt(String(body.class_id));
      if (body?.section_id) where.section_id = parseInt(String(body.section_id));
      await prisma.teacher_class_section_subject.deleteMany({ where });
      return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  return NextResponse.json(Utility.formatResponse(404, `Endpoint ${endpoint} not found`), { status: 404 });
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const r = applyRateLimit(req); if (r) return r;
  const { slug } = await context.params;
  const endpoint = slug.join("/");
  return handleGet(req, endpoint, slug);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const r = applyRateLimit(req); if (r) return r;
  const { slug } = await context.params;
  const endpoint = slug.join("/");
  return handlePost(req, endpoint);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const r = applyRateLimit(req); if (r) return r;
  const { slug } = await context.params;
  const endpoint = slug.join("/");
  return handlePatch(req, endpoint);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const r = applyRateLimit(req); if (r) return r;
  const { slug } = await context.params;
  const endpoint = slug.join("/");
  return handleDelete(req, endpoint);
}
