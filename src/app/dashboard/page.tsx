import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Settings2, UserRound, Users } from "lucide-react";
import { Card, Flash, PageTitle } from "@/components/dashboard/ui";
import { requireViewer } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase-session";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const viewer = await requireViewer();
  const { error } = await searchParams;
  const supabase = await createSessionClient();

  const author = { events: "created_by", posts: "author_id" } as const;
  const rows = (table: "events" | "posts") => supabase.from(table).select("id", { count: "exact", head: true });
  const myDrafts = async (table: "events" | "posts") =>
    (await rows(table).eq(author[table], viewer.personId).neq("publish_state", "published")).count ?? 0;
  const awaitingReview = async (table: "events" | "posts") =>
    viewer.isLead || viewer.isAdmin ? ((await rows(table).eq("publish_state", "pending")).count ?? 0) : 0;

  const [myEventDrafts, myPostDrafts, pendingEvents, pendingPosts, profile] = await Promise.all([
    myDrafts("events"),
    myDrafts("posts"),
    awaitingReview("events"),
    awaitingReview("posts"),
    supabase.from("people").select("full_name, bio, avatar_path").eq("id", viewer.personId).single(),
  ]);

  const p = profile.data;
  const missing = [!p?.full_name && "name", !p?.avatar_path && "photo", !p?.bio && "bio"].filter(Boolean) as string[];

  const tiles = [
    {
      href: "/dashboard/profile",
      icon: UserRound,
      title: "My profile",
      text: missing.length ? `Add your ${missing.join(", ")}.` : "Your profile is complete.",
      tint: "bg-g-blue-tint",
    },
    {
      href: "/dashboard/events",
      icon: CalendarDays,
      title: "Events",
      text: pendingEvents ? `${pendingEvents} waiting for review.` : myEventDrafts ? `${myEventDrafts} of your drafts in progress.` : "Plan or propose an event.",
      tint: "bg-g-red-tint",
    },
    {
      href: "/dashboard/posts",
      icon: FileText,
      title: "Blog posts",
      text: pendingPosts ? `${pendingPosts} waiting for review.` : myPostDrafts ? `${myPostDrafts} of your drafts in progress.` : "Write something for the blog.",
      tint: "bg-g-yellow-tint",
    },
    ...(viewer.isLead || viewer.isAdmin
      ? [{ href: "/dashboard/members", icon: Users, title: "Members", text: "Invite and manage your department's members.", tint: "bg-g-green-tint" }]
      : []),
    ...(viewer.isAdmin
      ? [{ href: "/dashboard/admin", icon: Settings2, title: "Admin", text: "Sessions, departments and leadership positions.", tint: "bg-surface-2" }]
      : []),
  ];

  return (
    <>
      <PageTitle
        title={`Hi, ${viewer.name.split(" ")[0]}`}
        description={viewer.currentSession ? `Session ${viewer.currentSession.name}` : "No session is set as current yet."}
      />
      <Flash error={error === "forbidden" ? "That page is only for leads or admins." : undefined} />

      {viewer.isAdmin && !viewer.currentSession && (
        <Card className="mb-6 bg-g-yellow-tint">
          <p className="font-medium">Set up the current session</p>
          <p className="mt-1 text-sm text-muted">
            Leads get their permissions from positions in the current session. Create one and assign the club and department leads.
          </p>
          <Link href="/dashboard/admin" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Go to Admin <ArrowRight className="size-4" />
          </Link>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(({ href, icon: Icon, title, text, tint }) => (
          <Link key={href} href={href} className={`group rounded-3xl p-6 transition-transform hover:-translate-y-0.5 ${tint}`}>
            <Icon className="size-6" />
            <h2 className="mt-5 font-display text-lg font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
