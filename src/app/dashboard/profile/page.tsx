import Image from "next/image";
import { Card, Field, Flash, PageTitle, inputClass } from "@/components/dashboard/ui";
import { ActionForm } from "@/components/dashboard/ActionForm";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { requireViewer } from "@/lib/auth";
import type { PersonRow } from "@/lib/dashboard";
import { assetUrl } from "@/lib/supabase";
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
  const avatar = assetUrl(me.avatar_path);

  return (
    <>
      <PageTitle
        title="My profile"
        description="If you hold a lead or co-lead position, this is what the public Team page shows."
      />
      <Flash ok={ok} error={error} />

      <ActionForm action={updateProfile} className="space-y-6">
        <Card>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-4 ring-g-blue ring-offset-4 ring-offset-bg">
              {avatar ? (
                <Image src={avatar} alt="Your photo" fill sizes="96px" className="object-cover" />
              ) : (
                <span className="grid size-full place-items-center font-display text-3xl text-muted">{me.full_name.charAt(0) || "?"}</span>
              )}
            </div>
            <Field label="Photo" hint="Square works best. JPG, PNG or WebP, up to 2 MB." className="flex-1">
              <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className={inputClass} />
              <input type="hidden" name="previous_avatar" value={me.avatar_path ?? ""} />
            </Field>
          </div>
        </Card>

        <Card className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input name="full_name" required maxLength={120} defaultValue={me.full_name} className={inputClass} />
          </Field>
          <Field label="Email" hint="Your sign-in email. Ask an admin to change it.">
            <input value={me.email} disabled className={inputClass} />
          </Field>
          <Field label="Department" hint="Set by your lead or an admin.">
            <input value={dept?.name ?? "Not assigned"} disabled className={inputClass} />
          </Field>
          <Field label="Skills" hint="Comma-separated, e.g. Flutter, Firebase, UI design">
            <input name="skills" defaultValue={me.skills.join(", ")} className={inputClass} />
          </Field>
          <Field label="Bio" hint="Up to 600 characters." className="sm:col-span-2">
            <textarea name="bio" rows={4} maxLength={600} defaultValue={me.bio ?? ""} className={inputClass} placeholder="What you work on, what you're learning, what you'd love to build…" />
          </Field>
        </Card>

        <Card className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn">
            <input name="linkedin_url" defaultValue={me.linkedin_url ?? ""} placeholder="https://linkedin.com/in/…" className={inputClass} />
          </Field>
          <Field label="X / Twitter">
            <input name="twitter_url" defaultValue={me.twitter_url ?? ""} placeholder="https://x.com/…" className={inputClass} />
          </Field>
          <Field label="GitHub">
            <input name="github_url" defaultValue={me.github_url ?? ""} placeholder="https://github.com/…" className={inputClass} />
          </Field>
          <Field label="Website or portfolio">
            <input name="website_url" defaultValue={me.website_url ?? ""} placeholder="https://…" className={inputClass} />
          </Field>
        </Card>

        <SubmitButton size="lg">Save profile</SubmitButton>
      </ActionForm>
    </>
  );
}
