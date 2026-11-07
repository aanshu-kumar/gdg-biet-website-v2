import { ActionForm } from "@/components/dashboard/ActionForm";
import { ProfileFields } from "@/components/dashboard/ProfileFields";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { Flash, PageTitle } from "@/components/dashboard/ui";
import { requireViewer } from "@/lib/auth";
import type { PersonRow } from "@/lib/dashboard";
import { createSessionClient } from "@/lib/supabase-session";
import { updateProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const viewer = await requireViewer();
  const { ok, error } = await searchParams;
  const supabase = await createSessionClient();
  const [{ data: me }, { data: dept }] = await Promise.all([
    supabase.from("people").select("*").eq("id", viewer.personId).single<PersonRow>(),
    viewer.departmentId
      ? supabase.from("departments").select("name").eq("id", viewer.departmentId).single<{ name: string }>()
      : Promise.resolve({ data: null }),
  ]);
  if (!me) return null;

  return (
    <>
      <PageTitle title="My profile" description="If you hold a lead or co-lead position, this is what the public Team page shows." />
      <Flash ok={ok} error={error} />
      <ActionForm action={updateProfile} className="space-y-6">
        <ProfileFields
          person={me}
          departmentName={dept?.name ?? null}
          emailHint="Your sign-in email. Ask an admin to change it."
          departmentHint="Set by your lead or an admin."
        />
        <SubmitButton size="lg">Save profile</SubmitButton>
      </ActionForm>
    </>
  );
}
