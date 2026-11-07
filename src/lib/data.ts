import "server-only";
import { cache } from "react";
import { assetUrl, getSupabase } from "@/lib/supabase";
import type { Faq, GdgEvent, Member, Project, Sponsor, Story } from "@/lib/types";

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
      status: r.status, image: assetUrl(r.image_path), tags: r.tags ?? [],
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
