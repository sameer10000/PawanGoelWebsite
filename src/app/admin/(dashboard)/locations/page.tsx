import Link from "next/link";
import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { LocationFields } from "./LocationFields";
import { prisma } from "@/lib/db";
import { summariseSlots } from "@/lib/schedule";
import { formatPhone } from "@/lib/format";
import { createLocation, toggleLocationPublished } from "./actions";

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    include: { slots: true },
  });

  return (
    <>
      <PageHeader
        title="Locations & timings"
        description="Every hospital and clinic where Dr. Goel consults. Timings set here drive the home page “consulting today” panel, the weekly schedule and each location page."
      />

      <ul className="space-y-4">
        {locations.map((location) => (
          <li
            key={location.id}
            className="rounded-xl border border-ink-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-lg font-semibold text-ink-900">
                    <Link
                      href={`/admin/locations/${location.id}`}
                      className="hover:text-brand-700"
                    >
                      {location.name}
                    </Link>
                  </h2>
                  {location.isPrimary && (
                    <span className="badge bg-brand-100 text-brand-800">
                      Own clinic
                    </span>
                  )}
                  <span
                    className={`badge ${
                      location.published
                        ? "bg-green-100 text-green-800"
                        : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {location.published ? "Live" : "Hidden"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {location.addressLine}, {location.area}, {location.city}
                  {location.phone ? ` · ${formatPhone(location.phone)}` : ""}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-ink-700">
                  {summariseSlots(location.slots).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {location.slots.length === 0 && (
                    <li className="text-ink-400">No timings set</li>
                  )}
                </ul>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/admin/locations/${location.id}`}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Edit
                </Link>
                <form action={toggleLocationPublished}>
                  <input type="hidden" name="id" value={location.id} />
                  <SubmitButton
                    className="btn-ghost px-3 py-2 text-sm"
                    pendingLabel="…"
                  >
                    {location.published ? "Hide" : "Publish"}
                  </SubmitButton>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AdminCard
        title="Add a location"
        description="Add the address first, then set the weekly timings on the next screen."
        className="mt-8"
      >
        <form action={createLocation} className="space-y-5">
          <LocationFields />
          <SubmitButton>Add location</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
