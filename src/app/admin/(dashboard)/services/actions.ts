"use server";

import { revalidatePath } from "next/cache";
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
  revalidatePath("/admin/services");
  refreshPublicSite();
}

export async function createService(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!name || !summary) return;

  const base = slugify(name) || "service";
  let slug = base;
  let suffix = 2;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`;
  }

  const count = await prisma.service.count();
  await prisma.service.create({
    data: {
      name,
      slug,
      summary,
      body: String(formData.get("body") ?? ""),
      sortOrder: count + 1,
    },
  });

  refresh();
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.service.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      published: formData.get("published") === "on",
    },
  });

  refresh();
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.service.delete({ where: { id } });
  refresh();
}
