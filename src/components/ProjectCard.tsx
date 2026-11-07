import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Tag } from "@/components/Section";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article data-reveal className="group grid overflow-hidden rounded-3xl border border-line bg-bg transition-shadow duration-300 hover:shadow-lift md:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2 md:aspect-auto md:min-h-72">
        {project.image && (
          <Image src={project.image} alt={`${project.title} screenshot`} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <h3 className="font-display text-2xl font-medium">{project.title}</h3>
        <p className="text-muted">{project.description}</p>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {project.githubUrl && (
            <Button asChild variant="outlined">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <FaGithub /> Source
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button asChild>
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                Visit <ArrowUpRight />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
