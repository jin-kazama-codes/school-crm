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
  "address",
  "question_bank",
  "exam_paper"
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
  "holiday", "homework", "noticeboard",
  "question_bank", "exam_paper"
]);

const MODELS_WITH_CREATED_AT = new Set([
  "attendance", "school_house", "question_bank", "exam_paper"
]);

const MODELS_WITH_UPDATED_BY = new Set([
  "user_role", "school", "user", "student", "teacher", "employee",
  "address", "image", "marksheet", "payment", "payment_method",
  "amenity", "bus", "school_class", "section", "subject",
  "holiday", "homework", "noticeboard",
  "question_bank", "exam_paper"
]);

const MODELS_WITH_CREATED_BY = new Set([
  "user_role", "school", "user", "student", "teacher", "employee",
  "address", "image", "marksheet", "payment", "payment_method",
  "amenity", "bus", "school_class", "section", "subject",
  "holiday", "homework", "noticeboard", "school_house",
  "question_bank", "exam_paper"
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
    id: "Int", school_id: "Int", parent_id: "Int", user_id: "Int", roll_no: "Int", enrollment_no: "Int",
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
  },
  payment: {
    id: "Int", school_id: "Int", student_id: "Int", method: "Int",
    fee: "String", type: "String", type_duration: "String", academic_year: "String",
    amount: "Float", final_amount: "Float", late_fee: "Float", discount_percent: "Float",
    status: "String", reference_no: "String", receipt_url: "String",
    due_date: "DateTime", created_at: "DateTime", updated_at: "DateTime",
    created_by: "Int", updated_by: "Int"
  },
  payment_method: {
    id: "Int", name: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  bus: {
    id: "Int", school_id: "Int", registration_no: "String", driver: "String",
    driver_contact: "String", driver_license: "String", conductor: "String",
    conductor_contact: "String", conductor_aadhaar: "String", route: "String",
    capacity: "Int", gps_device_id: "String", status: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  holiday: {
    id: "Int", school_id: "Int", title: "String", startDate: "DateTime", endDate: "DateTime",
    type: "String", notes: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  marksheet: {
    id: "Int", school_id: "Int", student_id: "Int", class_id: "Int", section_id: "Int",
    session: "String", term: "String", result: "String", co_scholastic_data: "Json", discipline_data: "Json",
    overall_remark: "String",
    created_at: "DateTime", updated_at: "DateTime", created_by: "Int", updated_by: "Int"
  },
  attendance: {
    id: "Int", school_id: "Int", parent: "String", parent_id: "Int", class_id: "Int",
    section_id: "Int", date: "DateTime", status: "String", remark: "String",
    created_at: "DateTime"
  },
  school_duration: {
    id: "Int", school_id: "Int", batch: "String", period: "Int", halves: "Int",
    recess_time: "Int", first_half_period_duration: "Int", second_half_period_duration: "Int",
    cutoff_time: "Int", opening_time: "DateTime", closing_time: "DateTime",
    shifts: "String", eve_opening_time: "DateTime", eve_closing_time: "DateTime",
    employee_entry_time: "DateTime", employee_exit_time: "DateTime"
  },
  timetable: {
    id: "Int", school_id: "Int", class_id: "Int", section_id: "Int", subject_id: "Int",
    period: "Int", duration: "String", day: "String", batch: "String"
  },
  question_bank: {
    id: "Int", school_id: "Int", class_id: "Int", section_id: "Int", subject_id: "Int",
    chapter: "String", mode: "String", question_text: "String",
    option_a: "String", option_b: "String", option_c: "String", option_d: "String",
    correct_option: "String", difficulty_level: "String", max_marks: "Float",
    status: "String", created_at: "DateTime", updated_at: "DateTime",
    created_by: "Int", updated_by: "Int"
  },
  exam_paper: {
    id: "Int", school_id: "Int", class_id: "Int", section_id: "Int", subject_id: "Int",
    title: "String", paper_code: "String", duration_minutes: "Int",
    max_marks: "Float", passing_marks: "Float", instructions: "String",
    sections_json: "String", status: "String", exam_date: "DateTime",
    start_time: "String", end_time: "String", academic_year: "String",
    created_at: "DateTime", updated_at: "DateTime",
    created_by: "Int", updated_by: "Int"
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
  const modelFields = MODEL_FIELDS_MAP[modelName];

  // Parse extra filter parameters from query string
  searchParams.forEach((value, key) => {
    if (["page", "size", "search"].includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    let field = key;
    if (key === "classId" || key === "class_id") {
      field = modelFields && "class" in modelFields ? "class" : "class_id";
    } else if (key === "sectionId" || key === "section_id") {
      field = modelFields && "section" in modelFields ? "section" : "section_id";
    } else if (key === "subjectId" || key === "subject_id") {
      field = modelFields && "subject" in modelFields ? "subject" : "subject_id";
    } else if (key === "parentId") {
      field = "parent_id";
    } else if (key === "studentId" || key === "student_id") {
      field = "student_id";
    } else if (key === "teacherId" || key === "teacher_id") {
      field = "teacher_id";
    } else if (key === "employeeId" || key === "employee_id") {
      field = "employee_id";
    } else if (key === "schoolId" || key === "school_id") {
      field = "school_id";
    }

    if (modelFields && !(field in modelFields)) {
      return; // Skip parameters that do not exist on the target model
    }

    const fieldType = modelFields?.[field];

    if (fieldType === "Int" || /^\d+$/.test(value)) {
      whereCondition[field] = parseInt(value, 10);
    } else if (fieldType === "Float" || fieldType === "Decimal") {
      whereCondition[field] = parseFloat(value);
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
    if (!model) {
      // Dynamic raw SQL fallback when model is not yet compiled into Prisma Client
      const conditions: string[] = [];
      const values: any[] = [];

      Object.entries(whereCondition).forEach(([col, val]) => {
        if (col === "OR") return;
        if (val !== undefined && val !== null) {
          values.push(val);
          conditions.push(`"${col}" = $${values.length}`);
        }
      });

      if (search && searchFields.length > 0) {
        values.push(`%${search}%`);
        const searchIdx = values.length;
        const orSql = searchFields.map((f) => `"${f}"::text ILIKE $${searchIdx}`).join(" OR ");
        conditions.push(`(${orSql})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `
        SELECT *, COUNT(*) OVER() AS count
        FROM "public"."${modelName}"
        ${whereClause}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const rows = await prisma.$queryRawUnsafe<any[]>(query, ...values);
      if (rows && rows.length > 0) {
        const count = Number(rows[0]?.count || 0);
        const cleanRows = rows.map(({ count: _c, ...rest }) => rest);
        return NextResponse.json(Utility.formatResponse(200, { count, rows: cleanRows }), { status: 200 });
      }
      return NextResponse.json(Utility.formatResponse(404, "No Data Found"), { status: 404 });
    }

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
  } catch (err: any) {
    console.error(`[genericList Error for ${modelName}]:`, err);
    return NextResponse.json(Utility.formatResponse(500, err?.message || String(err)), { status: 500 });
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
      } else if (type === "Json") {
        if (typeof val === "string") {
          try {
            sanitized[key] = JSON.parse(val);
          } catch {
            sanitized[key] = val;
          }
        } else {
          sanitized[key] = val;
        }
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

export async function provisionStudentUser(
  studentId: number,
  userId?: number,
  force = false,
  now: Date = new Date()
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    student_id: number;
    user_id: number;
    username: string;
    password: string;
    role: string;
    student_name: string;
    classGrade: number;
    minThreshold: number | null;
  };
}> {
  try {
    let student: any = null;
    try {
      student = await prisma.student.findUnique({
        where: { id: studentId }
      });
    } catch {
      const rows = await prisma.$queryRaw<any[]>(
        Prisma.sql`SELECT * FROM "student" WHERE id = ${studentId} LIMIT 1`
      );
      student = rows?.[0] || null;
    }

    if (!student) {
      return { success: false, message: "Student record not found" };
    }

    // Ensure student.user_id is read directly from database if client DMMF is stale
    if (student.user_id === undefined) {
      const uRows = await prisma.$queryRaw<any[]>(
        Prisma.sql`SELECT user_id FROM "student" WHERE id = ${studentId} LIMIT 1`
      );
      student.user_id = uRows?.[0]?.user_id ?? null;
    }

    let school: any = null;
    if (student.school_id) {
      try {
        const sRows = await prisma.$queryRaw<any[]>(
          Prisma.sql`SELECT id, school_code, student_login_min_class FROM "school" WHERE id = ${student.school_id} LIMIT 1`
        );
        school = sRows?.[0] || null;
      } catch {
        const sRows = await prisma.$queryRaw<any[]>(
          Prisma.sql`SELECT id, school_code FROM "school" WHERE id = ${student.school_id} LIMIT 1`
        );
        school = sRows?.[0] || null;
      }
    }

    let classGrade = 0;
    if (student.class) {
      const classRec = await prisma.school_class.findUnique({
        where: { id: student.class },
        select: { id: true, name: true }
      });

      if (classRec) {
        const romanMap: Record<string, number> = {
          'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
          'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12, 'XIII': 13
        };
        const nameTrim = (classRec.name || '').trim().toUpperCase();
        if (romanMap[nameTrim]) {
          classGrade = romanMap[nameTrim];
        } else {
          const digits = parseInt(nameTrim.replace(/\D/g, ''), 10);
          classGrade = !isNaN(digits) ? digits : classRec.id;
        }
      } else {
        classGrade = Number(student.class) || 0;
      }
    }

    const minThreshold = school?.student_login_min_class ?? null;

    // If threshold configured and not forced, ensure student meets class threshold
    if (!force && minThreshold !== null && minThreshold !== undefined) {
      if (classGrade < minThreshold) {
        return {
          success: false,
          message: `Student class (Grade ${classGrade || 'N/A'}) does not meet school threshold (Class ${minThreshold} & above).`
        };
      }
    }

    const username = String(student.enrollment_no || student.id);
    const schoolCode = school?.school_code || (student.school_id ? `SCH${1000 + student.school_id - 1}` : "SCH1000");
    const rawPassword = `${(student.firstname || "Student").trim().replace(/\s+/g, "")}@${schoolCode}`;
    const hashedPassword = await Utility.createHash(rawPassword);

    let studentUser = null;
    if (student.user_id) {
      studentUser = await prisma.user.findUnique({ where: { id: student.user_id } });
    }

    if (!studentUser && student.school_id) {
      studentUser = await prisma.user.findFirst({
        where: {
          school_id: student.school_id,
          username: username
        }
      });
    }

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          school_id: student.school_id,
          username: username,
          password: hashedPassword,
          email: student.email || null,
          contact_no: student.contact_no ? String(student.contact_no) : null,
          role: 6,
          designation: "student",
          status: "active",
          created_at: now,
          updated_at: now,
          created_by: userId ?? null
        }
      });
    } else {
      studentUser = await prisma.user.update({
        where: { id: studentUser.id },
        data: {
          password: hashedPassword,
          role: 6,
          designation: "student",
          status: "active",
          updated_at: now,
          updated_by: userId ?? null
        }
      });
    }

    if (student.user_id !== studentUser.id) {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "student" SET "user_id" = ${studentUser.id} WHERE "id" = ${student.id}`
      );
    }

    const studentFullName = `${student.firstname || ''} ${student.lastname || ''}`.trim() || username;

    return {
      success: true,
      data: {
        student_id: student.id,
        user_id: studentUser.id,
        username: studentUser.username || username,
        password: rawPassword,
        role: "student",
        student_name: studentFullName,
        classGrade,
        minThreshold
      }
    };
  } catch (err) {
    console.error("Error in provisionStudentUser:", err);
    return { success: false, message: String(err) };
  }
}

async function autoGenerateStudentUserIfEligible(
  record: any,
  userId?: number,
  now: Date = new Date()
): Promise<{ user_id: number; username: string; password: string; role: string; classGrade: number; minThreshold: number } | null> {
  if (!record || !record.id || !record.school_id || !record.class || record.user_id) {
    return null;
  }
  const result = await provisionStudentUser(record.id, userId, false, now);
  if (result.success && result.data) {
    return {
      user_id: result.data.user_id,
      username: result.data.username,
      password: result.data.password,
      role: result.data.role,
      classGrade: result.data.classGrade,
      minThreshold: result.data.minThreshold ?? 0
    };
  }
  return null;
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

    if (modelName === "attendance") {
      const inserted = await prisma.$queryRawUnsafe<any[]>(
        `INSERT INTO "public"."attendance" ("school_id", "parent", "parent_id", "class_id", "section_id", "date", "status", "remark", "created_at")
         VALUES ($1, CAST($2::text AS "public"."AttendanceParent"), $3, $4, $5, $6, CAST($7::text AS "public"."AttendanceStatus"), $8, $9)
         RETURNING id, school_id, parent, parent_id, class_id, section_id, date, status, remark, created_at`,
        dataToCreate.school_id ? parseInt(String(dataToCreate.school_id)) : null,
        dataToCreate.parent ? String(dataToCreate.parent).toLowerCase() : null,
        dataToCreate.parent_id ? parseInt(String(dataToCreate.parent_id)) : null,
        dataToCreate.class_id ? parseInt(String(dataToCreate.class_id)) : null,
        dataToCreate.section_id ? parseInt(String(dataToCreate.section_id)) : null,
        dataToCreate.date ? new Date(String(dataToCreate.date)) : now,
        dataToCreate.status ? String(dataToCreate.status).toLowerCase() : "present",
        dataToCreate.remark ? String(dataToCreate.remark) : null,
        now
      );
      const record = inserted[0] || {};
      if (returnId) {
        return NextResponse.json(Utility.formatResponse(200, { id: record.id, school_id: record.school_id }), { status: 200 });
      }
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    }

    if (!model) {
      const cols: string[] = [];
      const placeholders: string[] = [];
      const values: any[] = [];

      Object.entries(dataToCreate).forEach(([col, val]) => {
        if (val !== undefined) {
          cols.push(`"${col}"`);
          values.push(val);
          placeholders.push(`$${values.length}`);
        }
      });

      if (cols.length === 0) {
        return NextResponse.json(Utility.formatResponse(400, "No valid data provided"), { status: 400 });
      }

      const query = `
        INSERT INTO "public"."${modelName}" (${cols.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

      const inserted = await prisma.$queryRawUnsafe<any[]>(query, ...values);
      const record = inserted[0] || {};
      let studentCredentials: any = null;
      if (modelName === "student") {
        studentCredentials = await autoGenerateStudentUserIfEligible(record, userId, now);
      }
      if (returnId) {
        return NextResponse.json(Utility.formatResponse(200, {
          id: record.id,
          school_id: record.school_id,
          enrollment_no: record.enrollment_no,
          roll_no: record.roll_no,
          user_id: studentCredentials?.user_id || record.user_id || null,
          ...(studentCredentials ? { student_credentials: studentCredentials } : {})
        }), { status: 200 });
      }
      return NextResponse.json(Utility.formatResponse(200, "Created Successfully"), { status: 200 });
    }

    const record = await model.create({
      data: dataToCreate,
    });
    let studentCredentials: any = null;
    if (modelName === "student") {
      studentCredentials = await autoGenerateStudentUserIfEligible(record, userId, now);
    }
    if (returnId) {
      return NextResponse.json(Utility.formatResponse(200, {
        id: record.id,
        school_id: record.school_id,
        enrollment_no: record.enrollment_no,
        roll_no: record.roll_no,
        user_id: studentCredentials?.user_id || record.user_id || null,
        ...(studentCredentials ? { student_credentials: studentCredentials } : {})
      }), { status: 200 });
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

    if (modelName === "attendance") {
      await prisma.$executeRawUnsafe(
        `UPDATE "public"."attendance"
         SET "status" = CAST(COALESCE($1::text, "status"::text) AS "public"."AttendanceStatus"),
             "remark" = $2,
             "date" = COALESCE($3, "date"),
             "school_id" = COALESCE($4, "school_id"),
             "parent" = CAST(COALESCE($5::text, "parent"::text) AS "public"."AttendanceParent"),
             "parent_id" = COALESCE($6, "parent_id"),
             "class_id" = COALESCE($7, "class_id"),
             "section_id" = COALESCE($8, "section_id")
         WHERE id = $9`,
        dataToUpdate.status ? String(dataToUpdate.status).toLowerCase() : null,
        dataToUpdate.remark !== undefined ? (dataToUpdate.remark || null) : null,
        dataToUpdate.date ? new Date(String(dataToUpdate.date)) : null,
        dataToUpdate.school_id ? parseInt(String(dataToUpdate.school_id)) : null,
        dataToUpdate.parent ? String(dataToUpdate.parent).toLowerCase() : null,
        dataToUpdate.parent_id ? parseInt(String(dataToUpdate.parent_id)) : null,
        dataToUpdate.class_id ? parseInt(String(dataToUpdate.class_id)) : null,
        dataToUpdate.section_id ? parseInt(String(dataToUpdate.section_id)) : null,
        parseInt(String(id))
      );
      return NextResponse.json(Utility.formatResponse(200, "Updated Successfully"), { status: 200 });
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

    if (!model) {
      const setClauses: string[] = [];
      const values: any[] = [];

      Object.entries(dataToUpdate).forEach(([col, val]) => {
        if (val !== undefined) {
          values.push(val);
          setClauses.push(`"${col}" = $${values.length}`);
        }
      });

      if (setClauses.length === 0) {
        return NextResponse.json(Utility.formatResponse(200, "Nothing to update"), { status: 200 });
      }

      values.push(parseInt(String(id), 10));
      const idIdx = values.length;
      const query = `
        UPDATE "public"."${modelName}"
        SET ${setClauses.join(", ")}
        WHERE id = $${idIdx}
      `;

      await prisma.$executeRawUnsafe(query, ...values);
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
    if (!model) {
      const conditions: string[] = [];
      const values: any[] = [];
      Object.entries(whereClause).forEach(([col, val]) => {
        if (val !== undefined && val !== null) {
          values.push(val);
          conditions.push(`"${col}" = $${values.length}`);
        }
      });
      const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      await prisma.$executeRawUnsafe(`DELETE FROM "public"."${modelName}" ${whereSql}`, ...values);
      return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
    }
    await model.deleteMany({ where: whereClause });
    return NextResponse.json(Utility.formatResponse(200, "Deleted Successfully"), { status: 200 });
  } catch (err) {
    return NextResponse.json(Utility.formatResponse(500, err), { status: 500 });
  }
}
