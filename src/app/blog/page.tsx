import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/BlogCard";
import { EmptyState, PageHeader, Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Blog",
  description: "Write-ups, tutorials and event recaps from the members of GDG On Campus BIET, Lucknow.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        accent="green"
        title="Blog"
        description="Write-ups, tutorials and event recaps from our members — what we're learning and building."
      />
      <Section>
        {featured ? (
          <div className="space-y-8">
            <BlogCard post={featured} featured />
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No posts yet"
            description="Our members are writing their first posts. Check back soon."
            action={
              <Button asChild variant="tonal">
                <Link href="/events">See upcoming events</Link>
              </Button>
            }
          />
        )}
      </Section>
    </>
  );
}
