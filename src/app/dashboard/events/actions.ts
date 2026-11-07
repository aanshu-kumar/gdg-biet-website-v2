"use server";

import type { ActionResult } from "@/components/dashboard/ActionForm";
import { redirect } from "next/navigation";
import { canPublish, requireViewer } from "@/lib/auth";
import { flash, friendlyError, list, optional, revalidatePublic, text, uploadImage, url, type PublishState } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";
import { fromLocalInput } from "@/lib/time";

const intents: Record<string, PublishState> = { draft: "draft", submit: "pending", publish: "published", unpublish: "draft" };

export async function saveEvent(form: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createSessionClient();
  const id = text(form, "id") || null;

  const state = intents[text(form, "intent")] ?? "draft";
  const departmentId = text(form, "department_id") || viewer.departmentId || null;
  if (state === "published" && !canPublish(viewer, departmentId)) {
    return { error: "Only a lead of this department (or a club lead) can publish it. Submit it for review instead." };
  }

  const title = text(form, "title", 160);
  if (!title) return { error: "Give the event a title." };
  const rawDate = text(form, "date");
  const date = rawDate ? fromLocalInput(rawDate) : null;
  if (rawDate && !date) return { error: "That date doesn't look right." };
  if (state !== "draft" && !date) return { error: "Add a date before submitting or publishing." };

  const register = url(form, "register_url");
  const resources = url(form, "resources_url");
  for (const r of [register, resources]) if ("error" in r) return { error: r.error };

  const upload = await uploadImage(supabase, form.get("image"), "events");
  if ("error" in upload) return { error: upload.error };

  const row = {
    title,
    description: text(form, "description", 2000),
    date,
    location: optional(form, "location", 160),
    tags: list(form, "tags"),
    register_url: "value" in register ? register.value : null,
    resources_url: "value" in resources ? resources.value : null,
    department_id: departmentId,
    publish_state: state,
    status: date && new Date(date) < new Date() ? "past" : "upcoming",
    ...(upload.key ? { image_path: upload.key } : {}),
  };

  const result = id
    ? await supabase.from("events").update(row).eq("id", id).select("id").single()
    : await supabase.from("events").insert({ ...row, created_by: viewer.personId }).select("id").single();
  if (result.error) return { error: friendlyError(result.error.message) };

  revalidatePublic();
  const message = { draft: "Draft saved.", pending: "Submitted for review. A lead will publish it.", published: "Published — it's live on the site." }[state];
  flash(`/dashboard/events/${result.data.id}`, "ok", message);
}

export async function deleteEvent(form: FormData) {
  await requireViewer();
  const supabase = await createSessionClient();
  const id = text(form, "id");
  const { error, count } = await supabase.from("events").delete({ count: "exact" }).eq("id", id);
  if (error || !count) flash(`/dashboard/events/${id}`, "error", error ? friendlyError(error.message) : "You can't delete this event.");
  revalidatePublic();
  redirect("/dashboard/events?ok=Event+deleted.");
}
