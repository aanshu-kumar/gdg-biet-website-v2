import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Team-only routes. On the app host these are all that's served; on the public
// site host they redirect to the app host.
const APP_PATHS = ["/dashboard", "/login", "/auth"];
const isAppPath = (path: string) => APP_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).host : null;
  } catch {
    return null;
  }
};

/**
 * 1. Splits the public site and the team dashboard across two hostnames when
 *    SITE_URL and APP_URL are set (e.g. gdgcbiet-lucknow.vercel.app and
 *    gdgcbiet-lucknow-app.vercel.app). Any other host — localhost, Vercel
 *    preview URLs — serves everything, so testing works on one address.
 * 2. Keeps the Supabase session fresh and gates /dashboard.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host");
  const siteHost = hostOf(process.env.SITE_URL);
  const appHost = hostOf(process.env.APP_URL);

  // If a callback URL is missing from Supabase's Redirect URLs allow-list, Supabase
  // silently sends the visitor to the Site URL root with ?code=… instead. Finish the
  // sign-in on the callback rather than dropping it. The PKCE verifier cookie lives
  // on the host that started sign-in: the app host when split, otherwise this one.
  const code = request.nextUrl.searchParams.get("code");
  if (pathname === "/" && code && /^[0-9a-f-]{36}$/i.test(code)) {
    const callback = new URL("/auth/callback", appHost ? process.env.APP_URL : request.url);
    callback.searchParams.set("code", code); // the post-login destination travels in the auth_next cookie
    return NextResponse.redirect(callback);
  }

  if (siteHost && appHost) {
    if (host === appHost && !isAppPath(pathname)) {
      // "/" on the app host is the dashboard; everything else belongs to the public site.
      if (pathname === "/") return NextResponse.redirect(new URL("/dashboard", request.url));
      return NextResponse.redirect(new URL(pathname + search, process.env.SITE_URL));
    }
    if (host === siteHost && isAppPath(pathname)) {
      return NextResponse.redirect(new URL(pathname + search, process.env.APP_URL));
    }
  }

  let response = NextResponse.next({ request });
  if (host && host === appHost) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (!isAppPath(pathname)) return response;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        if (host && host === appHost) response.headers.set("X-Robots-Tag", "noindex, nofollow");
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT signature locally against the project's public
  // (ES256) signing keys, refreshing an expired session first — no round trip to
  // Supabase Auth on every request, unlike getUser().
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && pathname.startsWith("/dashboard")) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  // Everything except static files, so the host split covers every page.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|brand/|Team/|projects/|sponsors/|stories/|.*\\.(?:png|jpe?g|svg|webp|gif|ico)$).*)"],
};
