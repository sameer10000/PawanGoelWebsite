import "dotenv/config";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createPrismaClient } from "../src/lib/db";

/**
 * Bakes all published content into src/content/snapshot.json.
 *
 * The deployed app imports that file, so if the database is unreachable at
 * runtime every public page still renders — timings, phone numbers, addresses,
 * condition pages and the "consulting today" panel all keep working.
 *
 * Runs as part of `npm run build`. If the database is unreachable at build
 * time it keeps the existing snapshot rather than failing the build.
 */

const OUT_DIR = path.join(process.cwd(), "src", "content");
const OUT_FILE = path.join(OUT_DIR, "snapshot.json");

async function main() {
  const prisma = createPrismaClient();

  const [
    settings,
    locations,
    conditions,
    services,
    credentials,
    faqs,
    testimonials,
    photos,
    closures,
  ] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.location.findMany({
      where: { published: true },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      include: {
        slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      },
    }),
    prisma.condition.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.credential.findMany({
      where: { published: true },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.faq.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.photo.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    // Only future closures matter, and a stale one stays valid until its date.
    prisma.closure.findMany({
      where: { date: { gte: new Date(new Date().toISOString().slice(0, 10)) } },
      orderBy: { date: "asc" },
    }),
  ]);

  if (!settings) throw new Error("No settings row — cannot build a snapshot.");

  const snapshot = {
    generatedAt: new Date().toISOString(),
    settings,
    locations,
    conditions,
    services,
    credentials,
    faqs,
    testimonials,
    photos,
    closures,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  await prisma.$disconnect();

  console.log(
    `Snapshot written: ${locations.length} locations, ${conditions.length} conditions, ` +
      `${services.length} services, ${faqs.length} FAQs, ${photos.length} photos.`,
  );
}

main().catch(async (error) => {
  console.warn(`\n  Could not refresh the content snapshot: ${error.message}`);

  try {
    await access(OUT_FILE);
    console.warn("  Keeping the existing snapshot and continuing the build.\n");
    process.exit(0);
  } catch {
    console.error(
      "\n  No existing snapshot to fall back on. The site would have no offline\n" +
        "  fallback content, so the build is being stopped.\n",
    );
    process.exit(1);
  }
});
