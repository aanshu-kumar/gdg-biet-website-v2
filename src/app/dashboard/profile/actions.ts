"use server";

import type { ActionResult } from "@/components/dashboard/ActionForm";
import { requireViewer } from "@/lib/auth";
import { flash, revalidatePublic, saveProfileFields, text } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export async function updateProfile(form: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createSessionClient();
  // Your own photos live under avatars/<auth uid>/ — the storage policy only allows your own folder.
  const result = await saveProfileFields(supabase, viewer.personId, form, `avatars/${viewer.userId}`);
  if (result) return result;
  revalidatePublic();
  flash("/dashboard/profile", "ok", "Profile saved. The Team page will show your changes.");
}

/** Admins (and leads, for their own members) editing someone else's profile. */
export async function updatePersonProfile(form: FormData): Promise<ActionResult> {
  await requireViewer();
  const supabase = await createSessionClient();
  const id = text(form, "id");
  // people/<person id>/ uploads are allowed only for people the caller can manage (storage policy).
  const result = await saveProfileFields(supabase, id, form, `people/${id}`);
  if (result) return result;
  revalidatePublic();
  flash(`/dashboard/members/${id}`, "ok", "Profile saved. The Team page will show the changes.");
}
