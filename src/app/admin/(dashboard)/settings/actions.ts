"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

export async function updateSettings(formData: FormData) {
  await requireAdmin();

  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const appointmentBookingUrl = text("appointmentBookingUrl");
  const parsedBookingUrl = new URL(appointmentBookingUrl);

  if (!["http:", "https:"].includes(parsedBookingUrl.protocol)) {
    throw new Error("The appointment booking link must use HTTP or HTTPS.");
  }

  await prisma.$transaction([
    prisma.settings.update({
      where: { id: 1 },
      data: {
        doctorName: text("doctorName"),
        qualifications: text("qualifications"),
        headline: text("headline"),
        subheadline: text("subheadline"),
        bioShort: text("bioShort"),
        bioLong: String(formData.get("bioLong") ?? ""),
        experienceYears: Number(formData.get("experienceYears") ?? 0) || 0,
        registrationNo: text("registrationNo") || null,
        primaryPhone: text("primaryPhone"),
        // wa.me links only accept digits.
        whatsappNumber: text("whatsappNumber").replace(/\D/g, ""),
        email: text("email"),
        announcement: text("announcement") || null,
        announcementActive: formData.get("announcementActive") === "on",
        galleryEnabled: formData.get("galleryEnabled") === "on",
        galleryHeading: text("galleryHeading") || "Inside the clinic",
        galleryIntro: text("galleryIntro"),
        metaTitle: text("metaTitle"),
        metaDescription: text("metaDescription"),
      },
    }),
    prisma.location.updateMany({
      where: { isPrimary: true },
      data: { bookingUrl: appointmentBookingUrl },
    }),
  ]);

  revalidatePath("/admin/settings");
  refreshPublicSite();
}
