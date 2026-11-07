import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase-session";

export type Role = "admin" | "lead" | "member";

export type Viewer = {
  userId: string;
  personId: string;
  email: string;
  name: string;
  avatarPath: string | null;
  departmentId: string | null;
  isAdmin: boolean;
  isClubLead: boolean;
  ledDepartmentIds: string[];
  /** Highest role, for display. Capabilities come from the flags above. */
  role: Role;
  isLead: boolean;
  currentSession: { id: number; name: string; start_year: number } | null;
};

type MyContext = {
  person: {
    id: string;
    email: string;
    full_name: string;
    is_admin: boolean;
    department_id: string | null;
    avatar_path: string | null;
  } | null;
  is_club_lead: boolean;
  led_department_ids: string[];
  current_session: Viewer["currentSession"];
};

/** The signed-in team member, or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!process.env.SUPABASE_URL) return null;
  const supabase = await createSessionClient();
  // Verified locally against the project's signing keys (no Auth round trip). Access
  // itself is decided by my_context(), which the database evaluates per request, so a
  // deactivated member loses access immediately.
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { data, error } = await supabase.rpc("my_context");
  const ctx = data as MyContext | null;
  if (error || !ctx?.person) return null;

  const isLead = ctx.is_club_lead || ctx.led_department_ids.length > 0;
  return {
    userId,
    personId: ctx.person.id,
    email: ctx.person.email,
    name: ctx.person.full_name || ctx.person.email,
    avatarPath: ctx.person.avatar_path,
    departmentId: ctx.person.department_id,
    isAdmin: ctx.person.is_admin,
    isClubLead: ctx.is_club_lead,
    ledDepartmentIds: ctx.led_department_ids,
    isLead,
    role: ctx.person.is_admin ? "admin" : isLead ? "lead" : "member",
    currentSession: ctx.current_session,
  };
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?error=not_invited");
  return viewer;
}

export async function requireLead(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isAdmin && !viewer.isLead) redirect("/dashboard?error=forbidden");
  return viewer;
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isAdmin) redirect("/dashboard?error=forbidden");
  return viewer;
}

/** Mirrors the database's can_publish(): UI hint only, the database enforces it. */
export function canPublish(viewer: Viewer, departmentId: string | null): boolean {
  return viewer.isAdmin || viewer.isClubLead || (departmentId !== null && viewer.ledDepartmentIds.includes(departmentId));
}

export const roleLabel: Record<Role, string> = { admin: "Admin", lead: "Lead", member: "Member" };
