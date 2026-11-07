import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentTable, Tabs } from "@/components/dashboard/ContentTable";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import type { PublishState } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";


type Row = {
  id: string;
  title: string;
  slug: string;
  publish_state: PublishState;
  updated_at: string;
  author_id: string | null;
  people: { full_name: string } | null;
  departments: { name: string } | null;
};

export default async function PostsDashboard({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; error?: string }> }) {
  const viewer = await requireViewer();
  const { tab = "all", ok, error } = await searchParams;
  const supabase = await createSessionClient();

  let query = supabase
    .from("posts")
    .select("id, title, slug, publish_state, updated_at, author_id, people(full_name), departments(name)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (tab === "review") query = query.eq("publish_state", "pending");
  if (tab === "mine") query = query.eq("author_id", viewer.personId);
  const { data } = await query.returns<Row[]>();

  return (
    <>
      <PageTitle
        title="Blog posts"
        description={viewer.isLead || viewer.isAdmin ? "Review and publish posts from your department." : "Write posts and submit them to your lead for review."}
        action={
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus /> New post
            </Link>
          </Button>
        }
      />
      <Flash ok={ok} error={error} />
      <Tabs
        base="/dashboard/posts"
        current={tab}
        tabs={[
          { key: "all", label: "All" },
          ...(viewer.isLead || viewer.isAdmin ? [{ key: "review", label: "Needs review" }] : []),
          { key: "mine", label: "Mine" },
        ]}
      />
      <ContentTable
        empty={tab === "review" ? "Nothing is waiting for review." : "No posts yet."}
        rows={(data ?? []).map((e) => ({
          id: e.id,
          href: `/dashboard/posts/${e.id}`,
          title: e.title,
          meta: [`/blog/${e.slug}`, e.departments?.name ?? "Whole club", e.people?.full_name].filter(Boolean).join(" · "),
          state: e.publish_state,
        }))}
      />
    </>
  );
}
