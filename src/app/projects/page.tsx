import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState, PageHeader, Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source projects built by members of GDG On Campus BIET, Lucknow.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        accent="red"
        title="Projects"
        description="Things our members have designed, built and shipped — most of it open source and open to contributions."
      />

      <Section>
        <div className="space-y-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Section>

      <Section className="pt-0 md:pt-0">
        <EmptyState
          title="Have a project idea?"
          description="We're always looking for builders. Pitch an idea or join an existing project — beginners welcome."
          action={
            <Button asChild variant="tonal">
              <Link href="/contact">Pitch a project</Link>
            </Button>
          }
        />
      </Section>
    </>
  );
}
