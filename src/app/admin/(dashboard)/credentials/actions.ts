"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

const KINDS = ["degree", "position", "membership", "award"] as const;

function refresh() {
  revalidatePath("/admin/credentials");
  refreshPublicSite();
}

function read(formData: FormData) {
  const kind = String(formData.get("kind") ?? "degree");
  return {
    kind: KINDS.includes(kind as (typeof KINDS)[number]) ? kind : "degree",
    title: String(formData.get("title") ?? "").trim(),
    institution: String(formData.get("institution") ?? "").trim() || null,
    period: String(formData.get("period") ?? "").trim() || null,
    detail: String(formData.get("detail") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    published: formData.get("published") === "on",
  };
}

export async function createCredential(formData: FormData) {
  await requireAdmin();
  const data = read(formData);
  if (!data.title) return;

  await prisma.credential.create({ data: { ...data, published: true } });
  refresh();
}

export async function updateCredential(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.credential.update({ where: { id }, data: read(formData) });
  refresh();
}

export async function deleteCredential(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.credential.delete({ where: { id } });
  refresh();
}
