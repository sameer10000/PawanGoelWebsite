import { notFound } from "next/navigation";
import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { LocationFields } from "../LocationFields";
import { prisma } from "@/lib/db";
import { DAY_LABELS, DAY_SHORT, formatRange, toMinutes } from "@/lib/schedule";
import { addSlots, deleteLocation, deleteSlot, updateLocation } from "../actions";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await prisma.location.findUnique({
    where: { id: Number(id) },
    include: { slots: true },
  });

  if (!location) notFound();

  const slotsByDay = DAY_LABELS.map((label, dayOfWeek) => ({
    label,
    dayOfWeek,
    slots: location.slots
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
  }));

  return (
    <>
      <PageHeader
        title={location.name}
        description={`${location.area}, ${location.city}`}
        back={{ href: "/admin/locations", label: "All locations" }}
      />

      <AdminCard
        title="Weekly OPD timings"
        description="Add a session to several days at once by ticking multiple days below."
      >
        <div className="overflow-hidden rounded-lg border border-ink-200">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-ink-200">
              {slotsByDay.map((day) => (
                <tr key={day.dayOfWeek}>
                  <th
                    scope="row"
                    className="w-32 px-4 py-3 align-top font-medium text-ink-900"
                  >
                    {day.label}
                  </th>
                  <td className="px-4 py-3">
                    {day.slots.length === 0 ? (
                      <span className="text-ink-400">No OPD</span>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {day.slots.map((slot) => (
                          <li key={slot.id}>
                            <form action={deleteSlot} className="inline-flex">
                              <input type="hidden" name="id" value={slot.id} />
                              <input
                                type="hidden"
                                name="locationId"
                                value={location.id}
                              />
                              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 py-1 pr-1.5 pl-3">
                                <span className="tabular-nums">
                                  {formatRange(slot.startTime, slot.endTime)}
                                </span>
                                <ConfirmButton
                                  message={`Remove ${formatRange(slot.startTime, slot.endTime)} on ${day.label}?`}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-ink-400 hover:bg-red-100 hover:text-red-700"
                                >
                                  ×
                                </ConfirmButton>
                              </span>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={addSlots} className="mt-6 space-y-4 border-t border-ink-200 pt-6">
          <input type="hidden" name="locationId" value={location.id} />
          <fieldset>
            <legend className="label">Days</legend>
            <div className="flex flex-wrap gap-2">
              {DAY_SHORT.map((short, index) => (
                <label
                  key={short}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-300 px-3 py-2 text-sm hover:border-brand-400"
                >
                  <input
                    type="checkbox"
                    name="days"
                    value={index}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600"
                  />
                  {short}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:max-w-md sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="label">
                From
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="label">
                To
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                required
                className="input"
              />
            </div>
          </div>

          <SubmitButton pendingLabel="Adding…">Add session</SubmitButton>
        </form>
      </AdminCard>

      <AdminCard title="Location details" className="mt-6">
        <form action={updateLocation} className="space-y-5">
          <input type="hidden" name="id" value={location.id} />
          <LocationFields location={location} />
          <div className="flex flex-wrap items-center gap-4 border-t border-ink-200 pt-5">
            <SubmitButton>Save changes</SubmitButton>
            <p className="text-xs text-ink-500">
              Page address: /locations/{location.slug}
            </p>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Delete location" className="mt-6 border-red-200">
        <p className="text-sm leading-relaxed text-ink-600">
          Deleting removes this location, its timings and its page permanently.
          To take it off the website temporarily, untick “Show on website”
          instead.
        </p>
        <form action={deleteLocation} className="mt-4">
          <input type="hidden" name="id" value={location.id} />
          <ConfirmButton
            message={`Delete ${location.name} and all its timings? This cannot be undone.`}
            className="btn-danger px-4 py-2 text-sm"
          >
            Delete permanently
          </ConfirmButton>
        </form>
      </AdminCard>
    </>
  );
}
