"use server";

import type { ActionResult } from "@/components/dashboard/ActionForm";
import { redirect } from "next/navigation";
import { canPublish, requireViewer } from "@/lib/auth";
import { flash, friendlyError, list, optional, revalidatePublic, slugify, text, uploadImage, type PublishState } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

const intents: Record<string, PublishState> = { draft: "draft", submit: "pending", publish: "published", unpublish: "draft" };

export async function savePost(form: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createSessionClient();
  const id = text(form, "id") || null;

  const state = intents[text(form, "intent")] ?? "draft";
  const departmentId = text(form, "department_id") || viewer.departmentId || null;
  if (state === "published" && !canPublish(viewer, departmentId)) {
    return { error: "Only a lead of this department (or a club lead) can publish it. Submit it for review instead." };
  }

  const title = text(form, "title", 160);
  if (!title) return { error: "Give the post a title." };
  const slug = slugify(text(form, "slug") || title);
  if (!slug) return { error: "The post URL needs at least one letter or number." };
  const body = text(form, "body", 50000);
  if (state !== "draft" && body.length < 50) return { error: "Write a bit more before submitting — the post is nearly empty." };

  const upload = await uploadImage(supabase, form.get("cover"), "posts");
  if ("error" in upload) return { error: upload.error };

  const row = {
    title,
    slug,
    excerpt: optional(form, "excerpt", 300),
    body,
    tags: list(form, "tags"),
    department_id: departmentId,
    publish_state: state,
    ...(upload.key ? { cover_path: upload.key } : {}),
  };

  const result = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert({ ...row, author_id: viewer.personId }).select("id").single();
  if (result.error) return { error: friendlyError(result.error.message) };

  revalidatePublic();
  const message = { draft: "Draft saved.", pending: "Submitted for review. A lead will publish it.", published: `Published at /blog/${slug}.` }[state];
  flash(`/dashboard/posts/${result.data.id}`, "ok", message);
}

export async function deletePost(form: FormData) {
  await requireViewer();
  const supabase = await createSessionClient();
  const id = text(form, "id");
  const { error, count } = await supabase.from("posts").delete({ count: "exact" }).eq("id", id);
  if (error || !count) flash(`/dashboard/posts/${id}`, "error", error ? friendlyError(error.message) : "You can't delete this post.");
  revalidatePublic();
  redirect("/dashboard/posts?ok=Post+deleted.");
}
