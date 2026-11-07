"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase-session";
import { NEXT_COOKIE, safeNext } from "@/lib/safe-next";

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(form.get("next"));
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  // Keep the return URL free of query params: Supabase matches it against the Redirect URLs
  // allow-list including the query string, so "/auth/callback?next=…" wouldn't match a plain
  // "/auth/callback" entry and Supabase would silently fall back to the homepage.
  (await cookies()).set(NEXT_COOKIE, next, { httpOnly: true, sameSite: "lax", secure: origin.startsWith("https"), path: "/auth", maxAge: 600 });

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
