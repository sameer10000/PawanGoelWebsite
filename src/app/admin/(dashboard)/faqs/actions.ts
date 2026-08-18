"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

function refresh() {
  revalidatePath("/admin/faqs");
  refreshPublicSite();
}

function read(formData: FormData) {
  const conditionId = String(formData.get("conditionId") ?? "");
  return {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    conditionId: conditionId ? Number(conditionId) : null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    published: formData.get("published") === "on",
  };
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const data = read(formData);
  if (!data.question || !data.answer) return;

  const count = await prisma.faq.count();
  await prisma.faq.create({
    data: { ...data, sortOrder: count + 1, published: true },
  });
  refresh();
}

export async function updateFaq(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.faq.update({ where: { id }, data: read(formData) });
  refresh();
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.faq.delete({ where: { id } });
  refresh();
}
