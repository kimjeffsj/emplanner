import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Database URL not found in environment variables");
  }

  // Create a pg Pool connection
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  // Create the Prisma adapter
  const adapter = new PrismaPg(pool);

  // Prisma 7+ requires adapter for direct PostgreSQL connections
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
