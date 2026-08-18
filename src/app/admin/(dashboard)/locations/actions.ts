"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function refresh() {
  revalidatePath("/admin/locations");
  refreshPublicSite();
}

function readLocation(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const feeRaw = String(formData.get("fee") ?? "").trim();

  return {
    name,
    kind: String(formData.get("kind") ?? "hospital"),
    addressLine: String(formData.get("addressLine") ?? "").trim(),
    area,
    city: String(formData.get("city") ?? "Delhi").trim(),
    state: String(formData.get("state") ?? "Delhi").trim(),
    pincode: String(formData.get("pincode") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    fee: feeRaw ? Number(feeRaw) : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    bookingUrl: String(formData.get("bookingUrl") ?? "").trim() || null,
    mapUrl: String(formData.get("mapUrl") ?? "").trim() || null,
    mapEmbedUrl: String(formData.get("mapEmbedUrl") ?? "").trim() || null,
    isPrimary: formData.get("isPrimary") === "on",
    published: formData.get("published") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createLocation(formData: FormData) {
  await requireAdmin();
  const data = readLocation(formData);
  if (!data.name || !data.area) return;

  // Slugs are permanent URLs, so keep them unique rather than overwriting.
  const base = slugify(`${data.name}-${data.area}`) || "location";
  let slug = base;
  let suffix = 2;
  while (await prisma.location.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`;
  }

  const created = await prisma.location.create({ data: { ...data, slug } });
  if (data.isPrimary) {
    await prisma.location.updateMany({
      where: { id: { not: created.id } },
      data: { isPrimary: false },
    });
  }

  refresh();
  redirect(`/admin/locations/${created.id}`);
}

export async function updateLocation(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const data = readLocation(formData);
  await prisma.location.update({ where: { id }, data });

  // Only one location can be the doctor's own clinic.
  if (data.isPrimary) {
    await prisma.location.updateMany({
      where: { id: { not: id } },
      data: { isPrimary: false },
    });
  }

  refresh();
  revalidatePath(`/admin/locations/${id}`);
}

export async function toggleLocationPublished(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) return;

  await prisma.location.update({
    where: { id },
    data: { published: !location.published },
  });
  refresh();
}

export async function deleteLocation(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.location.delete({ where: { id } });
  refresh();
  redirect("/admin/locations");
}

/** Adds the same time window to every selected day in one go. */
export async function addSlots(formData: FormData) {
  await requireAdmin();
  const locationId = Number(formData.get("locationId"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const days = formData.getAll("days").map(Number).filter((d) => d >= 0 && d <= 6);

  if (!locationId || !startTime || !endTime || days.length === 0) return;
  if (startTime >= endTime) return;

  const existing = await prisma.scheduleSlot.findMany({ where: { locationId } });
  const fresh = days.filter(
    (day) =>
      !existing.some(
        (slot) =>
          slot.dayOfWeek === day &&
          slot.startTime === startTime &&
          slot.endTime === endTime,
      ),
  );

  if (fresh.length) {
    await prisma.scheduleSlot.createMany({
      data: fresh.map((dayOfWeek) => ({
        locationId,
        dayOfWeek,
        startTime,
        endTime,
      })),
    });
  }

  refresh();
  revalidatePath(`/admin/locations/${locationId}`);
}

export async function deleteSlot(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const locationId = Number(formData.get("locationId"));
  if (!id) return;

  await prisma.scheduleSlot.delete({ where: { id } });
  refresh();
  if (locationId) revalidatePath(`/admin/locations/${locationId}`);
}
