import type { Metadata } from "next";
import Link from "next/link";
import { WhereToday } from "@/components/site/WhereToday";
import { getPublishedLocations, getSettings } from "@/lib/queries";
import { summariseSlots } from "@/lib/schedule";
import {
  formatPhone,
  fullAddress,
  mapsSearchHref,
  telHref,
  whatsappHref,
} from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Phone, WhatsApp and clinic address for Dr. Pawan Goel, Consultant Endocrinologist, Shalimar Bagh, Delhi.",
};

export default async function ContactPage() {
  const [settings, locations] = await Promise.all([
    getSettings(),
    getPublishedLocations(),
  ]);

  const primary = locations.find((l) => l.isPrimary) ?? locations[0];

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            For appointments, timings or directions. Clinical advice is given only
            in consultation, not over the phone.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Clinic</h2>
            {primary && (
              <>
                <p className="mt-3 text-lg text-ink-800">{primary.name}</p>
                <p className="mt-1 leading-relaxed text-ink-600">
                  {fullAddress(primary)}
                </p>
                <ul className="mt-4 space-y-1.5 text-[15px] text-ink-700">
                  {summariseSlots(primary.slots).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <a
                  href={
                    primary.mapUrl ||
                    mapsSearchHref([primary.name, primary.addressLine, primary.city])
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-5"
                >
                  Get directions
                </a>
              </>
            )}
          </div>

          <div className="border-t border-ink-200 pt-8">
            <h2 className="font-serif text-2xl font-semibold">Phone & WhatsApp</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm text-ink-500">Clinic</dt>
                <dd className="mt-0.5">
                  <a
                    href={telHref(settings.primaryPhone)}
                    className="text-lg font-medium text-ink-900 hover:text-brand-700"
                  >
                    {formatPhone(settings.primaryPhone)}
                  </a>
                </dd>
              </div>
              {settings.email && (
                <div>
                  <dt className="text-sm text-ink-500">Email</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-lg font-medium text-ink-900 hover:text-brand-700"
                    >
                      {settings.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <a
              href={whatsappHref(
                settings.whatsappNumber,
                `Hello, I would like to book an appointment with ${settings.doctorName}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-5"
            >
              Message on WhatsApp
            </a>
          </div>

          <div className="border-t border-ink-200 pt-8">
            <h2 className="font-serif text-2xl font-semibold">Hospital OPDs</h2>
            <ul className="mt-4 space-y-4">
              {locations
                .filter((l) => !l.isPrimary)
                .map((location) => (
                  <li key={location.id}>
                    <Link
                      href={`/locations/${location.slug}`}
                      className="font-medium text-ink-900 hover:text-brand-700"
                    >
                      {location.name}
                    </Link>
                    <p className="text-sm text-ink-500">
                      {location.area}
                      {location.phone ? ` · ${formatPhone(location.phone)}` : ""}
                    </p>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-serif text-lg font-semibold text-red-900">
              In an emergency
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-red-800">
              This website and its contact numbers are not monitored around the
              clock. If you have severe symptoms — very high or very low blood
              sugar, chest pain, breathlessness, confusion or loss of consciousness
              — go to the nearest emergency department immediately.
            </p>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <WhereToday />
          <div className="card">
            <h2 className="font-serif text-lg font-semibold">Prefer to book online?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Send a request and the clinic will call you back to confirm.
            </p>
            <Link href="/book" className="btn-primary mt-4 w-full">
              Request an appointment
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
