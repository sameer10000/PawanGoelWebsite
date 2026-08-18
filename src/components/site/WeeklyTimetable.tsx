import Link from "next/link";
import { DAY_LABELS, DAY_SHORT, formatRange, toMinutes } from "@/lib/schedule";

type Location = {
  id: number;
  slug: string;
  name: string;
  area: string;
  slots: { dayOfWeek: number; startTime: string; endTime: string }[];
};

/**
 * Full week at a glance. Patients travelling across Delhi plan around the day,
 * not the location, so the day is the primary axis.
 */
export function WeeklyTimetable({
  locations,
  todayIndex,
}: {
  locations: Location[];
  todayIndex: number;
}) {
  const days = DAY_LABELS.map((label, dayOfWeek) => {
    const sessions = locations
      .flatMap((location) =>
        location.slots
          .filter((slot) => slot.dayOfWeek === dayOfWeek)
          .map((slot) => ({ location, slot })),
      )
      .sort((a, b) => toMinutes(a.slot.startTime) - toMinutes(b.slot.startTime));
    return { label, dayOfWeek, sessions };
  });

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Weekly consulting schedule</caption>
        <thead>
          <tr className="bg-ink-50">
            <th
              scope="col"
              className="w-28 px-4 py-3 text-xs font-semibold tracking-wide text-ink-500 uppercase sm:w-36"
            >
              Day
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold tracking-wide text-ink-500 uppercase"
            >
              Consulting at
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {days.map((day) => (
            <tr
              key={day.dayOfWeek}
              className={day.dayOfWeek === todayIndex ? "bg-brand-50/70" : ""}
            >
              <th
                scope="row"
                className="px-4 py-4 align-top text-sm font-semibold text-ink-900"
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{DAY_SHORT[day.dayOfWeek]}</span>
                {day.dayOfWeek === todayIndex && (
                  <span className="mt-1 block text-xs font-medium text-brand-700">
                    Today
                  </span>
                )}
              </th>
              <td className="px-4 py-4">
                {day.sessions.length === 0 ? (
                  <span className="text-sm text-ink-400">No scheduled OPD</span>
                ) : (
                  <ul className="space-y-2.5">
                    {day.sessions.map(({ location, slot }, index) => (
                      <li
                        key={`${location.id}-${index}`}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                      >
                        <Link
                          href={`/locations/${location.slug}`}
                          className="font-medium text-ink-900 hover:text-brand-700"
                        >
                          {location.name}
                        </Link>
                        <span className="text-sm text-ink-500">
                          {location.area}
                        </span>
                        <span className="text-sm font-medium text-ink-700 tabular-nums">
                          {formatRange(slot.startTime, slot.endTime)}
                        </span>
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
  );
}
