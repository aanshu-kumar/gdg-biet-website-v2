import "server-only";
import { cache } from "react";
import { assetUrl, getSupabase } from "@/lib/supabase";
import type { BlogPost, Faq, GdgEvent, Member, Project, RosterPerson, Sponsor, Story, TeamSession } from "@/lib/types";

import localEvents from "@/data/events.json";
import localTeam from "@/data/team.json";
import localProjects from "@/data/projects.json";
import localFaqs from "@/data/faqs.json";
import localSponsors from "@/data/sponsors.json";
import localStories from "@/data/stories.json";

/**
 * Reads a table from Supabase, or falls back to the bundled JSON when Supabase
 * isn't configured or the query fails. Rows are mapped to the app's camelCase types.
 */
async function load<Row, T>(
  table: string,
  order: { column: string; ascending?: boolean }[],
  map: (row: Row) => T,
  fallback: T[],
): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) return fallback;

  let query = supabase.from(table).select("*");
  for (const o of order) query = query.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false });
  const { data, error } = await query;
  if (error) {
    console.error(`[data] ${table}: ${error.message} — using local fallback`);
    return fallback;
  }
  return (data as Row[]).map(map);
}

type EventRow = {
  id: string; title: string; description: string; date: string | null; location: string | null;
  status: GdgEvent["status"]; image_path: string | null; tags: string[] | null;
  register_url: string | null; resources_url: string | null;
};

export const getEvents = cache(() =>
  load<EventRow, GdgEvent>(
    "events",
    [{ column: "date", ascending: false }],
    (r) => ({
      id: r.id, title: r.title, description: r.description, date: r.date, location: r.location,
      // Dated events become "past" on their own once the date has gone by.
      status: r.date ? (new Date(r.date) < new Date() ? "past" : "upcoming") : r.status,
      image: assetUrl(r.image_path), tags: r.tags ?? [],
      registerUrl: r.register_url, resourcesUrl: r.resources_url,
    }),
    (localEvents as GdgEvent[]).map((e) => ({ ...e, image: assetUrl(e.image) })),
  ),
);

type MemberRow = {
  id: string; name: string; role: string; year: number; image_path: string | null;
  linkedin_url: string | null; twitter_url: string | null; is_lead: boolean; sort_order: number;
};

export const getTeam = cache(() =>
  load<MemberRow, Member>(
    "team_members",
    [{ column: "year", ascending: false }, { column: "sort_order" }],
    (r) => ({
      id: r.id, name: r.name, role: r.role, year: r.year, image: assetUrl(r.image_path),
      linkedin: r.linkedin_url, twitter: r.twitter_url, lead: r.is_lead, order: r.sort_order,
    }),
    (localTeam as Member[]).map((m) => ({ ...m, image: assetUrl(m.image) })),
  ),
);

type ProjectRow = {
  id: string; title: string; description: string; image_path: string | null; tags: string[] | null;
  github_url: string | null; live_url: string | null; sort_order: number;
};

export const getProjects = cache(() =>
  load<ProjectRow, Project>(
    "projects",
    [{ column: "sort_order" }],
    (r) => ({
      id: r.id, title: r.title, description: r.description, image: assetUrl(r.image_path),
      tags: r.tags ?? [], githubUrl: r.github_url, liveUrl: r.live_url, order: r.sort_order,
    }),
    (localProjects as Project[]).map((p) => ({ ...p, image: assetUrl(p.image) })),
  ),
);

type FaqRow = { id: string; question: string; answer: string; sort_order: number };

export const getFaqs = cache(() =>
  load<FaqRow, Faq>(
    "faqs",
    [{ column: "sort_order" }],
    (r) => ({ id: r.id, question: r.question, answer: r.answer, order: r.sort_order }),
    localFaqs as Faq[],
  ),
);

type SponsorRow = { id: string; name: string; logo_path: string; url: string | null; sort_order: number };

export const getSponsors = cache(() =>
  load<SponsorRow, Sponsor>(
    "sponsors",
    [{ column: "sort_order" }],
    (r) => ({ id: r.id, name: r.name, logo: assetUrl(r.logo_path)!, url: r.url, order: r.sort_order }),
    (localSponsors as Sponsor[]).map((s) => ({ ...s, logo: assetUrl(s.logo)! })),
  ),
);

type StoryRow = { id: string; quote: string; name: string; role: string | null; image_path: string | null };

export const getStories = cache(() =>
  load<StoryRow, Story>(
    "stories",
    [{ column: "created_at", ascending: false }],
    (r) => ({ id: r.id, quote: r.quote, name: r.name, role: r.role, image: assetUrl(r.image_path) }),
    (localStories as Story[]).map((s) => ({ ...s, image: assetUrl(s.image) })),
  ),
);

// ------------------------------------------------------------- team page

type RosterRow = {
  session_id: number; session_name: string; start_year: number; is_current: boolean;
  scope: "club" | "department"; title: "lead" | "co_lead";
  department_id: string | null; department_name: string | null; department_sort: number | null;
  person_id: string; full_name: string; avatar_path: string | null; bio: string | null;
  linkedin_url: string | null; twitter_url: string | null; github_url: string | null; website_url: string | null;
};

const byTitle = (a: RosterPerson, b: RosterPerson) => (a.title === b.title ? 0 : a.title === "lead" ? -1 : 1);

/**
 * Sessions for the Team page, newest first. Sessions with positions assigned in
 * the dashboard show club + department leadership; older years without any fall
 * back to the original team list (team_members / team.json).
 */
export const getTeamSessions = cache(async (): Promise<TeamSession[]> => {
  const supabase = getSupabase();
  let roster: RosterRow[] = [];
  if (supabase) {
    const { data, error } = await supabase.rpc("team_roster");
    if (error) console.error(`[data] team_roster: ${error.message}`);
    else roster = data as RosterRow[];
  }

  const sessions = new Map<number, Extract<TeamSession, { kind: "roster" }>>();
  const deptSort = new Map<string, number>();
  for (const r of roster) {
    let s = sessions.get(r.start_year);
    if (!s) {
      s = { kind: "roster", key: `s${r.session_id}`, label: r.session_name, startYear: r.start_year, isCurrent: r.is_current, club: [], departments: [] };
      sessions.set(r.start_year, s);
    }
    const person: RosterPerson = {
      id: r.person_id, name: r.full_name, title: r.title, departmentName: r.department_name,
      image: assetUrl(r.avatar_path), bio: r.bio,
      linkedin: r.linkedin_url, twitter: r.twitter_url, github: r.github_url, website: r.website_url,
    };
    if (r.scope === "club") s.club.push(person);
    else {
      let d = s.departments.find((x) => x.id === r.department_id);
      if (!d) {
        d = { id: r.department_id!, name: r.department_name ?? "", people: [] };
        s.departments.push(d);
        deptSort.set(d.id, r.department_sort ?? 0);
      }
      d.people.push(person);
    }
  }
  for (const s of sessions.values()) {
    s.club.sort(byTitle);
    s.departments.sort((a, b) => (deptSort.get(a.id)! - deptSort.get(b.id)!) || a.name.localeCompare(b.name));
    s.departments.forEach((d) => d.people.sort(byTitle));
  }

  const legacy = new Map<number, Member[]>();
  for (const m of await getTeam()) {
    if (sessions.has(m.year)) continue;
    legacy.set(m.year, [...(legacy.get(m.year) ?? []), m]);
  }

  return [
    ...sessions.values(),
    ...[...legacy.entries()].map(([year, members]): TeamSession => ({
      kind: "legacy", key: `y${year}`, label: `${year}–${String((year + 1) % 100).padStart(2, "0")}`,
      startYear: year, isCurrent: false, members,
    })),
  ].sort((a, b) => b.startYear - a.startYear);
});

// ------------------------------------------------------------------ blog

type BlogRow = {
  id: string; slug: string; title: string; excerpt: string | null; body: string; cover_path: string | null;
  tags: string[] | null; published_at: string; author_name: string | null; author_avatar_path: string | null;
  department_name: string | null;
};

const toPost = (r: BlogRow): BlogPost => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, cover: assetUrl(r.cover_path),
  tags: r.tags ?? [], publishedAt: r.published_at, department: r.department_name,
  author: r.author_name ? { name: r.author_name, image: assetUrl(r.author_avatar_path) } : null,
});

/** Published posts, newest first (bodies omitted). */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("blog_posts");
  if (error) {
    console.error(`[data] blog_posts: ${error.message}`);
    return [];
  }
  return (data as BlogRow[]).map(toPost);
});

export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("blog_posts", { p_slug: slug });
  if (error) console.error(`[data] blog_posts(${slug}): ${error.message}`);
  const row = (data as BlogRow[] | null)?.[0];
  return row ? toPost(row) : null;
});
