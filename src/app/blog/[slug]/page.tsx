import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Tag } from "@/components/Section";
import { getBlogPost } from "@/lib/data";
import { formatDate } from "@/lib/time";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="pb-16 pt-28 md:pt-36">
      <header className="container max-w-3xl">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> All posts
        </Link>
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-xl text-muted">{post.excerpt}</p>}
        <div className="mt-8 flex items-center gap-3 border-b border-line pb-8">
          {post.author && (
            <div className="relative size-11 overflow-hidden rounded-full bg-surface-2">
              {post.author.image && <Image src={post.author.image} alt="" fill sizes="44px" className="object-cover" />}
            </div>
          )}
          <div className="text-sm">
            {post.author && <p className="font-medium">{post.author.name}</p>}
            <p className="text-muted">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.department && ` · ${post.department}`}
            </p>
          </div>
        </div>
      </header>

      {post.cover && (
        <div className="container mt-10 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-4xl bg-surface-2">
            <Image src={post.cover} alt="" fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {/* react-markdown escapes raw HTML and strips javascript: URLs, so member-written posts can't inject script. */}
      <div className="container mt-10 max-w-3xl">
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-medium prose-a:text-primary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-img:rounded-2xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
                  {children}
                </a>
              ),
              // eslint-disable-next-line @next/next/no-img-element
              img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

// Render each post on first visit, then serve it from the cache (refreshed by `revalidate`
// and immediately when a lead publishes or edits it).
export function generateStaticParams() {
  return [];
}
