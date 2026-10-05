/**
 * Generic CRUD helpers for standard Prisma operations.
 * Used by route handlers to reduce boilerplate.
 */
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  "school_duration",
  "user",
  "address"
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

  // Parse extra filter parameters from query string
  searchParams.forEach((value, key) => {
    if (["page", "size", "search"].includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    let field = key;
    if (key === "classId" || key === "class_id") field = "class";
    if (key === "sectionId" || key === "section_id") field = "section";
    if (key === "parentId") field = "parent_id";

    if (/^\d+$/.test(value)) {
      whereCondition[field] = parseInt(value, 10);
    } else if (value === "true" || value === "false") {
      whereCondition[field] = value === "true";
    } else {
      whereCondition[field] = value;
    }
  });

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

const STATIC_MODEL_FIELDS: Record<string, Record<string, string>> = {
  student: {
    id: "Int", school_id: "Int", parent_id: "Int", roll_no: "Int", enrollment_no: "Int",
    session: "String", firstname: "String", lastname: "String", mother_name: "String",
    mother_contact_no: "Decimal", mother_aadhar: "Decimal", father_name: "String",
    father_contact_no: "Decimal", father_aadhar: "Decimal", guardian_name: "String",
    guardian_contact_no: "Decimal", guardian_aadhar: "Decimal", contact_no: "String",
    email: "String", class: "Int", section: "Int", subjects: "String",
    admission_date: "DateTime", dob: "DateTime", is_specially_abled: "Boolean",
    is_taking_bus: "Boolean", is_fee_waiver: "Boolean", fee_waiver_type: "String",
    waived_fees: "Int", blood_group: "String", birth_mark: "String", religion: "String",
    nationality: "String", id_card: "String", aadhaar_no: "String", admission_type: "String",
    caste_group: "String", gender: "String", head: "Int", house: "String", status: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  teacher: {
    id: "Int", school_id: "Int", parent_id: "Int", firstname: "String", lastname: "String",
    email: "String", contact_no: "String", dob: "DateTime", religion: "String",
    nationality: "String", blood_group: "String", qualification: "String", achievements: "String",
    experience: "String", grade: "String", is_specially_abled: "Boolean", is_class_teacher: "Boolean",
    class: "Int", section: "Int", caste_group: "String", gender: "String", status: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  employee: {
    id: "Int", school_id: "Int", firstname: "String", lastname: "String", email: "String",
    contact_no: "String", role: "String", dob: "String", gender: "String", status: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  address: {
    id: "Int", school_id: "Int", parent: "String", parent_id: "Int", street: "String",
    landmark: "String", zipcode: "String", city: "Int", state: "Int", country: "Int",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  image: {
    id: "Int", school_id: "Int", parent: "String", parent_id: "Int", priority: "Int",
    type: "String", image_src: "String", created_at: "DateTime", updated_at: "DateTime",
    created_by: "Int", updated_by: "Int"
  },
  user: {
    id: "Int", school_id: "Int", username: "String", password: "String", email: "String",
    contact_no: "String", role: "Int", designation: "String", gender: "String", status: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  }
};

const MODEL_FIELDS_MAP: Record<string, Record<string, string>> = { ...STATIC_MODEL_FIELDS };

// Populate DMMF schema dynamically if available
if ((Prisma as any)?.dmmf?.datamodel?.models) {
  for (const m of (Prisma as any).dmmf.datamodel.models) {
    const fieldMap: Record<string, string> = {};
    for (const f of m.fields) {
      if (f.kind === "scalar" || f.kind === "enum") {
        fieldMap[f.name] = f.type;
      }
    }
    MODEL_FIELDS_MAP[m.name] = { ...MODEL_FIELDS_MAP[m.name], ...fieldMap };
  }
}

const ENUM_VALUE_MAPPINGS: Record<string, Record<string, string>> = {
  blood_group: {
    "A+": "A_POS",
    "A-": "A_NEG",
    "B+": "B_POS",
    "B-": "B_NEG",
    "AB+": "AB_POS",
    "AB-": "AB_NEG",
    "O+": "O_POS",
    "O-": "O_NEG",
    "A_POS": "A_POS",
    "A_NEG": "A_NEG",
    "B_POS": "B_POS",
    "B_NEG": "B_NEG",
    "AB_POS": "AB_POS",
    "AB_NEG": "AB_NEG",
    "O_POS": "O_POS",
    "O_NEG": "O_NEG",
  },
  type: {
    "co-ed": "co_ed",
    "co_ed": "co_ed",
  },
  sub_type: {
    "senior-sec": "senior_sec",
    "senior_sec": "senior_sec",
  },
  parent: {
    "sub-admin": "sub_admin",
    "sub_admin": "sub_admin",
  },
  payment_type: {
    "half-yearly": "half_yearly",
    "half_yearly": "half_yearly",
  }
};

function sanitizePayload(modelName: string, payload: Record<string, unknown>): Record<string, unknown> {
  const allowed = MODEL_ALLOWED_FIELDS[modelName];
  const fieldTypes = MODEL_FIELDS_MAP[modelName];

  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(payload)) {
    if (allowed && !allowed.has(key)) continue;

    if (fieldTypes) {
      const type = fieldTypes[key];
      // Skip fields that do not exist on the Prisma model
      if (!type) continue;
      if (val === undefined) continue;

      if (val === null || val === "") {
        if (type === "Int" || type === "Float" || type === "Decimal" || type === "DateTime") {
          sanitized[key] = null;
          continue;
        }
        if (type === "String") {
          sanitized[key] = "";
          continue;
        }
        sanitized[key] = null;
        continue;
      }

      if (modelName === "image" && key === "type") {
        const validTypes = new Set(["display", "banner", "normal", "parent"]);
        sanitized[key] = validTypes.has(String(val)) ? String(val) : "normal";
        continue;
      }

      if (ENUM_VALUE_MAPPINGS[key]) {
        const mapped = ENUM_VALUE_MAPPINGS[key][String(val)];
        if (mapped) {
          sanitized[key] = mapped;
          continue;
        }
      }

      if (type === "Int") {
        const parsed = parseInt(String(val), 10);
        sanitized[key] = isNaN(parsed) ? null : parsed;
      } else if (type === "Float") {
        const num = parseFloat(String(val));
        sanitized[key] = isNaN(num) ? null : num;
      } else if (type === "Decimal") {
        let strVal = String(val).trim();
        if (key.endsWith("_contact_no") || key.endsWith("_aadhar") || key.endsWith("_no")) {
          strVal = strVal.replace(/\..*$/, "");
        }
        sanitized[key] = strVal === "" || isNaN(Number(strVal)) ? null : strVal;
      } else if (type === "DateTime") {
        const d = new Date(String(val));
        sanitized[key] = isNaN(d.getTime()) ? null : d;
      } else if (type === "Boolean") {
        sanitized[key] = val === true || val === "true" || val === 1 || val === "1";
      } else {
        sanitized[key] = val;
      }
    } else {
      if (val === "" && (key.endsWith("_no") || key.endsWith("_id") || key.endsWith("_aadhar") || key.endsWith("_contact_no") || key === "class" || key === "section" || key === "dob" || key === "admission_date" || key === "waived_fees")) {
        sanitized[key] = null;
      } else {
        sanitized[key] = val;
      }
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
    if (MODELS_WITH_UPDATED_BY.has(modelName)) {
      dataToCreate.updated_by = userId;
    }
    if (MODELS_WITH_UPDATED_AT.has(modelName)) {
      dataToCreate.created_at = now;
      dataToCreate.updated_at = now;
    } else if (MODELS_WITH_CREATED_AT.has(modelName)) {
      dataToCreate.created_at = now;
    }

    if (modelName === "student") {
      // 1. Ensure head is set (default to 0 if not provided)
      if (dataToCreate.head === undefined || dataToCreate.head === null) {
        dataToCreate.head = 0;
      }

      // 2. Sequential roll_no per (school_id, class, section) if not explicitly set
      if (dataToCreate.roll_no === undefined || dataToCreate.roll_no === null) {
        const rollFilter: Record<string, unknown> = {};
        if (typeof dataToCreate.school_id === "number") rollFilter.school_id = dataToCreate.school_id;
        if (typeof dataToCreate.class === "number") rollFilter.class = dataToCreate.class;
        if (typeof dataToCreate.section === "number") rollFilter.section = dataToCreate.section;

        const lastStudentWithRoll = await prisma.student.findFirst({
          where: rollFilter,
          orderBy: { roll_no: "desc" },
          select: { roll_no: true },
        });
        dataToCreate.roll_no = (lastStudentWithRoll?.roll_no ?? 0) + 1;
      }

      // 3. Sequential enrollment_no (Academic year + 4-digit sequence, e.g. 20250001) if not explicitly set
      if (dataToCreate.enrollment_no === undefined || dataToCreate.enrollment_no === null) {
        let year = new Date().getFullYear();
        if (typeof dataToCreate.session === "string") {
          const match = dataToCreate.session.match(/^(\d{4})/);
          if (match) {
            year = parseInt(match[1], 10);
          }
        }
        const base = year * 10000;
        const enrollmentFilter: Record<string, unknown> = {
          enrollment_no: {
            gte: base,
            lt: base + 10000,
          },
        };
        if (typeof dataToCreate.school_id === "number") {
          enrollmentFilter.school_id = dataToCreate.school_id;
        }

        const lastEnrollmentStudent = await prisma.student.findFirst({
          where: enrollmentFilter,
          orderBy: { enrollment_no: "desc" },
          select: { enrollment_no: true },
        });
        dataToCreate.enrollment_no = (lastEnrollmentStudent?.enrollment_no ?? base) + 1;
      }
    }

    if (modelName === "image") {
      const inserted = await prisma.$queryRawUnsafe<any[]>(
        `INSERT INTO "public"."image" ("school_id", "parent", "parent_id", "type", "image_src", "created_at", "updated_at", "created_by")
         VALUES ($1, CAST($2::text AS "public"."ImageParent"), $3, CAST($4::text AS "public"."ImageType"), $5, $6, $7, $8)
         RETURNING id, school_id, parent, parent_id, priority, type, image_src, created_at, updated_at, created_by, updated_by`,
        dataToCreate.school_id ?? null,
        String(dataToCreate.parent || "student"),
        typeof dataToCreate.parent_id === "number" ? dataToCreate.parent_id : parseInt(String(dataToCreate.parent_id)),
        String(dataToCreate.type || "normal"),
        String(dataToCreate.image_src || ""),
        now,
        now,
        userId ?? null
      );
      const record = inserted[0] || {};
      if (returnId) {
        return NextResponse.json(Utility.formatResponse(200, { id: record.id, school_id: record.school_id }), { status: 200 });
      }
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    }

    const record = await model.create({
      data: dataToCreate,
    });
    if (returnId) {
      return NextResponse.json(Utility.formatResponse(200, { id: record.id, school_id: record.school_id }), { status: 200 });
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
    const explicitUpdatedBy = payload.updated_by ? parseInt(String(payload.updated_by), 10) : undefined;
    const finalUserId = (userId && userId > 0) ? userId : (explicitUpdatedBy && explicitUpdatedBy > 0 ? explicitUpdatedBy : 1);

    if (MODELS_WITH_UPDATED_BY.has(modelName)) {
      dataToUpdate.updated_by = finalUserId;
    }
    if (MODELS_WITH_UPDATED_AT.has(modelName)) {
      dataToUpdate.updated_at = new Date();
    }

    if (modelName === "image") {
      await prisma.$executeRawUnsafe(
        `UPDATE "public"."image"
         SET "school_id" = COALESCE($1, "school_id"),
             "parent" = CAST(COALESCE($2::text, "parent"::text) AS "public"."ImageParent"),
             "parent_id" = COALESCE($3, "parent_id"),
             "type" = CAST(COALESCE($4::text, "type"::text) AS "public"."ImageType"),
             "image_src" = COALESCE($5, "image_src"),
             "updated_at" = $6,
             "updated_by" = $7
         WHERE id = $8`,
        dataToUpdate.school_id ?? null,
        dataToUpdate.parent ? String(dataToUpdate.parent) : null,
        typeof dataToUpdate.parent_id === "number" ? dataToUpdate.parent_id : (dataToUpdate.parent_id ? parseInt(String(dataToUpdate.parent_id)) : null),
        dataToUpdate.type ? String(dataToUpdate.type) : null,
        dataToUpdate.image_src ? String(dataToUpdate.image_src) : null,
        new Date(),
        userId ?? null,
        parseInt(String(id))
      );
      return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
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
