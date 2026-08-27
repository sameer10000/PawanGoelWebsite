"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { withTimeout } from "@/lib/resilient";

export type BookingState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Database unreachable — the form should offer phone and WhatsApp instead. */
  degraded?: boolean;
};

/** A patient should never sit watching a spinner because Postgres is hanging. */
const WRITE_TIMEOUT_MS = 6_000;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  locationId: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  concern: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  /**
   * Honeypot. Deliberately permissive: validating it would surface an error on
   * a field the patient cannot see if a password manager ever autofills it.
   * It is checked after parsing instead.
   */
  website: z.string().optional(),
});

export async function submitBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors, message: "Please check the highlighted fields." };
  }

  const data = parsed.data;
  if (data.website) return { ok: true, message: "Thank you." };

  try {
    const locationId =
      data.locationId && /^\d+$/.test(data.locationId) ? Number(data.locationId) : null;

    if (locationId) {
      const location = await withTimeout(
        prisma.location.findUnique({
          where: { id: locationId },
          select: { isPrimary: true, name: true, bookingUrl: true },
        }),
        WRITE_TIMEOUT_MS,
      );

      if (location && !location.isPrimary) {
        return {
          ok: false,
          message: location.bookingUrl
            ? `Appointments at ${location.name} are handled by the hospital. Please use the hospital booking link.`
            : `Appointments at ${location.name} are handled by the hospital. Please contact the hospital directly.`,
        };
      }
    }

    await withTimeout(
      prisma.appointment.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          locationId,
          preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
          preferredTime: data.preferredTime || null,
          concern: data.concern || null,
          message: data.message || null,
        },
      }),
      WRITE_TIMEOUT_MS,
    );
  } catch (error) {
    // The patient's details are still in the form, so nothing they typed is
    // lost — but the request has NOT been saved and we must not imply it was.
    console.error("[booking] could not save appointment request:", error);
    return {
      ok: false,
      degraded: true,
      message:
        "We could not save your request just now. Please call or message the clinic — the numbers below reach us directly.",
    };
  }

  return {
    ok: true,
    message:
      "Your request has been received. The clinic will call you to confirm your appointment.",
  };
}
