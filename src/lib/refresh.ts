import { revalidatePath } from "next/cache";
import { invalidateContentCache } from "@/lib/resilient";

/**
 * Call after any admin write.
 *
 * Two caches sit in front of the public site — Next's route cache and the
 * in-memory read cache in lib/resilient. Clearing only one leaves the admin
 * showing new content while visitors still see the old, so they are always
 * cleared together.
 */
export function refreshPublicSite(...extraPaths: string[]) {
  invalidateContentCache();
  revalidatePath("/", "layout");
  for (const path of extraPaths) revalidatePath(path);
}
