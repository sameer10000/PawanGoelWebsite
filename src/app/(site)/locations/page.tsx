import type { Metadata } from "next";
import Link from "next/link";
import { WhereToday } from "@/components/site/WhereToday";
import { WeeklyTimetable } from "@/components/site/WeeklyTimetable";
import { getPublishedLocations, getTodaySchedule } from "@/lib/queries";
import { summariseSlots } from "@/lib/schedule";
import { formatPhone, fullAddress, mapsSearchHref, telHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Locations & OPD Timings",
  description:
    "Consulting timings for Dr. Pawan Goel across Shalimar Bagh, Punjabi Bagh, Bahadurgarh and other Delhi NCR locations.",
};

export default async function LocationsPage() {
  const [locations, { now }] = await Promise.all([
    getPublishedLocations(),
    getTodaySchedule(),
  ]);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Locations</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Locations & OPD timings
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Consultations are held across several hospitals in Delhi NCR alongside
            a private clinic in Shalimar Bagh. Timings can change at short notice
            — please call ahead before travelling a long distance.
          </p>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Weekly schedule</h2>
            <div className="mt-5">
              <WeeklyTimetable locations={locations} todayIndex={now.dayOfWeek} />
            </div>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <WhereToday />
          </div>
        </div>

        <h2 className="mt-16 font-serif text-2xl font-semibold">All locations</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {locations.map((location) => (
            <li key={location.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-semibold">
                    <Link
                      href={`/locations/${location.slug}`}
                      className="hover:text-brand-700"
                    >
                      {location.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">
                    {fullAddress(location)}
                  </p>
                </div>
                {location.isPrimary && (
                  <span className="badge shrink-0 bg-brand-100 text-brand-800">
                    Own clinic
                  </span>
                )}
              </div>

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

              <div className="mt-5 flex flex-wrap gap-2.5">
                {location.phone && (
                  <a
                    href={telHref(location.phone)}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    {formatPhone(location.phone)}
                  </a>
                )}
                <a
                  href={
                    location.mapUrl ||
                    mapsSearchHref([location.name, location.addressLine, location.city])
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Directions
                </a>
                <Link
                  href={`/locations/${location.slug}`}
                  className="btn-ghost px-3 py-2 text-sm"
                >
                  Details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
