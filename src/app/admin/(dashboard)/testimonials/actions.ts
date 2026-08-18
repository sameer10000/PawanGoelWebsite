"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

function refresh() {
  revalidatePath("/admin/testimonials");
  refreshPublicSite();
}

function read(formData: FormData) {
  const consentRecorded = formData.get("consentRecorded") === "on";
  return {
    patientName: String(formData.get("patientName") ?? "").trim(),
    area: String(formData.get("area") ?? "").trim() || null,
    text: String(formData.get("text") ?? "").trim(),
    rating: Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5) || 5)),
    consentRecorded,
    // Publishing a patient's words without recorded consent is both an ethical
    // and a DPDP problem, so the two flags are locked together here.
    published: consentRecorded && formData.get("published") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const data = read(formData);
  if (!data.patientName || !data.text) return;

  const count = await prisma.testimonial.count();
  await prisma.testimonial.create({ data: { ...data, sortOrder: count + 1 } });
  refresh();
}

export async function updateTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.testimonial.update({ where: { id }, data: read(formData) });
  refresh();
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.testimonial.delete({ where: { id } });
  refresh();
}
