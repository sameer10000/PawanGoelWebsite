import Link from "next/link";
import { PageHeader, AdminCard, EmptyState } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/db";
import { getTodaySchedule } from "@/lib/queries";
import { DAY_LABELS, formatRange } from "@/lib/schedule";
import { formatDateTime, formatPhone, telHref } from "@/lib/format";

export default async function AdminDashboard() {
  const [
    { now, entries, closedEverywhere },
    newCount,
    totalAppointments,
    recent,
    locationCount,
    unpublishedLocations,
    conditionCount,
    photoCount,
    pendingTestimonials,
  ] = await Promise.all([
    getTodaySchedule(),
    prisma.appointment.count({ where: { status: "new" } }),
    prisma.appointment.count(),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { location: true },
    }),
    prisma.location.count({ where: { published: true } }),
    prisma.location.count({ where: { published: false } }),
    prisma.condition.count({ where: { published: true } }),
    prisma.photo.count(),
    prisma.testimonial.count({ where: { published: false } }),
  ]);

  const stats = [
    { label: "New requests", value: newCount, href: "/admin/appointments" },
    { label: "Total requests", value: totalAppointments, href: "/admin/appointments" },
    { label: "Live locations", value: locationCount, href: "/admin/locations" },
    { label: "Condition pages", value: conditionCount, href: "/admin/conditions" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the website is edited from here. Changes go live immediately."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
          >
            <p className="text-sm text-ink-500">{stat.label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-ink-900">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard
          title={`Consulting today — ${DAY_LABELS[now.dayOfWeek]}`}
          description="This is what patients see on the home page right now."
        >
          {closedEverywhere ? (
            <p className="text-sm text-ink-600">
              Marked as unavailable for the whole day.
            </p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-ink-600">
              No OPD scheduled for {DAY_LABELS[now.dayOfWeek]}s.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {entries.map((entry, index) => (
                <li
                  key={`${entry.location.id}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-200 px-4 py-3"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink-900">
                      {entry.location.name}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {entry.location.area}
                    </span>
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="text-sm text-ink-700 tabular-nums">
                      {formatRange(entry.slot.startTime, entry.slot.endTime)}
                    </span>
                    {entry.status === "now" && (
                      <span className="badge bg-brand-600 text-white">Now</span>
                    )}
                    {entry.status === "finished" && (
                      <span className="badge bg-ink-100 text-ink-500">Done</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/admin/locations" className="btn-secondary px-4 py-2 text-sm">
              Edit timings
            </Link>
            <Link href="/admin/closures" className="btn-secondary px-4 py-2 text-sm">
              Mark leave
            </Link>
          </div>
        </AdminCard>

        <AdminCard
          title="Latest appointment requests"
          description="Requests submitted through the website booking form."
        >
          {recent.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Submissions from the booking form will appear here."
            />
          ) : (
            <ul className="divide-y divide-ink-200">
              {recent.map((appointment) => (
                <li key={appointment.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {appointment.name}
                      {appointment.status === "new" && (
                        <span className="badge ml-2 bg-brand-100 text-brand-800">
                          New
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      <a
                        href={telHref(appointment.phone)}
                        className="hover:text-brand-700"
                      >
                        {formatPhone(appointment.phone)}
                      </a>
                      {appointment.location ? ` · ${appointment.location.name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-400">
                    {formatDateTime(appointment.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/appointments"
            className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
          >
            View all requests →
          </Link>
        </AdminCard>
      </div>

      <AdminCard
        title="Before going live"
        description="Seed content was assembled from public hospital and directory listings. Confirm each of these with Dr. Goel."
        className="mt-6"
      >
        <ul className="space-y-3 text-sm">
          {[
            {
              done: photoCount > 0,
              label: "Upload a portrait photograph and clinic photos",
              href: "/admin/photos",
            },
            {
              done: unpublishedLocations === 0,
              label:
                unpublishedLocations > 0
                  ? `Confirm timings for ${unpublishedLocations} hidden location${unpublishedLocations > 1 ? "s" : ""} (Pentamed, Saroj)`
                  : "All locations confirmed and published",
              href: "/admin/locations",
            },
            {
              done: false,
              label: "Verify every OPD timing, fee and phone number",
              href: "/admin/locations",
            },
            {
              done: pendingTestimonials === 0,
              label:
                pendingTestimonials > 0
                  ? `${pendingTestimonials} testimonial${pendingTestimonials > 1 ? "s" : ""} awaiting approval`
                  : "Add patient testimonials (with written consent)",
              href: "/admin/testimonials",
            },
            {
              done: false,
              label: "Add the medical registration number",
              href: "/admin/settings",
            },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  item.done
                    ? "bg-brand-600 text-white"
                    : "border border-ink-300 text-transparent"
                }`}
              >
                ✓
              </span>
              <Link
                href={item.href}
                className={`hover:text-brand-700 ${item.done ? "text-ink-400 line-through" : "text-ink-700"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </AdminCard>
    </>
  );
}
