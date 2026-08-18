import Image from "next/image";
import type { Photo } from "@/generated/prisma/client";

/**
 * Clinic, equipment and team photographs.
 *
 * Portraits are excluded — they have their own place on the home and About
 * pages. Photographs of the actual consulting room do real work for a clinic
 * site: they reduce the anxiety of visiting an unfamiliar place, which matters
 * more for a first appointment than any amount of copy.
 */

const GALLERY_CATEGORIES = new Set(["clinic", "equipment", "team"]);

export function PhotoGallery({
  photos,
  heading,
  intro,
}: {
  photos: Photo[];
  heading: string;
  intro?: string;
}) {
  const gallery = photos.filter((photo) =>
    GALLERY_CATEGORIES.has(photo.category),
  );

  if (gallery.length === 0) return null;

  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="font-serif text-2xl font-semibold">
        {heading}
      </h2>
      {intro && (
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-600">{intro}</p>
      )}

      <ul
        className={`mt-5 grid gap-4 ${
          gallery.length === 1
            ? "sm:grid-cols-1"
            : gallery.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {gallery.map((photo, index) => (
          <li key={photo.id}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  // The first couple are likely above the fold on a phone.
                  loading={index < 2 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
              {photo.caption && (
                <figcaption className="mt-2 text-sm text-ink-500">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
