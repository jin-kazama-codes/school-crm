import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET || "ScH00L@#$CrM!2024$ecure#Key";
const stringSalt = process.env.STRING_SALT || "sch00lCRM2024!";
const salt = parseInt(process.env.SALT || "16");
const algorithm = process.env.ALGORITHM || "aes-256-cbc";
const key = crypto.scryptSync(secret, stringSalt, 32);

export interface FormatResponse {
  status: "Success" | "Error";
  data?: unknown;
  msg?: unknown;
}

export interface SchoolCondition {
  school_id?: string | number;
}

export interface JWTPayload {
  id: number;
  iat?: number;
  exp?: number;
}

const Utility = {
  /**
   * Creating hash of password by combining salt
   */
  createHash: async (password: string): Promise<string> => {
    return bcrypt.hash(password, salt);
  },

  /**
   * Get signed token
   */
  getSignedToken: (id: number): string => {
    try {
      const expiresIn = parseInt(process.env.JWT_EXPIRY || "86400");
      const token = jwt.sign({ id }, secret, { expiresIn });
      return token;
    } catch (err) {
      console.error("JWT signing error:", err);
      throw err;
    }
  },

  /**
   * Comparing 2 passwords
   */
  comparePassword: (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  /**
   * Formatting the response with status code
   */
  formatResponse: (statusCode: number, res: unknown): FormatResponse => {
    let status: "Success" | "Error";
    switch (statusCode) {
      case 200:
      case 202:
      case 204:
        status = "Success";
        break;
      case 400:
      case 401:
      case 403:
      case 404:
      case 408:
      case 409:
      case 429:
      case 500:
      case 502:
      case 503:
      case 505:
        status = "Error";
        break;
      default:
        status = "Success";
        break;
    }
    return status === "Success"
      ? { status, data: res }
      : { status, msg: res };
  },

  /**
   * Verify JWT token from Next.js request headers
   * Returns decoded payload if valid, null if invalid/missing
   */
  verifyToken: (request: NextRequest): { userId: number } | null => {
    const type = request.headers.get("type");

    // Only validate token if type is school-admin or school-mobile
    if (type !== "school-admin" && type !== "school-mobile") {
      return { userId: 0 }; // passthrough for other types
    }

    const token =
      request.headers.get("x-access-token") || null;

    if (!token) return null;

    try {
      const decoded = jwt.verify(token, secret) as JWTPayload;
      return { userId: decoded.id };
    } catch {
      return null;
    }
  },

  /**
   * Verify token for a raw token string (used in reset-password)
   */
  verifyTokenString: (token: string): JWTPayload | null => {
    try {
      const decoded = jwt.verify(token, secret) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the school ID from the provided headers object
   */
  getSchoolIdFromHeader: (request: NextRequest): SchoolCondition => {
    let whereCondition: SchoolCondition = {};

    try {
      const schoolHeader = request.headers.get("school");
      if (schoolHeader) {
        const school_info = JSON.parse(schoolHeader);
        const decrypted_school_id = Utility.decryptText(
          school_info?.encrypted_id,
          school_info?.vect
        );
        if (decrypted_school_id) {
          whereCondition = { school_id: decrypted_school_id };
        }
      }
    } catch (err) {
      console.error("Error in getSchoolIdFromHeader:", err);
    }
    return whereCondition;
  },

  /**
   * Encrypts text using AES-256-CBC
   */
  encryptText: (text: string): { encrypted_id: string; vect: string } | null => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted_id = cipher.update(text, "utf-8", "hex");
      encrypted_id += cipher.final("hex");
      return { encrypted_id, vect: iv.toString("hex") };
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  },

  /**
   * Decrypts an encrypted text using AES-256-CBC
   */
  decryptText: (encryptedText: string, vector: string): string | null => {
    try {
      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(vector, "hex")
      );
      let decrypted = decipher.update(encryptedText, "hex", "utf-8");
      decrypted += decipher.final("utf-8");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  },

  /**
   * Get API limit and offset
   */
  getPagination: (
    page = 0,
    size = 5
  ): { limit: number; offset: number } => {
    const limit = size;
    const offset = page * size;
    return { limit, offset };
  },

  /**
   * Get Prisma model name from table name string
   * Used by generic endpoints like /get-by-pk/:table/:id
   */
  getPrismaModelName: (tableName: string): string | null => {
    const map: Record<string, string> = {
      address: "address",
      amenity: "amenity",
      bus: "bus",
      class: "school_class",
      employee: "employee",
      holiday: "holiday",
      marksheet: "marksheet",
      noticeboard: "noticeboard",
      payment: "payment",
      payment_method: "payment_method",
      role: "user_role",
      school: "school",
      section: "section",
      student: "student",
      subject: "subject",
      school_duration: "school_duration",
      school_house: "school_house",
      timetable: "timetable",
      teacher: "teacher",
      user: "user",
      image: "image",
    };
    return map[tableName] || null;
  },
};

export default Utility;
