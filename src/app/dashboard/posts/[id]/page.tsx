import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostForm, type PostRow } from "@/components/dashboard/PostForm";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { canPublish, requireViewer } from "@/lib/auth";
import type { Department } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const viewer = await requireViewer();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const supabase = await createSessionClient();
  const [{ data: post }, { data: departments }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle<PostRow>(),
    supabase.from("departments").select("*").eq("is_active", true).order("sort_order").returns<Department[]>(),
  ]);
  if (!post) notFound();

  const publisher = canPublish(viewer, post.department_id);
  const isAuthor = post.author_id === viewer.personId;
  const editable = publisher || (isAuthor && post.publish_state !== "published");

  return (
    <>
      <Link href="/dashboard/posts" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All posts
      </Link>
      <PageTitle title={post.title || "Untitled post"} />
      <Flash ok={ok} error={error} />
      <PostForm
        post={post}
        departments={departments ?? []}
        defaultDepartmentId={viewer.departmentId}
        canPublish={publisher}
        canEdit={editable}
        canDelete={editable}
      />
    </>
  );
}
