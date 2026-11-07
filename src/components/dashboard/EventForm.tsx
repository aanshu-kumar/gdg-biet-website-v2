import Image from "next/image";
import { deleteEvent, saveEvent } from "@/app/dashboard/events/actions";
import { Card, Field, StateBadge, inputClass } from "@/components/dashboard/ui";
import { ActionForm } from "@/components/dashboard/ActionForm";
import { ConfirmButton, SubmitButton } from "@/components/dashboard/SubmitButton";
import type { Department, PublishState } from "@/lib/dashboard";
import { assetUrl } from "@/lib/supabase";
import { toLocalInput } from "@/lib/time";

export type EventRow = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  location: string | null;
  tags: string[] | null;
  register_url: string | null;
  resources_url: string | null;
  image_path: string | null;
  department_id: string | null;
  publish_state: PublishState;
  created_by: string | null;
};

export function EventForm({
  event,
  departments,
  defaultDepartmentId,
  canPublish,
  canEdit,
  canDelete,
}: {
  event?: EventRow;
  departments: Department[];
  defaultDepartmentId: string | null;
  canPublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const image = assetUrl(event?.image_path);
  const published = event?.publish_state === "published";

  return (
    <div className="space-y-6">
      {event && (
        <div className="flex items-center gap-3 text-sm text-muted">
          Status: <StateBadge state={event.publish_state} />
        </div>
      )}
      {!canEdit && (
        <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
          {published ? "This event is published. Ask a lead to unpublish it if it needs changes." : "You can view this event but not edit it."}
        </p>
      )}

      <ActionForm action={saveEvent} className="space-y-6">
        {event && <input type="hidden" name="id" value={event.id} />}
        <fieldset disabled={!canEdit} className="space-y-6">
          <Card className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <input name="title" required maxLength={160} defaultValue={event?.title} className={inputClass} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea name="description" rows={5} maxLength={2000} defaultValue={event?.description} className={inputClass} />
            </Field>
            <Field label="Date and time (IST)" hint="Required to submit or publish.">
              <input type="datetime-local" name="date" defaultValue={toLocalInput(event?.date ?? null)} className={inputClass} />
            </Field>
            <Field label="Location">
              <input name="location" maxLength={160} defaultValue={event?.location ?? "BIET, Lucknow"} className={inputClass} />
            </Field>
            <Field label="Department" hint="Decides which lead reviews it.">
              <select name="department_id" defaultValue={event?.department_id ?? defaultDepartmentId ?? ""} className={inputClass}>
                <option value="">Whole club</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma-separated, e.g. AI, Gemini">
              <input name="tags" defaultValue={event?.tags?.join(", ")} className={inputClass} />
            </Field>
            <Field label="Registration link">
              <input name="register_url" defaultValue={event?.register_url ?? ""} placeholder="https://gdg.community.dev/…" className={inputClass} />
            </Field>
            <Field label="Recap / resources link" hint="Shown once the event is over.">
              <input name="resources_url" defaultValue={event?.resources_url ?? ""} placeholder="https://…" className={inputClass} />
            </Field>
          </Card>

          <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {image && (
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:w-56">
                <Image src={image} alt="" fill sizes="224px" className="object-cover" />
              </div>
            )}
            <Field label={image ? "Replace banner image" : "Banner image"} hint="16:9 works best. JPG, PNG or WebP, up to 2 MB." className="flex-1">
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className={inputClass} />
            </Field>
          </Card>

          <div className="flex flex-wrap gap-3">
            {canPublish ? (
              <>
                <SubmitButton name="intent" value="publish" size="lg">
                  {published ? "Save changes" : "Publish"}
                </SubmitButton>
                {published ? (
                  <SubmitButton name="intent" value="unpublish" variant="outlined" size="lg">
                    Unpublish
                  </SubmitButton>
                ) : (
                  <SubmitButton name="intent" value="draft" variant="outlined" size="lg">
                    Save draft
                  </SubmitButton>
                )}
              </>
            ) : (
              <>
                <SubmitButton name="intent" value="submit" size="lg">
                  Submit for review
                </SubmitButton>
                <SubmitButton name="intent" value="draft" variant="outlined" size="lg">
                  Save draft
                </SubmitButton>
              </>
            )}
          </div>
        </fieldset>
      </ActionForm>

      {event && canDelete && (
        <form action={deleteEvent} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={event.id} />
          <ConfirmButton message="Delete this event? This can't be undone." variant="text" className="text-g-red">
            Delete event
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
