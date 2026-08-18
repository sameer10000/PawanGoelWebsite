"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUSES = ["new", "confirmed", "completed", "cancelled"] as const;

export async function updateAppointment(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await prisma.appointment.update({
    where: { id },
    data: { status, adminNotes: adminNotes || null },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

export async function setAppointmentStatus(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await prisma.appointment.update({ where: { id }, data: { status } });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

export async function deleteAppointment(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.appointment.delete({ where: { id } });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
