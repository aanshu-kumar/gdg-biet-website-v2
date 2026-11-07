import { EventForm } from "@/components/dashboard/EventForm";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { canPublish, requireViewer } from "@/lib/auth";
import type { Department } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const viewer = await requireViewer();
  const { error } = await searchParams;
  const supabase = await createSessionClient();
  const { data: departments } = await supabase.from("departments").select("*").eq("is_active", true).order("sort_order").returns<Department[]>();

  return (
    <>
      <PageTitle title="New event" />
      <Flash error={error} />
      <EventForm
        departments={departments ?? []}
        defaultDepartmentId={viewer.departmentId}
        canPublish={canPublish(viewer, viewer.departmentId)}
        canEdit
        canDelete={false}
      />
    </>
  );
}
