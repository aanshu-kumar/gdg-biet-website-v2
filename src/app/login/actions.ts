"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase-session";
import { safeNext } from "@/lib/safe-next";

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(form.get("next"));
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
