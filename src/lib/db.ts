import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The app (Firebase App Hosting) and the database (Railway Postgres) run on
 * different providers, so every query crosses a network the app does not
 * control. Connections therefore fail fast rather than hanging: a hung query
 * would block a page render, whereas a fast failure lets lib/resilient fall
 * back to cached or snapshot content.
 */
export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Cloud Run scales to many small instances; a large pool per instance
    // would exhaust Postgres connections long before it helped throughput.
    max: 5,
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 30_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
