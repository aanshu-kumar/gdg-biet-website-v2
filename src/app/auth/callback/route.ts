import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase-session";
import { requestOrigin } from "@/lib/request-origin";
import { NEXT_COOKIE, safeNext } from "@/lib/safe-next";

/** Google redirects here. Exchange the code, then link the account to its invite. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = requestOrigin(request);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next") ?? decodeCookie(request.cookies.get(NEXT_COOKIE)?.value));

  (await cookies()).delete({ name: NEXT_COOKIE, path: "/auth" });
  if (!code) return NextResponse.redirect(`${origin}/login?error=auth`);

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=auth`);

  // Invite-only: no matching (active) invite means no access.
  const { data: personId } = await supabase.rpc("claim_invite");
  if (!personId) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=not_invited`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}

function decodeCookie(value: string | undefined) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}
