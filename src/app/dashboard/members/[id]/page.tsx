import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { updatePersonProfile } from "@/app/dashboard/profile/actions";
import { ActionForm } from "@/components/dashboard/ActionForm";
import { ProfileFields } from "@/components/dashboard/ProfileFields";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { Card, Flash, PageTitle } from "@/components/dashboard/ui";
import { requireLead } from "@/lib/auth";
import type { PersonRow } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";

export default async function EditPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const viewer = await requireLead();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const supabase = await createSessionClient();
  const { data: person } = await supabase.from("people").select("*").eq("id", id).maybeSingle<PersonRow>();
  if (!person) notFound();
  if (person.id === viewer.personId) return <EditYourself />;

  const { data: dept } = person.department_id
    ? await supabase.from("departments").select("name").eq("id", person.department_id).single<{ name: string }>()
    : { data: null };

  // Mirrors can_manage_person(); the database enforces it either way.
  const manageable =
    (!person.is_legacy || viewer.isOwner) &&
    (viewer.isAdmin ||
      (!person.is_admin && (viewer.isClubLead || (person.department_id !== null && viewer.ledDepartmentIds.includes(person.department_id)))));

  return (
    <>
      <Link href="/dashboard/members" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Members
      </Link>
      <PageTitle
        title={person.full_name || person.email || "Profile"}
        description={person.is_legacy ? "Alumni from the original website. Shown on the Team page for past sessions." : "Shown on the public Team page if they hold a lead or co-lead position."}
      />
      <Flash ok={ok} error={error} />

      {manageable ? (
        <ActionForm action={updatePersonProfile} className="space-y-6">
          <input type="hidden" name="id" value={person.id} />
          <ProfileFields
            person={person}
            departmentName={dept?.name ?? null}
            emailHint={person.email ? "Their sign-in email." : "Profile only: this person can't sign in."}
            departmentHint="Change it from the Members list."
          />
          <SubmitButton size="lg">Save profile</SubmitButton>
        </ActionForm>
      ) : (
        <Card className="flex items-start gap-3 bg-surface">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted" />
          <p className="text-sm text-muted">
            {person.is_legacy
              ? "Alumni imported from the original website can only be edited by the chapter owner."
              : "You can't edit this person's profile."}
          </p>
        </Card>
      )}
    </>
  );
}

function EditYourself() {
  return (
    <Card>
      <p className="text-sm">
        This is you —{" "}
        <Link href="/dashboard/profile" className="font-medium text-primary hover:underline">
          edit your profile here
        </Link>
        .
      </p>
    </Card>
  );
}
