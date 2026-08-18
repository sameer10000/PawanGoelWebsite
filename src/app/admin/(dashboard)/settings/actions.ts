"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

export async function updateSettings(formData: FormData) {
  await requireAdmin();

  const text = (key: string) => String(formData.get(key) ?? "").trim();

  await prisma.settings.update({
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
      metaTitle: text("metaTitle"),
      metaDescription: text("metaDescription"),
    },
  });

  revalidatePath("/admin/settings");
  refreshPublicSite();
}
