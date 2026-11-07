import Image from "next/image";
import { Card, Field, inputClass } from "@/components/dashboard/ui";
import type { PersonRow } from "@/lib/dashboard";
import { assetUrl } from "@/lib/supabase";

/** Profile form fields shared by "My profile" and editing someone else's profile. */
export function ProfileFields({
  person,
  departmentName,
  emailHint,
  departmentHint,
}: {
  person: PersonRow;
  departmentName: string | null;
  emailHint: string;
  departmentHint: string;
}) {
  const avatar = assetUrl(person.avatar_path);
  return (
    <>
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-4 ring-g-blue ring-offset-4 ring-offset-bg">
            {avatar ? (
              <Image src={avatar} alt="Profile photo" fill sizes="96px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center font-display text-3xl text-muted">{person.full_name.charAt(0) || "?"}</span>
            )}
          </div>
          <Field label="Photo" hint="Square works best. JPG, PNG or WebP, up to 2 MB." className="flex-1">
            <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className={inputClass} />
            <input type="hidden" name="previous_avatar" value={person.avatar_path ?? ""} />
          </Field>
        </div>
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name">
          <input name="full_name" required maxLength={120} defaultValue={person.full_name} className={inputClass} />
        </Field>
        <Field label="Email" hint={emailHint}>
          <input value={person.email ?? "No email (profile only)"} disabled className={inputClass} />
        </Field>
        <Field label="Department" hint={departmentHint}>
          <input value={departmentName ?? "Not assigned"} disabled className={inputClass} />
        </Field>
        <Field label="Skills" hint="Comma-separated, e.g. Flutter, Firebase, UI design">
          <input name="skills" defaultValue={person.skills.join(", ")} className={inputClass} />
        </Field>
        <Field label="Bio" hint="Up to 600 characters." className="sm:col-span-2">
          <textarea
            name="bio"
            rows={4}
            maxLength={600}
            defaultValue={person.bio ?? ""}
            className={inputClass}
            placeholder="What they work on, what they're learning, what they'd love to build…"
          />
        </Field>
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label="LinkedIn">
          <input name="linkedin_url" defaultValue={person.linkedin_url ?? ""} placeholder="https://linkedin.com/in/…" className={inputClass} />
        </Field>
        <Field label="X / Twitter">
          <input name="twitter_url" defaultValue={person.twitter_url ?? ""} placeholder="https://x.com/…" className={inputClass} />
        </Field>
        <Field label="GitHub">
          <input name="github_url" defaultValue={person.github_url ?? ""} placeholder="https://github.com/…" className={inputClass} />
        </Field>
        <Field label="Website or portfolio">
          <input name="website_url" defaultValue={person.website_url ?? ""} placeholder="https://…" className={inputClass} />
        </Field>
      </Card>
    </>
  );
}
