import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env.local for CLI commands (prisma db push / prisma migrate)
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
