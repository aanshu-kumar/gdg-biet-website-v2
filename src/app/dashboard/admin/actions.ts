"use server";

import { requireAdmin } from "@/lib/auth";
import { flash, friendlyError, optional, revalidatePublic, text } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

const back = (session?: string) => (session ? `/dashboard/admin?session=${session}` : "/dashboard/admin");

export async function createSession(form: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const year = Number(text(form, "start_year"));
  if (!Number.isInteger(year) || year < 2020 || year > 2100) flash(back(), "error", "Enter a start year like 2026.");

  const { data, error } = await supabase
    .from("sessions")
    .insert({ start_year: year, name: `${year}–${String((year + 1) % 100).padStart(2, "0")}` })
    .select("id")
    .single();
  if (error) flash(back(), "error", friendlyError(error.message));
  if (form.get("make_current") === "on") {
    const r = await supabase.rpc("admin_set_current_session", { p_session: data.id });
    if (r.error) flash(back(), "error", friendlyError(r.error.message));
  }
  revalidatePublic();
  flash(back(String(data.id)), "ok", "Session created.");
}

export async function setCurrentSession(form: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const id = Number(text(form, "session_id"));
  const { error } = await supabase.rpc("admin_set_current_session", { p_session: id });
  if (error) flash(back(String(id)), "error", friendlyError(error.message));
  revalidatePublic();
  flash(back(String(id)), "ok", "Current session updated. Lead permissions now follow its positions.");
}

export async function saveDepartment(form: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const id = text(form, "id") || null;
  const name = text(form, "name", 80);
  if (!name) flash(back(), "error", "Department name is required.");

  const row = {
    name,
    description: optional(form, "description", 300),
    sort_order: Number(text(form, "sort_order")) || 0,
    is_active: id ? form.get("is_active") === "on" : true,
  };
  const { error } = id ? await supabase.from("departments").update(row).eq("id", id) : await supabase.from("departments").insert(row);
  if (error) flash(back(), "error", friendlyError(error.message));
  revalidatePublic();
  flash(back(), "ok", id ? "Department updated." : `Added ${name}.`);
}

export async function deleteDepartment(form: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("departments").delete().eq("id", text(form, "id"));
  if (error) flash(back(), "error", friendlyError(error.message));
  revalidatePublic();
  flash(back(), "ok", "Department deleted. Its members are now unassigned.");
}

/** Form fields: club:lead, club:co_lead, dept:<uuid>:lead, dept:<uuid>:co_lead → person id. */
export async function savePositions(form: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const session = text(form, "session_id");

  const slots: { scope: string; department_id: string | null; title: string; person_id: string }[] = [];
  const chosen = new Set<string>();
  for (const [key, value] of form.entries()) {
    const person = String(value);
    if (!person) continue;
    const parts = key.split(":");
    if (parts[0] === "club" && (parts[1] === "lead" || parts[1] === "co_lead")) {
      slots.push({ scope: "club", department_id: null, title: parts[1], person_id: person });
    } else if (parts[0] === "dept" && parts.length === 3 && (parts[2] === "lead" || parts[2] === "co_lead")) {
      slots.push({ scope: "department", department_id: parts[1], title: parts[2], person_id: person });
    } else continue;
    if (chosen.has(person)) flash(back(session), "error", "Someone is assigned to two positions. Each person can hold one position per session.");
    chosen.add(person);
  }

  const { error } = await supabase.rpc("admin_set_positions", { p_session: Number(session), p_slots: slots });
  if (error) flash(back(session), "error", friendlyError(error.message));
  revalidatePublic();
  flash(back(session), "ok", "Positions saved. The Team page now shows this leadership.");
}
