import Link from "next/link";
import { getPublishedLocations, getTodaySchedule } from "@/lib/queries";
import {
  DAY_LABELS,
  formatRange,
  nextAvailable,
  relativeDayLabel,
} from "@/lib/schedule";
import { formatPhone, telHref } from "@/lib/format";

/**
 * The one thing patients of a visiting consultant always want to know and can
 * never find: which of the six hospitals is he at right now. Neither Practo nor
 * any single hospital page can answer this, which makes it worth doing well.
 */
export async function WhereToday() {
  const [{ now, entries, closedEverywhere, closureReason }, locations] =
    await Promise.all([getTodaySchedule(), getPublishedLocations()]);

  const upcoming = nextAvailable(locations, now);
  const dayName = DAY_LABELS[now.dayOfWeek];

  return (
    <section
      aria-labelledby="where-today"
      className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="where-today" className="font-serif text-lg font-semibold">
          Consulting today
        </h2>
        <p className="text-sm text-brand-800">{dayName}</p>
      </div>

      {closedEverywhere ? (
        <p className="mt-4 text-[15px] text-ink-700">
          No OPD today{closureReason ? ` — ${closureReason}` : ""}.
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-[15px] text-ink-700">
          No scheduled OPD on {dayName}s.
        </p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {entries.map((entry, index) => (
            <li key={`${entry.location.id}-${index}`}>
              <Link
                href={`/locations/${entry.location.slug}`}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border bg-white px-4 py-3.5 transition-colors hover:border-brand-400 ${
                  entry.status === "now"
                    ? "border-brand-400 ring-1 ring-brand-300"
                    : "border-ink-200"
                } ${entry.status === "finished" ? "opacity-55" : ""}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900">
                    {entry.location.name}
                  </span>
                  <span className="block text-sm text-ink-500">
                    {entry.location.area}
                  </span>
                </span>
                <span className="text-sm font-medium text-ink-700 tabular-nums">
                  {formatRange(entry.slot.startTime, entry.slot.endTime)}
                </span>
                {entry.status === "now" && (
                  <span className="badge bg-brand-600 text-white">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-white"
                    />
                    In OPD now
                  </span>
                )}
                {entry.status === "finished" && (
                  <span className="badge bg-ink-100 text-ink-500">Finished</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {upcoming && (entries.length === 0 || closedEverywhere) && (
        <p className="mt-4 text-sm text-ink-600">
          Next available{" "}
          {relativeDayLabel(upcoming.dayOffset, now.dayOfWeek)} at{" "}
          <Link
            href={`/locations/${upcoming.location.slug}`}
            className="font-medium text-brand-700 hover:underline"
          >
            {upcoming.location.name}
          </Link>
          , {formatRange(upcoming.slot.startTime, upcoming.slot.endTime)}.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/book" className="btn-primary px-4 py-2.5 text-sm">
          Book an appointment
        </Link>
        <Link href="/locations" className="btn-secondary px-4 py-2.5 text-sm">
          All timings
        </Link>
      </div>
    </section>
  );
}

export function ClinicPhone({ phone }: { phone: string }) {
  return (
    <a href={telHref(phone)} className="font-medium text-brand-700 hover:underline">
      {formatPhone(phone)}
    </a>
  );
}
