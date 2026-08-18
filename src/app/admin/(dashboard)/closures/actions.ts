"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

function refresh() {
  revalidatePath("/admin/closures");
  refreshPublicSite();
}

export async function addClosure(formData: FormData) {
  await requireAdmin();

  const date = String(formData.get("date") ?? "");
  const locationValue = String(formData.get("locationId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!date) return;

  await prisma.closure.create({
    data: {
      // Stored at UTC midnight and compared the same way, so the calendar date
      // never drifts across timezones.
      date: new Date(`${date}T00:00:00.000Z`),
      locationId: locationValue ? Number(locationValue) : null,
      reason: reason || null,
    },
  });

  refresh();
}

export async function deleteClosure(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.closure.delete({ where: { id } });
  refresh();
}
