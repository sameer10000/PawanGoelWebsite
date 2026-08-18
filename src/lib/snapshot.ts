import rawJson from "@/content/snapshot.json";
import type {
  Closure,
  Condition,
  Credential,
  Faq,
  Location,
  Photo,
  ScheduleSlot,
  Service,
  Settings,
  Testimonial,
} from "@/generated/prisma/client";

/**
 * Build-time copy of all published content, compiled into the deployed bundle.
 *
 * This is the last line of defence: if Railway Postgres is unreachable, every
 * public page still renders from here with no network call at all. Regenerated
 * on each build by `scripts/generate-snapshot.ts`.
 */

/** JSON has no Date type, so every Date arrives as an ISO string. */
type Serialised<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K];
};

type RawSnapshot = {
  generatedAt: string;
  settings: Serialised<Settings>;
  locations: (Serialised<Location> & { slots: Serialised<ScheduleSlot>[] })[];
  conditions: Serialised<Condition>[];
  services: Serialised<Service>[];
  credentials: Serialised<Credential>[];
  faqs: Serialised<Faq>[];
  testimonials: Serialised<Testimonial>[];
  photos: Serialised<Photo>[];
  closures: Serialised<Closure>[];
};

const raw = rawJson as unknown as RawSnapshot;

export type LocationWithSlots = Location & { slots: ScheduleSlot[] };
export type FaqWithCondition = Faq & { condition: Condition | null };

export const snapshotGeneratedAt = raw.generatedAt;

export function snapshotSettings(): Settings {
  return { ...raw.settings, updatedAt: new Date(raw.settings.updatedAt) };
}

export function snapshotLocations(): LocationWithSlots[] {
  return raw.locations.map((location) => ({ ...location, slots: [...location.slots] }));
}

export function snapshotConditions(): Condition[] {
  return [...raw.conditions];
}

export function snapshotCondition(slug: string): Condition | null {
  return raw.conditions.find((condition) => condition.slug === slug) ?? null;
}

export function snapshotServices(): Service[] {
  return [...raw.services];
}

export function snapshotCredentials(): Credential[] {
  return [...raw.credentials];
}

export function snapshotFaqs(): Faq[] {
  return [...raw.faqs];
}

/** FAQs joined to their condition, matching the shape the FAQ page expects. */
export function snapshotFaqsWithCondition(): FaqWithCondition[] {
  return raw.faqs.map((faq) => ({
    ...faq,
    condition:
      faq.conditionId == null
        ? null
        : (raw.conditions.find((c) => c.id === faq.conditionId) ?? null),
  }));
}

export function snapshotTestimonials(): Testimonial[] {
  return [...raw.testimonials];
}

export function snapshotPhotos(): Photo[] {
  return raw.photos.map((photo) => ({
    ...photo,
    createdAt: new Date(photo.createdAt),
  }));
}

export function snapshotClosures(): Closure[] {
  return raw.closures.map((closure) => ({
    ...closure,
    date: new Date(closure.date),
  }));
}
