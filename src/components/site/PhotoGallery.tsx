import type { Photo } from "@/generated/prisma/client";
import { PhotoLightbox } from "./PhotoLightbox";

/**
 * Clinic, equipment and team photographs.
 *
 * Portraits are excluded — they have their own place on the home and About
 * pages. Photographs of the actual consulting room do real work for a clinic
 * site: they reduce the anxiety of visiting an unfamiliar place, which matters
 * more for a first appointment than any amount of copy.
 */

export const GALLERY_CATEGORIES = new Set([
  "clinic",
  "equipment",
  "team",
  "event",
]);

export function PhotoGallery({
  photos,
  heading,
  intro,
}: {
  photos: Photo[];
  heading?: string;
  intro?: string;
}) {
  const gallery = photos.filter((photo) =>
    GALLERY_CATEGORIES.has(photo.category),
  );

  if (gallery.length === 0) return null;

  return (
    <section aria-labelledby={heading ? "gallery-heading" : undefined}>
      {heading && (
        <h2 id="gallery-heading" className="font-serif text-2xl font-semibold">
          {heading}
        </h2>
      )}
      {intro && (
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-600">{intro}</p>
      )}

      <PhotoLightbox
        photos={gallery.map((photo) => ({
          id: photo.id,
          url: photo.url,
          alt: photo.alt,
          caption: photo.caption,
        }))}
      />
    </section>
  );
}
