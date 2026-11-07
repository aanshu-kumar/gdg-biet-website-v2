/** Only allow same-site relative redirects after sign-in (no open redirects). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard"): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : fallback;
}
