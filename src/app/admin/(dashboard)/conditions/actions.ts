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

function refresh(id?: number) {
  revalidatePath("/admin/conditions");
  if (id) revalidatePath(`/admin/conditions/${id}`);
  refreshPublicSite();
}

export async function createCondition(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!name || !summary) return;

  const base = slugify(name) || "condition";
  let slug = base;
  let suffix = 2;
  while (await prisma.condition.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`;
  }

  const count = await prisma.condition.count();
  const created = await prisma.condition.create({
    data: {
      name,
      slug,
      summary,
      sortOrder: count + 1,
      published: false,
      metaTitle: `${name} Treatment in Delhi | Dr. Pawan Goel`,
      metaDescription: summary,
    },
  });

  refresh();
  redirect(`/admin/conditions/${created.id}`);
}

export async function updateCondition(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.condition.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      symptoms: String(formData.get("symptoms") ?? ""),
      whenToSee: String(formData.get("whenToSee") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
      metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    },
  });

  refresh(id);
}

export async function toggleConditionPublished(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const condition = await prisma.condition.findUnique({ where: { id } });
  if (!condition) return;

  await prisma.condition.update({
    where: { id },
    data: { published: !condition.published },
  });
  refresh(id);
}

export async function deleteCondition(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.condition.delete({ where: { id } });
  refresh();
  redirect("/admin/conditions");
}
