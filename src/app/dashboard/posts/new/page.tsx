import { PostForm } from "@/components/dashboard/PostForm";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { canPublish, requireViewer } from "@/lib/auth";
import type { Department } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const viewer = await requireViewer();
  const { error } = await searchParams;
  const supabase = await createSessionClient();
  const { data: departments } = await supabase.from("departments").select("*").eq("is_active", true).order("sort_order").returns<Department[]>();

  return (
    <>
      <PageTitle title="New post" />
      <Flash error={error} />
      <PostForm
        departments={departments ?? []}
        defaultDepartmentId={viewer.departmentId}
        canPublish={canPublish(viewer, viewer.departmentId)}
        canEdit
        canDelete={false}
      />
    </>
  );
}
