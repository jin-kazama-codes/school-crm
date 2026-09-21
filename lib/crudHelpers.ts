/**
 * Generic CRUD helpers for standard Prisma operations.
 * Used by route handlers to reduce boilerplate.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Utility from "@/lib/utility";

type PrismaModelName = keyof typeof prisma;

function getModel(modelName: string): any {
  return (prisma as any)[modelName];
}

const MODELS_WITH_SCHOOL_ID = new Set([
  "student", "teacher", "employee", "bus", "holiday",
  "homework", "noticeboard", "school_house", "payment",
  "school_class_data", "marksheet", "attendance", "timetable", "image",
  "school_duration"
]);

function getSchoolFilter(request: NextRequest, modelName?: string): Record<string, unknown> {
  if (modelName && !MODELS_WITH_SCHOOL_ID.has(modelName)) {
    return {};
  }
  const cond = Utility.getSchoolIdFromHeader(request);
  if (!cond.school_id) return {};
  return { school_id: parseInt(String(cond.school_id)) };
}

const MODELS_WITH_UPDATED_AT = new Set([
  "user_role", "school", "user", "student", "teacher", "employee",
  "address", "image", "marksheet", "payment", "payment_method",
  "amenity", "bus", "school_class", "section", "subject",
  "holiday", "homework", "noticeboard"
]);

const MODELS_WITH_CREATED_AT = new Set([
  "attendance", "school_house"
]);

const MODELS_WITH_UPDATED_BY = new Set([
  "user_role", "school", "user", "student", "teacher", "employee",
  "address", "image", "marksheet", "payment", "payment_method",
  "amenity", "bus", "school_class", "section", "subject",
  "holiday", "homework", "noticeboard"
]);

const MODELS_WITH_CREATED_BY = new Set([
  "user_role", "school", "user", "student", "teacher", "employee",
  "address", "image", "marksheet", "payment", "payment_method",
  "amenity", "bus", "school_class", "section", "subject",
  "holiday", "homework", "noticeboard", "school_house"
]);

function getDefaultOrderBy(modelName: string): Record<string, string> {
  if (MODELS_WITH_UPDATED_AT.has(modelName)) {
    return { updated_at: "desc" };
  }
  if (MODELS_WITH_CREATED_AT.has(modelName)) {
    return { created_at: "desc" };
  }
  return { id: "desc" };
}

export async function genericList(
  request: NextRequest,
  modelName: string,
  searchFields: string[] = [],
  orderBy?: Record<string, string>
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "5");
  const search = searchParams.get("search") || "";
  const { limit, offset } = Utility.getPagination(page, size);

  const schoolFilter = getSchoolFilter(request, modelName);
  const whereCondition: Record<string, unknown> = { ...schoolFilter };

  if (search && searchFields.length > 0) {
    whereCondition.OR = searchFields.map((f) => ({
      [f]: { contains: search, mode: "insensitive" },
    }));
  }

  const finalOrderBy = orderBy || getDefaultOrderBy(modelName);

  try {
    const model = getModel(modelName);
    const [rows, count] = await Promise.all([
      model.findMany({
        where: whereCondition,
        orderBy: finalOrderBy,
        take: limit,
        skip: offset,
      }),
      model.count({ where: whereCondition }),
    ]);

    if (count > 0) {
      return NextResponse.json(Utility.formatResponse(200, { count, rows }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}

const MODEL_ALLOWED_FIELDS: Record<string, Set<string>> = {
  school_class: new Set(["name", "status"]),
  section: new Set(["name", "status"]),
  subject: new Set(["name", "status"]),
  amenity: new Set(["name", "description", "status"]),
  payment_method: new Set(["name"]),
  user_role: new Set(["name", "priority", "status"]),
};

function sanitizePayload(modelName: string, payload: Record<string, unknown>): Record<string, unknown> {
  const allowed = MODEL_ALLOWED_FIELDS[modelName];
  if (!allowed) return { ...payload };
  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(payload)) {
    if (allowed.has(key)) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
}

export async function genericCreate(
  request: NextRequest,
  modelName: string,
  userId: number,
  returnId = false
) {
  const schoolFilter = getSchoolFilter(request, modelName);
  try {
    const rawPayload = await request.json();
    const payload = sanitizePayload(modelName, rawPayload);
    const model = getModel(modelName);
    
    const now = new Date();
    const dataToCreate: Record<string, unknown> = { ...payload, ...schoolFilter };
    if (MODELS_WITH_CREATED_BY.has(modelName)) {
      dataToCreate.created_by = userId;
    }
    if (MODELS_WITH_UPDATED_AT.has(modelName)) {
      dataToCreate.created_at = now;
      dataToCreate.updated_at = now;
    } else if (MODELS_WITH_CREATED_AT.has(modelName)) {
      dataToCreate.created_at = now;
    }

    const record = await model.create({
      data: dataToCreate,
    });
    if (returnId) {
      return NextResponse.json(Utility.formatResponse(200, { id: record.id }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(Utility.formatResponse(409, err?.message || String(err)), { status: 409 });
  }
}

export async function genericUpdate(
  request: NextRequest,
  modelName: string,
  userId: number
) {
  try {
    const payload = await request.json();
    const { id, ...rawUpdateData } = payload;
    const updateData = sanitizePayload(modelName, rawUpdateData);
    const model = getModel(modelName);

    const dataToUpdate: Record<string, unknown> = { ...updateData };
    if (MODELS_WITH_UPDATED_BY.has(modelName)) {
      dataToUpdate.updated_by = userId;
    }
    if (MODELS_WITH_UPDATED_AT.has(modelName)) {
      dataToUpdate.updated_at = new Date();
    }

    await model.update({
      where: { id: parseInt(String(id)) },
      data: dataToUpdate,
    });
    return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(Utility.formatResponse(500, err?.message || String(err)), { status: 500 });
  }
}

export async function genericDelete(
  request: NextRequest,
  modelName: string,
  whereClause: Record<string, unknown>
) {
  try {
    const model = getModel(modelName);
    await model.deleteMany({ where: whereClause });
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
