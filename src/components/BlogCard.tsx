import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/Section";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/time";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      data-reveal
      className={
        "group relative overflow-hidden rounded-3xl border border-line bg-bg transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift " +
        (featured ? "grid md:grid-cols-[1.2fr_1fr]" : "flex flex-col")
      }
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-surface-2 md:aspect-auto md:min-h-56" tabIndex={-1} aria-hidden>
        {post.cover ? (
          <Image src={post.cover} alt="" fill sizes={featured ? "(min-width: 768px) 640px, 100vw" : "(min-width: 1024px) 380px, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-6 opacity-80">
            <span className="rounded-full bg-g-blue" />
            <span className="rounded-2xl rounded-tr-full bg-g-red" />
            <span className="rounded-2xl bg-g-yellow" />
            <span className="rounded-full rounded-bl-2xl bg-g-green" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-sm text-muted">
          {formatDate(post.publishedAt)}
          {post.department && ` · ${post.department}`}
        </p>
        <h3 className={`font-display font-medium ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-muted">{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        {post.author && (
          <div className="mt-auto flex items-center gap-3 pt-3">
            <div className="relative size-8 overflow-hidden rounded-full bg-surface-2">
              {post.author.image && <Image src={post.author.image} alt="" fill sizes="32px" className="object-cover" />}
            </div>
            <span className="text-sm font-medium">{post.author.name}</span>
          </div>
        )}
      </div>
    </article>
  );
}
