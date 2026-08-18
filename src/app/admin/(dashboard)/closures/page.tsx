import { PageHeader, AdminCard, EmptyState } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { addClosure, deleteClosure } from "./actions";

export default async function ClosuresPage() {
  const startOfToday = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");

  const [closures, locations] = await Promise.all([
    prisma.closure.findMany({
      where: { date: { gte: startOfToday } },
      orderBy: { date: "asc" },
      include: { location: true },
    }),
    prisma.location.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Leave & holidays"
        description="Mark a day off and the website stops showing that OPD immediately — on the home page panel, the weekly schedule and the location page."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <AdminCard title="Upcoming unavailability">
          {closures.length === 0 ? (
            <EmptyState
              title="Nothing marked"
              description="All scheduled OPDs are showing as normal."
            />
          ) : (
            <ul className="divide-y divide-ink-200">
              {closures.map((closure) => (
                <li
                  key={closure.id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {formatDate(closure.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {closure.location
                        ? closure.location.name
                        : "All locations — full day off"}
                      {closure.reason ? ` · ${closure.reason}` : ""}
                    </p>
                  </div>
                  <form action={deleteClosure}>
                    <input type="hidden" name="id" value={closure.id} />
                    <ConfirmButton message="Remove this leave entry?">
                      Remove
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Mark a day unavailable">
          <form action={addClosure} className="space-y-5">
            <div>
              <label htmlFor="date" className="label">
                Date <span className="text-red-600">*</span>
              </label>
              <input id="date" name="date" type="date" required className="input" />
            </div>

            <div>
              <label htmlFor="locationId" className="label">
                Applies to
              </label>
              <select id="locationId" name="locationId" defaultValue="" className="input">
                <option value="">All locations (full day off)</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} — {location.area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="label">
                Reason shown to patients
              </label>
              <input
                id="reason"
                name="reason"
                placeholder="Conference / public holiday"
                className="input"
              />
              <p className="hint">Optional. Keep it brief and public-facing.</p>
            </div>

            <SubmitButton pendingLabel="Adding…">Mark unavailable</SubmitButton>
          </form>
        </AdminCard>
      </div>
    </>
  );
}
