import { cache } from "react";
import { prisma } from "@/lib/db";
import { resilientRead } from "@/lib/resilient";
import {
  snapshotClosures,
  snapshotCondition,
  snapshotConditions,
  snapshotCredentials,
  snapshotFaqs,
  snapshotFaqsWithCondition,
  snapshotLocations,
  snapshotPhotos,
  snapshotServices,
  snapshotSettings,
  snapshotTestimonials,
  type FaqWithCondition,
  type LocationWithSlots,
} from "@/lib/snapshot";
import { buildToday, istNow } from "@/lib/schedule";
import type { Closure, Condition, Faq } from "@/generated/prisma/client";

/**
 * Every public read goes through resilientRead, so a database outage degrades
 * the site to slightly older content instead of taking it down.
 *
 * React's cache() on top dedupes repeated calls within a single request.
 */

export const getSettings = cache(async () =>
  resilientRead(
    "settings",
    async () => {
      const settings = await prisma.settings.findUnique({ where: { id: 1 } });
      if (!settings) throw new Error("Settings row is missing");
      return settings;
    },
    snapshotSettings,
  ),
);

export const getPublishedLocations = cache(async () =>
  resilientRead(
    "locations",
    () =>
      prisma.location.findMany({
        where: { published: true },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        include: {
          slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        },
      }),
    snapshotLocations,
  ),
);

export type LocationDetail = LocationWithSlots & { closures: Closure[] };

export const getLocationBySlug = cache(async (slug: string) =>
  resilientRead<LocationDetail | null>(
    `location:${slug}`,
    () =>
      prisma.location.findFirst({
        where: { slug, published: true },
        include: {
          slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
          closures: {
            where: { date: { gte: startOfTodayUtc() } },
            orderBy: { date: "asc" },
            take: 5,
          },
        },
      }),
    () => {
      const location = snapshotLocations().find((l) => l.slug === slug);
      if (!location) return null;
      return {
        ...location,
        closures: snapshotClosures().filter((c) => c.locationId === location.id),
      };
    },
  ),
);

export const getPublishedConditions = cache(async () =>
  resilientRead(
    "conditions",
    () =>
      prisma.condition.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
    snapshotConditions,
  ),
);

export type ConditionDetail = Condition & { faqs: Faq[] };

export const getConditionBySlug = cache(async (slug: string) =>
  resilientRead<ConditionDetail | null>(
    `condition:${slug}`,
    () =>
      prisma.condition.findFirst({
        where: { slug, published: true },
        include: {
          faqs: { where: { published: true }, orderBy: { sortOrder: "asc" } },
        },
      }),
    () => {
      const condition = snapshotCondition(slug);
      if (!condition) return null;
      return {
        ...condition,
        faqs: snapshotFaqs().filter((faq) => faq.conditionId === condition.id),
      };
    },
  ),
);

export const getPublishedServices = cache(async () =>
  resilientRead(
    "services",
    () =>
      prisma.service.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
    snapshotServices,
  ),
);

export const getPublishedTestimonials = cache(async () =>
  resilientRead(
    "testimonials",
    () =>
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
    snapshotTestimonials,
  ),
);

export const getGeneralFaqs = cache(async () =>
  resilientRead(
    "faqs:general",
    () =>
      prisma.faq.findMany({
        where: { published: true, conditionId: null },
        orderBy: { sortOrder: "asc" },
      }),
    () => snapshotFaqs().filter((faq) => faq.conditionId === null),
  ),
);

export const getConditionFaqs = cache(async () =>
  resilientRead<FaqWithCondition[]>(
    "faqs:by-condition",
    () =>
      prisma.faq.findMany({
        where: { published: true, conditionId: { not: null } },
        include: { condition: true },
        orderBy: { sortOrder: "asc" },
      }),
    () =>
      snapshotFaqsWithCondition().filter((faq) => faq.conditionId !== null),
  ),
);

export const getCredentials = cache(async () =>
  resilientRead(
    "credentials",
    () =>
      prisma.credential.findMany({
        where: { published: true },
        orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
      }),
    snapshotCredentials,
  ),
);

export const getPublishedPhotos = cache(async () =>
  resilientRead(
    "photos",
    () =>
      prisma.photo.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
    snapshotPhotos,
  ),
);

function startOfTodayUtc() {
  return new Date(`${istNow().isoDate}T00:00:00.000Z`);
}

/**
 * Today's consulting schedule with leave applied.
 *
 * Deliberately built from already-resilient reads, so it keeps working during
 * an outage — this panel is the site's most useful feature and the one patients
 * are most likely to be looking at.
 */
export const getTodaySchedule = cache(async () => {
  const now = istNow();
  const locations = await getPublishedLocations();

  const dayStart = new Date(`${now.isoDate}T00:00:00.000Z`);
  const dayEnd = new Date(`${now.isoDate}T23:59:59.999Z`);

  const closures = await resilientRead(
    `closures:${now.isoDate}`,
    () =>
      prisma.closure.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
      }),
    () =>
      snapshotClosures().filter(
        (closure) => closure.date >= dayStart && closure.date <= dayEnd,
      ),
  );

  const closedEverywhere = closures.some((c) => c.locationId === null);
  const closedLocationIds = new Set(
    closures.map((c) => c.locationId).filter((id): id is number => id !== null),
  );

  return {
    now,
    entries: buildToday(locations, { now, closedLocationIds, closedEverywhere }),
    closedEverywhere,
    closureReason: closures.find((c) => c.locationId === null)?.reason ?? null,
  };
});
