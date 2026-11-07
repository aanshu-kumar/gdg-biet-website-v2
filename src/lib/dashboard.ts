import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PublishState = "draft" | "pending" | "published";

export type Department = { id: string; name: string; description: string | null; sort_order: number; is_active: boolean };
export type PersonRow = {
  id: string;
  email: string;
  user_id: string | null;
  full_name: string;
  is_admin: boolean;
  department_id: string | null;
  avatar_path: string | null;
  bio: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  website_url: string | null;
  skills: string[];
  is_active: boolean;
};

/** Form helpers — every value from FormData is untrusted. */
export const text = (form: FormData, key: string, max = 5000) => String(form.get(key) ?? "").trim().slice(0, max);
export const optional = (form: FormData, key: string, max = 5000) => text(form, key, max) || null;
export const list = (form: FormData, key: string) =>
  [...new Set(text(form, key).split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 12);

/** Accepts only http(s) URLs; anything else becomes an error rather than a stored link. */
export function url(form: FormData, key: string): { value: string | null } | { error: string } {
  const raw = text(form, key, 500);
  if (!raw) return { value: null };
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return { value: u.toString() };
  } catch {
    return { error: `“${raw}” isn't a valid web address.` };
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/**
 * Uploads an image from a form to the `assets` bucket (as the signed-in user,
 * so storage policies apply). Returns the object key, null when no file was
 * chosen, or an error message. SVG is rejected on purpose (it can carry script).
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: FormDataEntryValue | null,
  folder: string,
): Promise<{ key: string | null } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) return { key: null };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Images must be JPG, PNG or WebP." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images must be 2 MB or smaller." };

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from("assets").upload(key, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { key };
}

/** Refresh the public pages that show team-managed content. */
export function revalidatePublic() {
  for (const p of ["/", "/events", "/team", "/blog"]) revalidatePath(p);
  revalidatePath("/blog/[slug]", "page");
}

/** Redirect back with a message the page shows as a banner. */
export function flash(path: string, kind: "ok" | "error", message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(message)}`);
}

/** Turns Postgres/RLS errors into something a student organizer can act on. */
export function friendlyError(message: string): string {
  if (/row-level security|42501|permission denied/i.test(message)) return "You don't have permission to do that.";
  if (/positions_one_per_person/.test(message)) return "Someone can only hold one position per session.";
  if (/duplicate key.*email|people_email_unique|people_email_check/.test(message)) return "That email has already been invited.";
  if (/duplicate key.*slug|posts_slug_key/.test(message)) return "Another post already uses that URL. Change the title or URL.";
  if (/duplicate key.*departments_name_key/.test(message)) return "A department with that name already exists.";
  if (/duplicate key.*start_year/.test(message)) return "That session already exists.";
  return message;
}
