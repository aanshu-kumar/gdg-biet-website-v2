import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Public bucket that holds every image the site renders. */
export const ASSET_BUCKET = "assets";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/** Anonymous client: read-only access to public tables, insert into contact_messages. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  return client;
}

/**
 * Resolves an image reference to a URL.
 * - Absolute URLs pass through.
 * - Paths starting with "/" are files in /public (local fallback data).
 * - Anything else is an object key in the Supabase `assets` bucket.
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  if (!SUPABASE_URL) return `/${path}`;
  const key = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${ASSET_BUCKET}/${key}`;
}
