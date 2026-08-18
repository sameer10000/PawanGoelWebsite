import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationBySlug, getSettings } from "@/lib/queries";
import { DAY_LABELS, formatRange, istNow, toMinutes } from "@/lib/schedule";
import {
  formatPhone,
  fullAddress,
  mapsSearchHref,
  telHref,
  whatsappHref,
} from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  const settings = await getSettings();
  if (!location) return {};
  return {
    title: `${settings.doctorName} at ${location.name}, ${location.area}`,
    description: `OPD timings, address and contact details for ${settings.doctorName}, Endocrinologist, at ${location.name}, ${location.area}, ${location.city}.`,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function LocationPage({ params }: Params) {
  const { slug } = await params;
  const [location, settings] = await Promise.all([
    getLocationBySlug(slug),
    getSettings(),
  ]);

  if (!location) notFound();

  const now = istNow();
  const address = fullAddress(location);
  const directionsUrl =
    location.mapUrl ||
    mapsSearchHref([location.name, location.addressLine, location.area, location.city]);

  const byDay = DAY_LABELS.map((label, dayOfWeek) => ({
    label,
    dayOfWeek,
    slots: location.slots
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
  }));

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
            <Link href="/locations" className="hover:text-brand-700">
              Locations
            </Link>
            <span aria-hidden> / </span>
            <span className="text-ink-700">{location.name}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            {settings.doctorName} at {location.name}
          </h1>
          <p className="mt-4 text-lg text-ink-600">{address}</p>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <div>
          <h2 className="font-serif text-2xl font-semibold">OPD timings</h2>
          {location.slots.length === 0 ? (
            <p className="mt-4 text-ink-600">
              Timings for this location are confirmed on request. Please call{" "}
              {formatPhone(location.phone || settings.primaryPhone)}.
            </p>
          ) : (
            <dl className="mt-5 divide-y divide-ink-200 border-y border-ink-200">
              {byDay.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`flex items-baseline justify-between gap-4 px-1 py-3 ${
                    day.dayOfWeek === now.dayOfWeek ? "bg-brand-50/70" : ""
                  }`}
                >
                  <dt className="text-[15px] font-medium text-ink-900">
                    {day.label}
                    {day.dayOfWeek === now.dayOfWeek && (
                      <span className="ml-2 text-xs font-semibold text-brand-700">
                        Today
                      </span>
                    )}
                  </dt>
                  <dd className="text-right text-[15px] text-ink-700 tabular-nums">
                    {day.slots.length === 0 ? (
                      <span className="text-ink-400">Closed</span>
                    ) : (
                      day.slots.map((slot) => (
                        <span key={slot.id} className="block">
                          {formatRange(slot.startTime, slot.endTime)}
                        </span>
                      ))
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {location.closures.length > 0 && (
            <div className="mt-6 rounded-lg border border-accent-500/30 bg-accent-100 p-4">
              <h3 className="text-sm font-semibold text-ink-900">
                Upcoming unavailability
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {location.closures.map((closure) => (
                  <li key={closure.id}>
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "long",
                      timeZone: "Asia/Kolkata",
                    }).format(closure.date)}
                    {closure.reason ? ` — ${closure.reason}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {location.notes && (
            <p className="mt-6 leading-relaxed text-ink-600">{location.notes}</p>
          )}

          <h2 className="mt-12 font-serif text-2xl font-semibold">
            Getting there
          </h2>
          <p className="mt-3 text-ink-600">{address}</p>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4"
          >
            Open in Google Maps
          </a>

          {location.mapEmbedUrl && (
            <div className="mt-6 overflow-hidden rounded-xl border border-ink-200">
              <iframe
                src={location.mapEmbedUrl}
                title={`Map showing ${location.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full"
              />
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <h2 className="font-serif text-lg font-semibold">Book here</h2>
            {location.fee != null && (
              <p className="mt-2 text-sm text-ink-600">
                Consultation fee ₹{location.fee.toLocaleString("en-IN")}
              </p>
            )}

            {location.bookingUrl ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Appointments at this location are managed by the hospital.
                </p>
                <a
                  href={location.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4 w-full"
                >
                  Book via hospital
                </a>
              </>
            ) : (
              <Link href={`/book?location=${location.slug}`} className="btn-primary mt-4 w-full">
                Request an appointment
              </Link>
            )}

            {location.phone && (
              <a
                href={telHref(location.phone)}
                className="btn-secondary mt-2.5 w-full"
              >
                Call {formatPhone(location.phone)}
              </a>
            )}

            <a
              href={whatsappHref(
                settings.whatsappNumber,
                `Hello, I would like to book an appointment at ${location.name}, ${location.area}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-2.5 w-full"
            >
              WhatsApp the clinic
            </a>
          </div>

          <div className="card bg-ink-50">
            <h2 className="font-serif text-lg font-semibold">Before you travel</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Hospital OPD schedules occasionally change at short notice. A quick
              call to confirm saves a wasted journey, particularly if you are
              coming from outside Delhi.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
