import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The app (Vercel) and the database (Neon) are separate services, so every
 * query crosses a network the app does not control.
 *
 * Page-render latency is protected by the 4s timeout in lib/resilient, not by
 * this one — if a read takes too long the page falls back to cached or
 * snapshot content regardless. So the pool itself can afford to be patient:
 * a short connect timeout here only breaks legitimate slow connects, such as
 * waking a scale-to-zero Neon compute or connecting from a distant region
 * (which is exactly what broke seeding at 3s).
 *
 * A connection abandoned by resilientRead still finishes and joins the pool,
 * so the request that timed out warms things up for the next one.
 */
export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Serverless scales to many small instances; a large pool per instance
    // would exhaust Postgres connections long before it helped throughput.
    max: 5,
    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 15_000,
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
