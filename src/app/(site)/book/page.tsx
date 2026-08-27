import type { Metadata } from "next";
import { BookingForm } from "@/components/site/BookingForm";
import { WhereToday } from "@/components/site/WhereToday";
import {
  getPublishedConditions,
  getPublishedLocations,
  getSettings,
} from "@/lib/queries";
import { formatPhone, telHref, whatsappHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Request an appointment with Dr. Pawan Goel, Consultant Endocrinologist, in Shalimar Bagh, Punjabi Bagh or Bahadurgarh.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const [locations, settings, conditions] = await Promise.all([
    getPublishedLocations(),
    getSettings(),
    getPublishedConditions(),
  ]);
  const selectedLocation = locations.find((l) => l.slug === location);
  const showingHospitalBooking = Boolean(selectedLocation && !selectedLocation.isPrimary);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Appointments</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Book an appointment
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Clinic appointments can be requested here. Hospital appointments are
            handled directly by the respective hospital.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <div>
          <BookingForm
            locations={locations.map((l) => ({
              id: l.id,
              slug: l.slug,
              name: l.name,
              area: l.area,
              bookingUrl: l.bookingUrl,
              isPrimary: l.isPrimary,
            }))}
            defaultLocationSlug={location}
            concerns={conditions.map((c) => c.name)}
            phone={settings.primaryPhone}
            whatsapp={settings.whatsappNumber}
            doctorName={settings.doctorName}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {!showingHospitalBooking && (
            <div className="card">
              <h2 className="font-serif text-lg font-semibold">Faster options</h2>
              <a
                href={telHref(settings.primaryPhone)}
                className="btn-secondary mt-4 w-full"
              >
                Call {formatPhone(settings.primaryPhone)}
              </a>
              <a
                href={whatsappHref(
                  settings.whatsappNumber,
                  `Hello, I would like to book an appointment with ${settings.doctorName}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp mt-2.5 w-full"
              >
                WhatsApp the clinic
              </a>
            </div>
          )}

          <WhereToday />

          <div className="card bg-ink-50">
            <h2 className="font-serif text-lg font-semibold">What to bring</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-ink-700">
              {[
                "All previous prescriptions",
                "Blood test and scan reports, including old ones",
                "A list of your current medicines and doses",
                "Home glucose or blood pressure readings, if you record them",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
