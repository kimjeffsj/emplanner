// Prisma configuration for Chicko Schedule
// See: https://pris.ly/d/config-datasource
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local development
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Vercel Postgres connection URL
    url: process.env["POSTGRES_URL"] || process.env["POSTGRES_PRISMA_URL"] || process.env["DATABASE_URL"],
  },
});
