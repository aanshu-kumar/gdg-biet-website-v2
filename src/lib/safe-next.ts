/** Cookie holding where to go after sign-in, so the OAuth return URL stays a plain /auth/callback. */
export const NEXT_COOKIE = "auth_next";

/** Only allow same-site relative redirects after sign-in (no open redirects). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard"): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : fallback;
}
