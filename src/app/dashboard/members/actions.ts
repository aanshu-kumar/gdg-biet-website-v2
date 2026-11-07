"use server";

import { requireLead } from "@/lib/auth";
import { flash, friendlyError, revalidatePublic, text } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

const back = "/dashboard/members";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function invitePerson(form: FormData) {
  const viewer = await requireLead();
  const supabase = await createSessionClient();

  const email = text(form, "email", 200).toLowerCase();
  if (!EMAIL.test(email)) flash(back, "error", "Enter a valid email address.");
  const departmentId = text(form, "department_id") || null;
  const mayChooseAny = viewer.isAdmin || viewer.isClubLead;
  if (!mayChooseAny && (!departmentId || !viewer.ledDepartmentIds.includes(departmentId))) {
    flash(back, "error", "Invite members into a department you lead.");
  }

  const { error } = await supabase.from("people").insert({
    email,
    full_name: text(form, "full_name", 120),
    department_id: departmentId,
    is_admin: viewer.isAdmin && form.get("is_admin") === "on",
  });
  if (error) flash(back, "error", friendlyError(error.message));
  flash(back, "ok", `Invited ${email}. They can now sign in with that Google account.`);
}

export async function updatePerson(form: FormData) {
  await requireLead();
  const supabase = await createSessionClient();
  const id = text(form, "id");
  const op = text(form, "op");

  const patch =
    op === "deactivate" ? { is_active: false }
    : op === "reactivate" ? { is_active: true }
    : op === "make_admin" ? { is_admin: true }
    : op === "remove_admin" ? { is_admin: false }
    : op === "move" ? { department_id: text(form, "department_id") || null }
    : null;
  if (!patch) flash(back, "error", "Unknown action.");

  // RLS + the people_guard trigger decide whether this is allowed; count tells us if it was.
  const { error, count } = await supabase.from("people").update(patch, { count: "exact" }).eq("id", id);
  if (error || !count) flash(back, "error", error ? friendlyError(error.message) : "You don't have permission to change this person.");
  revalidatePublic();
  flash(back, "ok", "Saved.");
}

export async function removeInvite(form: FormData) {
  await requireLead();
  const supabase = await createSessionClient();
  const { error, count } = await supabase.from("people").delete({ count: "exact" }).eq("id", text(form, "id")).is("user_id", null);
  if (error || !count) flash(back, "error", error ? friendlyError(error.message) : "Only pending invites you manage can be removed.");
  flash(back, "ok", "Invite removed.");
}
