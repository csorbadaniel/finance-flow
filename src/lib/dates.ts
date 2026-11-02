/** Shared date helpers. The app shows every date as YYYY-MM-DD (local time). */

const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a Date as YYYY-MM-DD in local time. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's local date as YYYY-MM-DD. */
export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

/**
 * Displays a stored record date (already YYYY-MM-DD). Kept as a string slice so
 * time zones can never shift the day.
 */
export function formatDisplayDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/** Displays a YYYY-MM month key. */
export function formatMonthKey(monthKey: string): string {
  return monthKey.slice(0, 7);
}

/** Formats a timestamp as YYYY-MM-DD HH:mm in local time. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${toIsoDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
