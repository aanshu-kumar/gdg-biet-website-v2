import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm, type EventRow } from "@/components/dashboard/EventForm";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { canPublish, requireViewer } from "@/lib/auth";
import type { Department } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const viewer = await requireViewer();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const supabase = await createSessionClient();
  const [{ data: event }, { data: departments }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle<EventRow>(),
    supabase.from("departments").select("*").eq("is_active", true).order("sort_order").returns<Department[]>(),
  ]);
  if (!event) notFound();

  const publisher = canPublish(viewer, event.department_id);
  const isAuthor = event.created_by === viewer.personId;
  const editable = publisher || (isAuthor && event.publish_state !== "published");

  return (
    <>
      <Link href="/dashboard/events" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All events
      </Link>
      <PageTitle title={event.title || "Untitled event"} />
      <Flash ok={ok} error={error} />
      <EventForm
        event={event}
        departments={departments ?? []}
        defaultDepartmentId={viewer.departmentId}
        canPublish={publisher}
        canEdit={editable}
        canDelete={editable}
      />
    </>
  );
}
