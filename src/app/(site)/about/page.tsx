import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Prose } from "@/components/site/Prose";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { getCredentials, getPublishedPhotos, getSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `About ${settings.doctorName}`,
    description: settings.bioShort,
  };
}

const KIND_LABELS: Record<string, string> = {
  degree: "Education & qualifications",
  position: "Professional experience",
  membership: "Memberships",
  award: "Awards & recognition",
};

const KIND_ORDER = ["degree", "position", "membership", "award"];

export default async function AboutPage() {
  const [settings, credentials, photos] = await Promise.all([
    getSettings(),
    getCredentials(),
    getPublishedPhotos(),
  ]);

  const portrait = photos.find((p) => p.category === "portrait");
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    label: KIND_LABELS[kind] ?? kind,
    items: credentials.filter((c) => c.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">About</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            {settings.doctorName}
          </h1>
          <p className="mt-3 text-lg text-ink-600">{settings.qualifications}</p>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
        <div>
          <Prose content={settings.bioLong} />

          <div className="mt-12 space-y-10">
            {grouped.map((group) => (
              <section key={group.kind}>
                <h2 className="font-serif text-2xl font-semibold">
                  {group.label}
                </h2>
                <ul className="mt-5 space-y-5 border-l-2 border-brand-200 pl-6">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="font-serif text-lg font-semibold text-ink-900">
                          {item.title}
                        </h3>
                        {item.period && (
                          <span className="text-sm text-ink-500 tabular-nums">
                            {item.period}
                          </span>
                        )}
                      </div>
                      {item.institution && (
                        <p className="mt-0.5 text-[15px] text-ink-600">
                          {item.institution}
                        </p>
                      )}
                      {item.detail && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                          {item.detail}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {settings.registrationNo && (
            <p className="mt-10 text-sm text-ink-500">
              Medical registration number: {settings.registrationNo}
            </p>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
            {portrait ? (
              <Image
                src={portrait.url}
                alt={portrait.alt || settings.doctorName}
                width={520}
                height={620}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center p-6 text-center text-sm text-ink-500">
                Add a portrait photograph from the admin panel
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-serif text-lg font-semibold">Book a consultation</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Requests are usually confirmed the same day during working hours.
            </p>
            <Link href="/book" className="btn-primary mt-4 w-full">
              Request an appointment
            </Link>
            <Link href="/locations" className="btn-secondary mt-2.5 w-full">
              View timings
            </Link>
          </div>
        </aside>
      </div>

      {settings.galleryEnabled && (
        <div className="container-page pb-16">
          <PhotoGallery
            photos={photos}
            heading={settings.galleryHeading}
            intro={settings.galleryIntro}
          />
        </div>
      )}
    </>
  );
}
