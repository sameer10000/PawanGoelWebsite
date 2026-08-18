"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPublicSite } from "@/lib/refresh";

/**
 * Images are stored in Postgres and served by the /media/[key] route.
 *
 * At this scale — a portrait and a handful of clinic photos — that avoids
 * adding an object-storage provider for a few megabytes of data, and it works
 * identically in development and on Cloud Run's ephemeral filesystem.
 */

const MAX_BYTES = 6 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type PhotoState = { error?: string; success?: string };

function refresh() {
  revalidatePath("/admin/photos");
  refreshPublicSite();
}

export async function uploadPhoto(
  _prev: PhotoState,
  formData: FormData,
): Promise<PhotoState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That image is larger than 6 MB. Please compress it first." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Only JPG, PNG, WebP and AVIF images are supported." };
  }

  const alt = String(formData.get("alt") ?? "").trim();
  if (!alt) {
    return { error: "Add a short description of the image for accessibility." };
  }

  const key = randomBytes(16).toString("hex");
  const data = Buffer.from(await file.arrayBuffer());

  try {
    const count = await prisma.photo.count();
    // One transaction: never leave a metadata row without its bytes.
    await prisma.photo.create({
      data: {
        key,
        url: `/media/${key}`,
        contentType: file.type,
        alt,
        caption: String(formData.get("caption") ?? "").trim() || null,
        category: String(formData.get("category") ?? "clinic"),
        sortOrder: count + 1,
        file: { create: { data } },
      },
    });
  } catch (error) {
    console.error("[photos] upload failed:", error);
    return { error: "Could not save the image. Please try again." };
  }

  refresh();
  return { success: "Image uploaded." };
}

export async function updatePhoto(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.photo.update({
    where: { id },
    data: {
      alt: String(formData.get("alt") ?? "").trim(),
      caption: String(formData.get("caption") ?? "").trim() || null,
      category: String(formData.get("category") ?? "clinic"),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      published: formData.get("published") === "on",
    },
  });

  refresh();
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  // PhotoFile cascades, so the bytes go with the row.
  await prisma.photo.delete({ where: { id } });

  refresh();
}
