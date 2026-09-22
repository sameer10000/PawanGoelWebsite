import type { Metadata } from "next";
import Link from "next/link";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { WhereToday } from "@/components/site/WhereToday";
import {
  getCredentials,
  getGeneralFaqs,
  getPublishedConditions,
  getPublishedLocations,
  getPublishedPhotos,
  getPublishedServices,
  getPublishedTestimonials,
  getSettings,
} from "@/lib/queries";
import { summariseSlots } from "@/lib/schedule";
import { formatPhone, telHref, whatsappHref } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [
    settings,
    conditions,
    services,
    locations,
    testimonials,
    faqs,
    credentials,
    photos,
  ] = await Promise.all([
    getSettings(),
    getPublishedConditions(),
    getPublishedServices(),
    getPublishedLocations(),
    getPublishedTestimonials(),
    getGeneralFaqs(),
    getCredentials(),
    getPublishedPhotos(),
  ]);

  const featured = conditions.filter((c) => c.featured).slice(0, 6);
  const degrees = credentials.filter((c) => c.kind === "degree");
  const portraits = photos.filter((p) => p.category === "portrait").slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
          <div className="">
            <p className="eyebrow">Endocrinology & Diabetes</p>
            <h1 className="mt-4 font-serif text-[2.1rem] leading-[1.12] font-semibold text-ink-900 sm:text-5xl">
              {settings.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              {settings.subheadline}
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-600">
              {settings.bioShort}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                Book an appointment
              </Link>
              <a
                href={whatsappHref(
                  settings.whatsappNumber,
                  `Hello, I would like to book an appointment with ${settings.doctorName}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                WhatsApp
              </a>
              <a href={telHref(settings.primaryPhone)} className="btn-secondary">
                {formatPhone(settings.primaryPhone)}
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-200 pt-7">
              <div>
                <dt className="text-xs tracking-wide text-ink-500 uppercase">
                  Experience
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-ink-900">
                  {settings.experienceYears} yrs
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-ink-500 uppercase">
                  Trained at
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-ink-900">
                  AIIMS
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-ink-500 uppercase">
                  Super-speciality
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-ink-900">
                  SGPGI
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-6 lg:max-w-[540px] lg:justify-self-end">
            <div>
              {portraits.length > 0 ? (
                <HeroCarousel
                  photos={portraits.map((photo) => ({
                    id: photo.id,
                    url: photo.url,
                    alt: photo.alt || settings.doctorName,
                  }))}
                />
              ) : (
                <div className="mx-auto flex aspect-[3/4] w-full max-w-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-ink-100 px-6 text-center lg:max-w-[460px]">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 font-serif text-xl font-semibold text-white">
                    PG
                  </span>
                  <p className="text-sm font-medium text-ink-600">
                    Add a portrait photograph from the admin panel
                  </p>
                  <p className="max-w-xs text-xs text-ink-500">
                    Upload under Photos with the category “portrait”. A real
                    photograph is the single strongest trust signal on this page.
                  </p>
                </div>
              )}
            </div>

            <WhereToday />
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-14 lg:py-16">
          <p className="text-center text-sm font-semibold tracking-[0.14em] text-ink-400 uppercase">
            Training & qualifications
          </p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">
            {degrees.map((degree) => (
              <li key={degree.id} className="text-center">
                <p className="font-serif text-2xl font-semibold text-ink-900">
                  {degree.title}
                </p>
                <p className="mt-2 text-base leading-relaxed text-ink-500">
                  {degree.institution}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Conditions */}
      <section className="container-page py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Conditions treated</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            Hormonal and metabolic conditions, managed for the long term
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Endocrine conditions are rarely resolved in a single visit. Each of
            these is managed with a plan you can actually follow, and reviewed as
            things change.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((condition) => (
            <li key={condition.id}>
              <Link
                href={`/conditions/${condition.slug}`}
                className="group flex h-full flex-col rounded-xl border border-ink-200 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/40"
              >
                <h3 className="font-serif text-lg font-semibold group-hover:text-brand-700">
                  {condition.name}
                </h3>
                <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink-600">
                  {condition.summary}
                </p>
                <span className="mt-4 text-sm font-medium text-brand-700">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link href="/conditions" className="btn-secondary">
            View all conditions
          </Link>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="container-page py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Services & technology</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              Modern diabetes care, used where it genuinely helps
            </h2>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/services#${service.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-ink-200 p-6 transition-colors hover:border-brand-400"
                >
                  <h3 className="font-serif text-lg font-semibold group-hover:text-brand-700">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600">
                    {service.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Locations */}
      <section className="border-y border-ink-200 bg-ink-50">
        <div className="container-page py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Where to meet</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              Consulting across {locations.length} locations in Delhi NCR
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              Choose whichever is closest for a first consultation. Follow-ups
              are usually easiest at the Shalimar Bagh clinic.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location) => (
              <li key={location.id}>
                <Link
                  href={`/locations/${location.slug}`}
                  className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 transition-colors hover:border-brand-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-semibold">
                      {location.name}
                    </h3>
                    {location.isPrimary && (
                      <span className="badge bg-brand-100 text-brand-800">
                        Own clinic
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {location.area}, {location.city}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[15px] text-ink-700">
                    {summariseSlots(location.slots).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                    {location.slots.length === 0 && (
                      <li className="text-ink-500">Timings on request</li>
                    )}
                  </ul>
                  {location.fee != null && (
                    <p className="mt-3 text-sm text-ink-500">
                      Consultation ₹{location.fee.toLocaleString("en-IN")}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container-page py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Patient experiences</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              In patients&rsquo; words
            </h2>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 6).map((testimonial) => (
              <li
                key={testimonial.id}
                className="flex flex-col rounded-xl border border-ink-200 p-6"
              >
                <p className="flex-1 text-[15px] leading-relaxed text-ink-700">
                  “{testimonial.text}”
                </p>
                <p className="mt-4 text-sm font-medium text-ink-900">
                  {testimonial.patientName}
                  {testimonial.area && (
                    <span className="font-normal text-ink-500">
                      {" "}
                      · {testimonial.area}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="border-t border-ink-200 bg-ink-50">
          <div className="container-page py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
                  Before your visit
                </h2>
                <Link
                  href="/faqs"
                  className="mt-5 inline-block text-sm font-medium text-brand-700 hover:underline"
                >
                  See all questions →
                </Link>
              </div>
              <div className="divide-y divide-ink-200 border-y border-ink-200">
                {faqs.slice(0, 5).map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900">
                      {faq.question}
                      <span
                        aria-hidden
                        className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="bg-brand-800">
        <div className="container-page py-16 text-center lg:py-20">
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Book a consultation
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Send a request and the clinic will confirm your slot, or call
            directly during working hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/book"
              className="btn bg-white px-6 py-3 text-brand-800 hover:bg-brand-50"
            >
              Request an appointment
            </Link>
            <a
              href={whatsappHref(
                settings.whatsappNumber,
                `Hello, I would like to book an appointment with ${settings.doctorName}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-brand-400 px-6 py-3 text-white hover:bg-brand-700"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
