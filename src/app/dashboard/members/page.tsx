import Link from "next/link";
import { Pencil, UserPlus } from "lucide-react";
import { Card, Field, Flash, PageTitle, RoleBadge, inputClass } from "@/components/dashboard/ui";
import { ConfirmButton, SubmitButton } from "@/components/dashboard/SubmitButton";
import { Button } from "@/components/ui/button";
import { requireLead, type Viewer } from "@/lib/auth";
import type { Department, PersonRow } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";
import { cn } from "@/lib/utils";
import { invitePerson, removeInvite, updatePerson } from "./actions";

type Position = { person_id: string; scope: "club" | "department"; title: "lead" | "co_lead"; department_id: string | null };

/** Mirrors the database's can_manage_person() for UI hints; the database enforces it. */
const canManage = (v: Viewer, p: PersonRow) =>
  p.id !== v.personId &&
  (!p.is_legacy || v.isOwner) &&
  (v.isAdmin || (!p.is_admin && (v.isClubLead || (p.department_id !== null && v.ledDepartmentIds.includes(p.department_id)))));

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ dept?: string; ok?: string; error?: string }> }) {
  const viewer = await requireLead();
  const { dept, ok, error } = await searchParams;
  const supabase = await createSessionClient();

  const [{ data: people }, { data: departments }, { data: positions }] = await Promise.all([
    supabase.from("people").select("*").order("full_name").returns<PersonRow[]>(),
    supabase.from("departments").select("*").order("sort_order").returns<Department[]>(),
    viewer.currentSession
      ? supabase.from("positions").select("person_id, scope, title, department_id").eq("session_id", viewer.currentSession.id).returns<Position[]>()
      : Promise.resolve({ data: [] as Position[] }),
  ]);

  const deptName = new Map((departments ?? []).map((d) => [d.id, d.name]));
  const positionOf = new Map((positions ?? []).map((p) => [p.person_id, p]));
  const seesAll = viewer.isAdmin || viewer.isClubLead;
  const inviteDepartments = (departments ?? []).filter((d) => d.is_active && (seesAll || viewer.ledDepartmentIds.includes(d.id)));

  // Department leads start on their own department(s); everyone can switch the filter.
  const filter = dept ?? (seesAll ? "all" : viewer.ledDepartmentIds[0] ?? "all");
  // Alumni imported from the original site get their own filter so the active team stays readable.
  const shown = (people ?? []).filter((p) =>
    filter === "alumni" ? p.is_legacy : !p.is_legacy && (filter === "all" || (filter === "none" ? !p.department_id : p.department_id === filter)),
  );

  const positionLabel = (p: Position) =>
    `${p.title === "lead" ? "Lead" : "Co-lead"}${p.scope === "club" ? " · Club" : ` · ${deptName.get(p.department_id!) ?? ""}`}`;

  return (
    <>
      <PageTitle
        title="Members"
        description={seesAll ? "Everyone on the platform. Invite people and manage access." : "Invite and manage the members of your department."}
      />
      <Flash ok={ok} error={error} />

      <Card className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <UserPlus className="size-4" /> Invite someone
        </h2>
        {inviteDepartments.length === 0 && !seesAll ? (
          <p className="text-sm text-muted">You don&apos;t lead an active department in the current session.</p>
        ) : (
          <form action={invitePerson} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
            <Field label="Google account email" hint={viewer.isAdmin ? "Leave empty to add a past member as a profile only." : undefined}>
              <input name="email" type="email" required={!viewer.isAdmin} placeholder="name@gmail.com" className={inputClass} />
            </Field>
            <Field label="Name">
              <input name="full_name" maxLength={120} className={inputClass} />
            </Field>
            <Field label="Department">
              <select name="department_id" required={!seesAll} defaultValue={inviteDepartments[0]?.id} className={inputClass}>
                {seesAll && <option value="">No department</option>}
                {inviteDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <SubmitButton pendingText="Inviting…">Invite</SubmitButton>
            {viewer.isAdmin && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-4">
                <input type="checkbox" name="is_admin" className="size-4 accent-[rgb(var(--primary))]" /> Make admin (full access to the platform)
              </label>
            )}
          </form>
        )}
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "all", name: "Everyone" },
          ...(departments ?? []).filter((d) => d.is_active),
          { id: "none", name: "No department" },
          ...(viewer.isAdmin ? [{ id: "alumni", name: "Alumni" }] : []),
        ].map((d) => (
          <a
            key={d.id}
            href={`/dashboard/members?dept=${d.id}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filter === d.id ? "border-transparent bg-g-blue-tint font-medium" : "border-line text-muted hover:text-fg",
            )}
          >
            {d.name}
          </a>
        ))}
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg">
        {shown.length === 0 && <li className="px-5 py-10 text-center text-muted">No one here yet.</li>}
        {shown.map((p) => {
          const pos = positionOf.get(p.id);
          const role = p.is_admin ? "admin" : pos ? "lead" : "member";
          const manage = canManage(viewer, p);
          return (
            <li key={p.id} className={cn("flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center", !p.is_active && "opacity-60")}>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {p.full_name || p.email}
                  <RoleBadge role={role} />
                  {p.is_legacy && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">Alumni</span>}
                  {!p.user_id && p.email && <span className="rounded-full bg-g-yellow-tint px-2.5 py-0.5 text-xs">Invite pending</span>}
                  {!p.email && !p.is_legacy && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">Profile only</span>}
                  {!p.is_active && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">Deactivated</span>}
                </p>
                <p className="truncate text-sm text-muted">
                  {[p.email ?? "No email", p.department_id ? deptName.get(p.department_id) : "No department", pos && positionLabel(pos)].filter(Boolean).join(" · ")}
                </p>
              </div>

              {manage && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="text">
                    <Link href={`/dashboard/members/${p.id}`}>
                      <Pencil /> Edit profile
                    </Link>
                  </Button>
                  {seesAll && (
                    <form action={updatePerson} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="op" value="move" />
                      <select name="department_id" defaultValue={p.department_id ?? ""} aria-label="Department" className={cn(inputClass, "h-9 w-40 py-0 text-sm")}>
                        <option value="">No department</option>
                        {(departments ?? []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <SubmitButton size="sm" variant="tonal">Move</SubmitButton>
                    </form>
                  )}
                  {viewer.isAdmin && (
                    <form action={updatePerson}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="op" value={p.is_admin ? "remove_admin" : "make_admin"} />
                      <SubmitButton size="sm" variant="outlined">{p.is_admin ? "Remove admin" : "Make admin"}</SubmitButton>
                    </form>
                  )}
                  {p.user_id ? (
                    <form action={updatePerson}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="op" value={p.is_active ? "deactivate" : "reactivate"} />
                      {p.is_active ? (
                        <ConfirmButton size="sm" variant="text" className="text-g-red" message={`Remove ${p.full_name || p.email}'s access? You can reactivate them later.`}>
                          Deactivate
                        </ConfirmButton>
                      ) : (
                        <Button type="submit" size="sm" variant="text">Reactivate</Button>
                      )}
                    </form>
                  ) : (
                    <form action={removeInvite}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton
                        size="sm"
                        variant="text"
                        className="text-g-red"
                        message={p.email ? `Cancel the invite for ${p.email}?` : `Remove ${p.full_name}'s profile?`}
                      >
                        {p.email ? "Cancel invite" : "Remove"}
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
