import { prisma } from "@/lib/db";

/**
 * Serves uploaded images out of Postgres.
 *
 * Keys are random and never reused, so a given URL always returns the same
 * bytes — which makes an immutable one-year cache header safe. In practice
 * each image is fetched once per browser and once by Next's image optimiser,
 * so the database is barely touched.
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  try {
    const photo = await prisma.photo.findUnique({
      where: { key },
      include: { file: true },
    });

    if (!photo || !photo.file) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(new Uint8Array(photo.file.data), {
      headers: {
        "Content-Type": photo.contentType,
        "Content-Length": String(photo.file.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`[media] could not serve ${key}:`, error);
    // Short cache on failure so a database blip doesn't pin a broken image
    // into caches for a year.
    return new Response("Image temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "public, max-age=10" },
    });
  }
}
