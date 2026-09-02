import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";
import { withAuth, applyRateLimit, verifyJwtToken } from "@/lib/apiHelpers";
import { genericList, genericCreate, genericUpdate } from "@/lib/crudHelpers";

// Mapping of route endpoint names to Prisma model names
const MODEL_MAPPING: Record<string, { model: string; searchFields: string[] }> = {
  "employees": { model: "employee", searchFields: ["firstname", "lastname", "email", "status"] },
  "employee": { model: "employee", searchFields: ["firstname", "lastname", "email", "status"] },
  "classes": { model: "school_class", searchFields: ["name", "status"] },
  "class": { model: "school_class", searchFields: ["name", "status"] },
  "schools": { model: "school", searchFields: ["name", "email", "school_code", "status"] },
  "school": { model: "school", searchFields: ["name", "email", "school_code", "status"] },
  "teachers": { model: "teacher", searchFields: ["firstname", "lastname", "email", "status"] },
  "teacher": { model: "teacher", searchFields: ["firstname", "lastname", "email", "status"] },
  "students": { model: "student", searchFields: ["firstname", "lastname", "email", "status"] },
  "student": { model: "student", searchFields: ["firstname", "lastname", "email", "status"] },
  "buses": { model: "bus", searchFields: ["bus_no", "driver_name", "status"] },
  "bus": { model: "bus", searchFields: ["bus_no", "driver_name", "status"] },
  "noticeboards": { model: "noticeboard", searchFields: ["title", "status"] },
  "notice": { model: "noticeboard", searchFields: ["title", "status"] },
  "payments": { model: "payment", searchFields: ["status"] },
  "payment": { model: "payment", searchFields: ["status"] },
  "payment-methods": { model: "payment_method", searchFields: ["name", "status"] },
  "payment-method": { model: "payment_method", searchFields: ["name", "status"] },
  "holidays": { model: "holiday", searchFields: ["name", "status"] },
  "holiday": { model: "holiday", searchFields: ["name", "status"] },
  "school-durations": { model: "school_duration", searchFields: ["name", "status"] },
  "school-duration": { model: "school_duration", searchFields: ["name", "status"] },
  "school-houses": { model: "school_house", searchFields: ["name", "status"] },
  "school-house": { model: "school_house", searchFields: ["name", "status"] },
  "time-tables": { model: "time_table", searchFields: ["status"] },
  "time-table": { model: "time_table", searchFields: ["status"] },
  "attendance": { model: "attendance", searchFields: ["status"] },
  "user-roles": { model: "user_role", searchFields: ["name", "status"] },
  "user-role": { model: "user_role", searchFields: ["name", "status"] },
  "sections": { model: "section", searchFields: ["name", "status"] },
  "section": { model: "section", searchFields: ["name", "status"] },
  "subjects": { model: "subject", searchFields: ["name", "status"] },
  "subject": { model: "subject", searchFields: ["name", "status"] },
  "amenities": { model: "amenity", searchFields: ["name", "status"] },
  "amenity": { model: "amenity", searchFields: ["name", "status"] },
  "users": { model: "user", searchFields: ["username", "email", "status"] },
  "user": { model: "user", searchFields: ["username", "email", "status"] },
  "all-cities": { model: "city", searchFields: ["name", "status"] },
  "city": { model: "city", searchFields: ["name", "status"] },
  "all-states": { model: "state", searchFields: ["name", "status"] },
  "state": { model: "state", searchFields: ["name", "status"] },
  "countries": { model: "country", searchFields: ["name", "status"] },
  "country": { model: "country", searchFields: ["name", "status"] },
};

async function handleGet(req: NextRequest, endpoint: string, params: string[]) {
  // Test endpoint
  if (endpoint === "test") {
    return new NextResponse("API Working Fine.", { status: 200 });
  }

  // Verify Token
  if (endpoint === "verify-token") {
    const authHeader = req.headers.get("x-access-token") || req.headers.get("authorization");
    const payload = verifyJwtToken(authHeader);
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
      const { email, username, password, school_code } = body;
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

      const isValid = await Utility.comparePassword(password, user.password);
      if (!isValid) {
        return NextResponse.json(Utility.formatResponse(200, "Username and Password do not match"), { status: 200 });
      }

      const token = Utility.generateJwtToken({ id: user.id });
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
      const encrypted = Utility.encrypt(JSON.stringify(body.data));
      return NextResponse.json(Utility.formatResponse(200, encrypted), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  if (endpoint === "decrypt-text") {
    try {
      const body = await req.json();
      const decrypted = Utility.decrypt(body.data);
      return NextResponse.json(Utility.formatResponse(200, JSON.parse(decrypted)), { status: 200 });
    } catch (err) {
      return NextResponse.json(Utility.formatResponse(500, String(err)), { status: 500 });
    }
  }

  // Generic Create Handler for create-X endpoints
  if (endpoint.startsWith("create-")) {
    const entityKey = endpoint.replace("create-", "");
    const mapping = MODEL_MAPPING[entityKey];
    if (mapping) {
      const authHeader = req.headers.get("x-access-token") || req.headers.get("authorization");
      const payload = verifyJwtToken(authHeader);
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
      const payload = verifyJwtToken(authHeader);
      const userId = payload ? (payload as any).id : 1;
      return genericUpdate(req, mapping.model, userId);
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
