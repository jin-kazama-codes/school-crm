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

function getSchoolFilter(request: NextRequest): Record<string, unknown> {
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

  const schoolFilter = getSchoolFilter(request);
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

export async function genericCreate(
  request: NextRequest,
  modelName: string,
  userId: number,
  returnId = false
) {
  const schoolFilter = getSchoolFilter(request);
  try {
    const payload = await request.json();
    const model = getModel(modelName);
    
    const dataToCreate: Record<string, unknown> = { ...payload, ...schoolFilter };
    if (MODELS_WITH_CREATED_BY.has(modelName)) {
      dataToCreate.created_by = userId;
    }

    const record = await model.create({
      data: dataToCreate,
    });
    if (returnId) {
      return NextResponse.json(Utility.formatResponse(200, { id: record.id }), { status: 200 });
    }
    return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(409, err), { status: 409 });
  }
}

export async function genericUpdate(
  request: NextRequest,
  modelName: string,
  userId: number
) {
  try {
    const payload = await request.json();
    const { id, ...updateData } = payload;
    const model = getModel(modelName);

    const dataToUpdate: Record<string, unknown> = { ...updateData };
    if (MODELS_WITH_UPDATED_BY.has(modelName)) {
      dataToUpdate.updated_by = userId;
    }

    await model.update({
      where: { id: parseInt(String(id)) },
      data: dataToUpdate,
    });
    return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
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
