import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  const pool = global.pgPool || new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  pool.on("error", (err) => {
    console.warn("PostgreSQL Pool idle client notice:", err.message);
  });

  if (process.env.NODE_ENV !== "production") {
    global.pgPool = pool;
  }

  // Ensure payment table discount_percent accepts decimals (Float)
  pool.query(`ALTER TABLE "payment" ALTER COLUMN "discount_percent" TYPE DOUBLE PRECISION USING "discount_percent"::double precision;`).catch(() => {});

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
