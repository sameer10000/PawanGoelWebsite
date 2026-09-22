import type { Metadata } from "next";
import { GALLERY_CATEGORIES, PhotoGallery } from "@/components/site/PhotoGallery";
import { getPublishedPhotos, getSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    alternates: { canonical: "/gallery" },
    title: "Gallery",
    description: `Photos of ${settings.doctorName}'s clinic, equipment and team.`,
  };
}

export default async function GalleryPage() {
  const [settings, photos] = await Promise.all([
    getSettings(),
    getPublishedPhotos(),
  ]);

  const hasPhotos =
    settings.galleryEnabled &&
    photos.some((photo) => GALLERY_CATEGORIES.has(photo.category));

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Gallery</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            {settings.galleryHeading}
          </h1>
          {settings.galleryIntro && (
            <p className="mt-3 max-w-2xl text-lg text-ink-600">
              {settings.galleryIntro}
            </p>
          )}
        </div>
      </section>

      <div className="container-page py-14">
        {hasPhotos ? (
          <PhotoGallery photos={photos} />
        ) : (
          <p className="text-ink-500">
            Photos are being added — check back soon.
          </p>
        )}
      </div>
    </>
  );
}
