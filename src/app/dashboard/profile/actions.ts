"use server";

import type { ActionResult } from "@/components/dashboard/ActionForm";
import { requireViewer } from "@/lib/auth";
import { flash, friendlyError, list, optional, revalidatePublic, text, uploadImage, url } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export async function updateProfile(form: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createSessionClient();
  const back = "/dashboard/profile";

  const fullName = text(form, "full_name", 120);
  if (!fullName) return { error: "Please enter your name." };

  const links = { linkedin_url: url(form, "linkedin_url"), twitter_url: url(form, "twitter_url"), github_url: url(form, "github_url"), website_url: url(form, "website_url") };
  for (const r of Object.values(links)) if ("error" in r) return { error: r.error };

  // Avatars live under avatars/<auth uid>/ — the storage policy only allows your own folder.
  const upload = await uploadImage(supabase, form.get("avatar"), `avatars/${viewer.userId}`);
  if ("error" in upload) return { error: upload.error };

  const { error } = await supabase
    .from("people")
    .update({
      full_name: fullName,
      bio: optional(form, "bio", 600),
      skills: list(form, "skills"),
      ...Object.fromEntries(Object.entries(links).map(([k, r]) => [k, "value" in r ? r.value : null])),
      ...(upload.key ? { avatar_path: upload.key } : {}),
    })
    .eq("id", viewer.personId);
  if (error) return { error: friendlyError(error.message) };

  // Replaced photo: remove the old file (only ever one of your own uploads; the storage policy enforces that).
  const previous = text(form, "previous_avatar");
  if (upload.key && previous.startsWith(`avatars/${viewer.userId}/`)) {
    await supabase.storage.from("assets").remove([previous]);
  }

  revalidatePublic();
  flash(back, "ok", "Profile saved. The Team page will show your changes.");
}
