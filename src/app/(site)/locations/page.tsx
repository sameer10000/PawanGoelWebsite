import type { Metadata } from "next";
import Link from "next/link";
import { LocationLogo } from "@/components/site/LocationLogo";
import { WhereToday } from "@/components/site/WhereToday";
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
            Consultations are held across Delhi NCR. Timings can change at short
            notice, so please confirm with the hospital or clinic before
            travelling a long distance.
          </p>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="grid gap-8 ">
          <section>
            <h2 className="font-serif text-2xl font-semibold">
              Locations and timings
            </h2>
            <div className="mt-5 overflow-x-auto rounded-xl border border-ink-200">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <caption className="sr-only">
                  OPD locations, timings, contact details and booking links
                </caption>
                <thead>
                  <tr className="bg-ink-50">
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                    >
                      Timings
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                    >
                      Appointment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200 bg-white">
                  {locations.map((location) => {
                    const directionsUrl =
                      location.mapUrl ||
                      mapsSearchHref([
                        location.name,
                        location.addressLine,
                        location.area,
                        location.city,
                      ]);

                    return (
                      <tr
                        key={location.id}
                        className={
                          location.slots.some((slot) => slot.dayOfWeek === now.dayOfWeek)
                            ? "align-top bg-brand-50/40"
                            : "align-top"
                        }
                      >
                        <th scope="row" className="px-4 py-4">
                          <div className="flex gap-3">
                            <LocationLogo slug={location.slug} name={location.name} />
                            <div className="min-w-0">
                              <Link
                                href={`/locations/${location.slug}`}
                                className="font-serif text-lg font-semibold text-ink-900 hover:text-brand-700"
                              >
                                {location.name}
                              </Link>
                              <p className="mt-1 text-sm font-normal leading-relaxed text-ink-500">
                                {fullAddress(location)}
                              </p>
                              {location.isPrimary && (
                                <span className="badge mt-2 bg-brand-100 text-brand-800">
                                  Own clinic
                                </span>
                              )}
                            </div>
                          </div>
                        </th>
                        <td className="px-4 py-4 text-[15px] text-ink-700">
                          {location.slots.length === 0 ? (
                            <span className="text-ink-500">Timings on request</span>
                          ) : (
                            <ul className="space-y-1.5">
                              {summariseSlots(location.slots).map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          )}
                          {location.fee != null && (
                            <p className="mt-2 text-sm text-ink-500">
                              Consultation Rs {location.fee.toLocaleString("en-IN")}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-2">
                            {location.phone && (
                              <a
                                href={telHref(location.phone)}
                                className="font-medium text-brand-700 hover:underline"
                              >
                                {formatPhone(location.phone)}
                              </a>
                            )}
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-brand-700 hover:underline"
                            >
                              Directions
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {location.isPrimary ? (
                            <Link
                              href={`/book?location=${location.slug}`}
                              className="btn-primary px-4 py-2.5 text-sm"
                            >
                              Book clinic appointment
                            </Link>
                          ) : location.bookingUrl ? (
                            <a
                              href={location.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary px-4 py-2.5 text-sm"
                            >
                              Book with hospital
                            </a>
                          ) : (
                            <Link
                              href={`/locations/${location.slug}`}
                              className="btn-secondary px-4 py-2.5 text-sm"
                            >
                              Hospital details
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="lg:sticky lg:top-24">
            <WhereToday />
          </div>
        </div>
      </div>
    </>
  );
}
