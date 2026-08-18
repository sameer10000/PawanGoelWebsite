"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AccountState = { error?: string; success?: string };

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireAdmin();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!(await verifyPassword(current, user.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  if (next.length < 10) {
    return { error: "Choose a password of at least 10 characters." };
  }
  if (next !== confirm) {
    return { error: "The two new passwords do not match." };
  }
  if (next === current) {
    return { error: "The new password must be different from the current one." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { success: "Password changed." };
}

export async function updateAccount(formData: FormData) {
  const user = await requireAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !name) return;

  const clash = await prisma.adminUser.findUnique({ where: { email } });
  if (clash && clash.id !== user.id) return;

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { email, name },
  });

  revalidatePath("/admin/account");
  revalidatePath("/admin", "layout");
}
