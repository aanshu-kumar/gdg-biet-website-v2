import type { NextRequest } from "next/server";

/**
 * The origin the visitor actually used (e.g. the app host), from the forwarded
 * headers. request.url can carry an internal host, which would send someone to
 * the wrong address after sign-in and lose their session cookie.
 */
export function requestOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return new URL(request.url).origin;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}
