import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { deletePost, savePost } from "@/app/dashboard/posts/actions";
import { Card, Field, StateBadge, inputClass } from "@/components/dashboard/ui";
import { ActionForm } from "@/components/dashboard/ActionForm";
import { ConfirmButton, SubmitButton } from "@/components/dashboard/SubmitButton";
import type { Department, PublishState } from "@/lib/dashboard";
import { assetUrl } from "@/lib/supabase";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_path: string | null;
  tags: string[];
  department_id: string | null;
  author_id: string | null;
  publish_state: PublishState;
};

export function PostForm({
  post,
  departments,
  defaultDepartmentId,
  canPublish,
  canEdit,
  canDelete,
}: {
  post?: PostRow;
  departments: Department[];
  defaultDepartmentId: string | null;
  canPublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const cover = assetUrl(post?.cover_path);
  const published = post?.publish_state === "published";

  return (
    <div className="space-y-6">
      {post && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          Status: <StateBadge state={post.publish_state} />
          {published && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              View on site <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      )}
      {!canEdit && (
        <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
          {published ? "This post is published. Ask a lead to unpublish it if it needs changes." : "You can view this post but not edit it."}
        </p>
      )}

      <ActionForm action={savePost} className="space-y-6">
        {post && <input type="hidden" name="id" value={post.id} />}
        <fieldset disabled={!canEdit} className="space-y-6">
          <Card className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <input name="title" required maxLength={160} defaultValue={post?.title} className={inputClass} />
            </Field>
            <Field label="URL" hint="Left blank, it's made from the title. Letters, numbers and dashes.">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted">/blog/</span>
                <input name="slug" maxLength={80} defaultValue={post?.slug} placeholder="my-first-post" className={inputClass} />
              </div>
            </Field>
            <Field label="Department" hint="Decides which lead reviews it.">
              <select name="department_id" defaultValue={post?.department_id ?? defaultDepartmentId ?? ""} className={inputClass}>
                <option value="">Whole club</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Summary" hint="One or two sentences for the blog list. Up to 300 characters." className="sm:col-span-2">
              <textarea name="excerpt" rows={2} maxLength={300} defaultValue={post?.excerpt ?? ""} className={inputClass} />
            </Field>
            <Field
              label="Post"
              hint="Markdown: **bold**, _italic_, ## headings, - lists, [links](https://…), ```code blocks```, tables."
              className="sm:col-span-2"
            >
              <textarea
                name="body"
                rows={18}
                maxLength={50000}
                defaultValue={post?.body}
                className={`${inputClass} font-mono text-sm leading-relaxed`}
                placeholder={"## What we built\n\nStart writing…"}
              />
            </Field>
            <Field label="Tags" hint="Comma-separated, e.g. Flutter, Firebase" className="sm:col-span-2">
              <input name="tags" defaultValue={post?.tags.join(", ")} className={inputClass} />
            </Field>
          </Card>

          <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {cover && (
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:w-56">
                <Image src={cover} alt="" fill sizes="224px" className="object-cover" />
              </div>
            )}
            <Field label={cover ? "Replace cover image" : "Cover image (optional)"} hint="16:9 works best. JPG, PNG or WebP, up to 2 MB." className="flex-1">
              <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" className={inputClass} />
            </Field>
          </Card>

          <div className="flex flex-wrap gap-3">
            {canPublish ? (
              <>
                <SubmitButton name="intent" value="publish" size="lg">
                  {published ? "Save changes" : "Publish"}
                </SubmitButton>
                <SubmitButton name="intent" value={published ? "unpublish" : "draft"} variant="outlined" size="lg">
                  {published ? "Unpublish" : "Save draft"}
                </SubmitButton>
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

      {post && canDelete && (
        <form action={deletePost} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message="Delete this post? This can't be undone." variant="text" className="text-g-red">
            Delete post
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
