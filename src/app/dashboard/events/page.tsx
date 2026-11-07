import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentTable, Tabs } from "@/components/dashboard/ContentTable";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import type { PublishState } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";
import { formatDate } from "@/lib/time";

type Row = {
  id: string;
  title: string;
  date: string | null;
  publish_state: PublishState;
  updated_at: string;
  created_by: string | null;
  people: { full_name: string } | null;
  departments: { name: string } | null;
};

export default async function EventsDashboard({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; error?: string }> }) {
  const viewer = await requireViewer();
  const { tab = "all", ok, error } = await searchParams;
  const supabase = await createSessionClient();

  let query = supabase
    .from("events")
    .select("id, title, date, publish_state, updated_at, created_by, people(full_name), departments(name)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (tab === "review") query = query.eq("publish_state", "pending");
  if (tab === "mine") query = query.eq("created_by", viewer.personId);
  const { data } = await query.returns<Row[]>();

  return (
    <>
      <PageTitle
        title="Events"
        description={viewer.isLead || viewer.isAdmin ? "Plan events and publish the ones your department submits." : "Draft events and submit them to your lead for review."}
        action={
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus /> New event
            </Link>
          </Button>
        }
      />
      <Flash ok={ok} error={error} />
      <Tabs
        base="/dashboard/events"
        current={tab}
        tabs={[
          { key: "all", label: "All" },
          ...(viewer.isLead || viewer.isAdmin ? [{ key: "review", label: "Needs review" }] : []),
          { key: "mine", label: "Mine" },
        ]}
      />
      <ContentTable
        empty={tab === "review" ? "Nothing is waiting for review." : "No events yet."}
        rows={(data ?? []).map((e) => ({
          id: e.id,
          href: `/dashboard/events/${e.id}`,
          title: e.title,
          meta: [e.date ? formatDate(e.date) : "No date", e.departments?.name ?? "Whole club", e.people?.full_name].filter(Boolean).join(" · "),
          state: e.publish_state,
        }))}
      />
    </>
  );
}
