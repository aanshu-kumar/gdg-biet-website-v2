// The club is in Lucknow, so event times are entered and shown in IST
// regardless of where the server runs.
export const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

/** "2026-11-20T17:00" from a datetime-local input → ISO timestamp in IST. */
export function fromLocalInput(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00${IST_OFFSET}` : null;
}

/** ISO timestamp → "2026-11-20T17:00" for a datetime-local input, in IST. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
