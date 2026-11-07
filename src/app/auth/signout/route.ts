import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin } from "@/lib/request-origin";
import { createSessionClient } from "@/lib/supabase-session";

// POST only, so a link or prefetch can't sign someone out.
export async function POST(request: NextRequest) {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${requestOrigin(request)}/login?signed_out=1`, { status: 303 });
}
