import { Lock } from "lucide-react";
import { Card, Field, Flash, PageTitle, inputClass } from "@/components/dashboard/ui";
import { ConfirmButton, SubmitButton } from "@/components/dashboard/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import type { Department, PersonRow } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";
import { cn } from "@/lib/utils";
import { createSession, deleteDepartment, saveDepartment, savePositions, setCurrentSession } from "./actions";

type Session = { id: number; name: string; start_year: number; is_current: boolean; is_legacy: boolean };
type Position = { person_id: string; scope: "club" | "department"; title: "lead" | "co_lead"; department_id: string | null };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ session?: string; ok?: string; error?: string }> }) {
  const viewer = await requireAdmin();
  const { session: sessionParam, ok, error } = await searchParams;
  const supabase = await createSessionClient();

  const [{ data: sessions }, { data: departments }, { data: people }] = await Promise.all([
    supabase.from("sessions").select("*").order("start_year", { ascending: false }).returns<Session[]>(),
    supabase.from("departments").select("*").order("sort_order").order("name").returns<Department[]>(),
    supabase.from("people").select("id, full_name, email, is_active, is_legacy").eq("is_active", true).order("full_name").returns<Pick<PersonRow, "id" | "full_name" | "email" | "is_active" | "is_legacy">[]>(),
  ]);

  const selected = sessions?.find((s) => String(s.id) === sessionParam) ?? sessions?.find((s) => s.is_current) ?? sessions?.[0];
  const { data: positions } = selected
    ? await supabase.from("positions").select("person_id, scope, title, department_id").eq("session_id", selected.id).returns<Position[]>()
    : { data: [] as Position[] };

  // Legacy (imported) sessions are owner-only; the database enforces this too.
  const locked = !!selected?.is_legacy && !viewer.isOwner;
  // Show every department that holds a position in this session, even if since deactivated,
  // so saving never silently drops an old assignment.
  const usedDepts = new Set((positions ?? []).map((p) => p.department_id).filter(Boolean));
  const slotDepartments = (departments ?? []).filter((d) => d.is_active || usedDepts.has(d.id));
  // Alumni only appear as choices for legacy sessions.
  const choices = (people ?? []).filter((p) => selected?.is_legacy || !p.is_legacy);
  const nameOf = new Map((people ?? []).map((p) => [p.id, p.full_name || p.email]));

  const holder = (scope: "club" | "department", title: "lead" | "co_lead", dept: string | null = null) =>
    positions?.find((p) => p.scope === scope && p.title === title && p.department_id === dept)?.person_id ?? "";

  const PersonSelect = ({ name, value }: { name: string; value: string }) => (
    <select name={name} defaultValue={value} className={inputClass}>
      <option value="">— Vacant —</option>
      {choices.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name || p.email}
        </option>
      ))}
    </select>
  );
  const nextYear = (sessions?.[0]?.start_year ?? new Date().getFullYear() - 1) + 1;

  return (
    <>
      <PageTitle title="Admin" description="Sessions, departments and leadership. Lead permissions come from positions in the current session." />
      <Flash ok={ok} error={error} />

      {/* Sessions */}
      <Card className="mb-6">
        <h2 className="font-display text-xl font-medium">Sessions</h2>
        <p className="mt-1 text-sm text-muted">Each academic year is a session. The Team page keeps past sessions.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(sessions ?? []).map((s) => (
            <a
              key={s.id}
              href={`/dashboard/admin?session=${s.id}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm",
                selected?.id === s.id ? "border-transparent bg-g-blue-tint font-medium" : "border-line text-muted hover:text-fg",
              )}
            >
              {s.name}
              {s.is_current && <span className="ml-2 rounded-full bg-g-green-tint px-2 py-0.5 text-xs text-fg">Current</span>}
              {s.is_legacy && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg">Alumni</span>}
            </a>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-line pt-5">
          <form action={createSession} className="flex flex-wrap items-end gap-3">
            <Field label="New session starting in">
              <input name="start_year" type="number" min={2020} max={2100} defaultValue={nextYear} className={cn(inputClass, "w-32")} />
            </Field>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="make_current" defaultChecked={!sessions?.length} className="size-4" /> Make current
            </label>
            <SubmitButton variant="tonal">Create session</SubmitButton>
          </form>
          {selected && !selected.is_current && !selected.is_legacy && (
            <form action={setCurrentSession} className="ml-auto">
              <input type="hidden" name="session_id" value={selected.id} />
              <SubmitButton variant="outlined">Make {selected.name} current</SubmitButton>
            </form>
          )}
        </div>
      </Card>

      {/* Positions */}
      {selected ? (
        <Card className="mb-6">
          <h2 className="font-display text-xl font-medium">Leadership for {selected.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {selected.is_legacy
              ? "Imported from the original website. Shown on the Team page for this year."
              : selected.is_current
                ? "These people appear on the public Team page and get lead permissions. Assigning a department lead moves them into that department."
                : "A past session: these people appear on the Team page for this year. Assignments here don't change anyone's current role or department."}
          </p>
          {locked ? (
            <div className="mt-5 space-y-3">
              <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
                <Lock className="size-4" /> Only the chapter owner can edit alumni sessions imported from the original website.
              </p>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {(positions ?? []).map((p) => (
                  <li key={`${p.scope}-${p.department_id}-${p.title}`} className="rounded-xl border border-line px-3 py-2">
                    <span className="text-muted">
                      {p.scope === "club" ? "Club" : slotDepartments.find((d) => d.id === p.department_id)?.name} · {p.title === "lead" ? "Lead" : "Co-lead"}:
                    </span>{" "}
                    {nameOf.get(p.person_id)}
                  </li>
                ))}
              </ul>
            </div>
          ) : choices.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Invite people on the Members page first.</p>
          ) : (
            <form action={savePositions} className="mt-5 space-y-5">
              <input type="hidden" name="session_id" value={selected.id} />
              <div className="rounded-2xl bg-g-blue-tint p-4">
                <p className="mb-3 font-medium">Whole club</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Lead"><PersonSelect name="club:lead" value={holder("club", "lead")} /></Field>
                  <Field label="Co-lead"><PersonSelect name="club:co_lead" value={holder("club", "co_lead")} /></Field>
                </div>
              </div>
              {slotDepartments.map((d) => (
                <div key={d.id} className="rounded-2xl border border-line p-4">
                  <p className="mb-3 font-medium">
                    {d.name}
                    {!d.is_active && <span className="ml-2 text-xs font-normal text-muted">(inactive department)</span>}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Lead"><PersonSelect name={`dept:${d.id}:lead`} value={holder("department", "lead", d.id)} /></Field>
                    <Field label="Co-lead"><PersonSelect name={`dept:${d.id}:co_lead`} value={holder("department", "co_lead", d.id)} /></Field>
                  </div>
                </div>
              ))}
              <SubmitButton size="lg">Save leadership</SubmitButton>
            </form>
          )}
        </Card>
      ) : (
        <Card className="mb-6 bg-g-yellow-tint">
          <p className="font-medium">Create your first session above to assign leadership.</p>
        </Card>
      )}

      {/* Departments */}
      <Card>
        <h2 className="font-display text-xl font-medium">Departments</h2>
        <p className="mt-1 text-sm text-muted">Shown on the Team page in this order. Deactivated departments are hidden.</p>
        <ul className="mt-5 space-y-3">
          {(departments ?? []).map((d) => (
            <li key={d.id} className="rounded-2xl border border-line p-4">
              <form action={saveDepartment} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_90px_auto_auto] sm:items-end">
                <input type="hidden" name="id" value={d.id} />
                <Field label="Name"><input name="name" required defaultValue={d.name} maxLength={80} className={inputClass} /></Field>
                <Field label="Description"><input name="description" defaultValue={d.description ?? ""} maxLength={300} className={inputClass} /></Field>
                <Field label="Order"><input name="sort_order" type="number" defaultValue={d.sort_order} className={inputClass} /></Field>
                <label className="flex h-11 items-center gap-2 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={d.is_active} className="size-4" /> Active
                </label>
                <SubmitButton variant="tonal">Save</SubmitButton>
              </form>
              <form action={deleteDepartment} className="mt-2">
                <input type="hidden" name="id" value={d.id} />
                <ConfirmButton size="sm" variant="text" className="px-0 text-g-red" message={`Delete ${d.name}? Its positions are removed and its members become unassigned.`}>
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={saveDepartment} className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-[1fr_1.4fr_90px_auto] sm:items-end">
          <Field label="New department"><input name="name" required maxLength={80} placeholder="e.g. Web Development" className={inputClass} /></Field>
          <Field label="Description"><input name="description" maxLength={300} className={inputClass} /></Field>
          <Field label="Order"><input name="sort_order" type="number" defaultValue={(departments?.length ?? 0) + 1} className={inputClass} /></Field>
          <SubmitButton>Add</SubmitButton>
        </form>
      </Card>
    </>
  );
}
