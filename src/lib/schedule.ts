/**
 * Schedule helpers. All reasoning happens in IST regardless of where the
 * server runs, otherwise a Vercel box in UTC shows the wrong day after 5:30am.
 */

export const IST = "Asia/Kolkata";

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type IstNow = {
  /** yyyy-mm-dd in IST */
  isoDate: string;
  /** 0 = Sunday */
  dayOfWeek: number;
  /** minutes since midnight IST */
  minutes: number;
};

export function istNow(at: Date = new Date()): IstNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(at);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return {
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
    dayOfWeek: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** "14:00" -> "2:00 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

export function formatRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** [2,4,6] -> "Tue, Thu & Sat"; a full week collapses to "Every day". */
export function formatDayList(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 7) return "Every day";
  if (sorted.length === 6 && !sorted.includes(0)) return "Mon – Sat";
  if (sorted.length === 5 && !sorted.includes(0) && !sorted.includes(6)) {
    return "Mon – Fri";
  }
  const names = sorted.map((d) => DAY_SHORT[d]);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export type Slot = { dayOfWeek: number; startTime: string; endTime: string };

/** Collapse weekly slots into readable lines: "Tue, Thu & Sat · 2:00 PM – 4:00 PM" */
export function summariseSlots(slots: Slot[]): string[] {
  const buckets = new Map<string, number[]>();
  for (const slot of slots) {
    const key = `${slot.startTime}-${slot.endTime}`;
    const existing = buckets.get(key);
    if (existing) existing.push(slot.dayOfWeek);
    else buckets.set(key, [slot.dayOfWeek]);
  }

  return [...buckets.entries()]
    .sort((a, b) => toMinutes(a[0].split("-")[0]) - toMinutes(b[0].split("-")[0]))
    .map(([key, days]) => {
      const [start, end] = key.split("-");
      return `${formatDayList(days)} · ${formatRange(start, end)}`;
    });
}

export type TodayEntry<L> = {
  location: L;
  slot: Slot;
  status: "upcoming" | "now" | "finished";
};

/**
 * Which locations the doctor sits at today, in chronological order.
 * `closedLocationIds` covers per-location leave; `closedEverywhere` is a full day off.
 */
export function buildToday<L extends { id: number; slots: Slot[] }>(
  locations: L[],
  options: {
    now?: IstNow;
    closedLocationIds?: Set<number>;
    closedEverywhere?: boolean;
  } = {},
): TodayEntry<L>[] {
  const now = options.now ?? istNow();
  if (options.closedEverywhere) return [];
  const closed = options.closedLocationIds ?? new Set<number>();

  const entries: TodayEntry<L>[] = [];
  for (const location of locations) {
    if (closed.has(location.id)) continue;
    for (const slot of location.slots) {
      if (slot.dayOfWeek !== now.dayOfWeek) continue;
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      entries.push({
        location,
        slot,
        status:
          now.minutes >= start && now.minutes < end
            ? "now"
            : now.minutes < start
              ? "upcoming"
              : "finished",
      });
    }
  }

  return entries.sort(
    (a, b) => toMinutes(a.slot.startTime) - toMinutes(b.slot.startTime),
  );
}

/** yyyy-mm-dd for a Date, evaluated in IST. */
export function toIsoDate(date: Date): string {
  return istNow(date).isoDate;
}

/**
 * The next consulting session from now, looking up to a week ahead.
 * Used when there is nothing left today so the page never dead-ends.
 */
export function nextAvailable<L extends { id: number; slots: Slot[] }>(
  locations: L[],
  now: IstNow = istNow(),
): { location: L; slot: Slot; dayOffset: number } | null {
  for (let offset = 0; offset <= 7; offset++) {
    const day = (now.dayOfWeek + offset) % 7;
    const candidates: { location: L; slot: Slot }[] = [];

    for (const location of locations) {
      for (const slot of location.slots) {
        if (slot.dayOfWeek !== day) continue;
        if (offset === 0 && toMinutes(slot.startTime) <= now.minutes) continue;
        candidates.push({ location, slot });
      }
    }

    if (candidates.length) {
      candidates.sort(
        (a, b) => toMinutes(a.slot.startTime) - toMinutes(b.slot.startTime),
      );
      return { ...candidates[0], dayOffset: offset };
    }
  }
  return null;
}

/** "today" / "tomorrow" / "on Saturday" */
export function relativeDayLabel(dayOffset: number, dayOfWeek: number): string {
  if (dayOffset === 0) return "today";
  if (dayOffset === 1) return "tomorrow";
  return `on ${DAY_LABELS[(dayOfWeek + dayOffset) % 7]}`;
}
