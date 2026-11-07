import Image from "next/image";
import { FaGithub, FaGlobe, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { Member, RosterPerson } from "@/lib/types";
import { cn } from "@/lib/utils";

const ring = ["ring-g-blue", "ring-g-red", "ring-g-yellow", "ring-g-green"];

export function MemberCard({ member, index = 0 }: { member: Member; index?: number }) {
  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
      className="group flex flex-col items-center rounded-3xl border border-line bg-bg p-6 text-center transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <div className={cn("relative size-28 overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-bg", ring[index % 4])}>
        {member.image ? (
          <Image src={member.image} alt={member.name} fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="grid size-full place-items-center bg-surface-2 font-display text-3xl text-muted">
            {member.name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="mt-5 font-display text-lg font-medium">{member.name}</h3>
      <p className="text-sm text-muted">{member.role}</p>
      <SocialLinks member={member} className="mt-3" />
    </article>
  );
}

export function LeadCard({ member }: { member: Member }) {
  return (
    <article data-reveal className="grid items-center gap-6 rounded-4xl bg-g-blue-tint p-6 sm:grid-cols-[auto_1fr] md:p-8">
      <div className="relative mx-auto size-36 overflow-hidden rounded-full ring-4 ring-g-blue ring-offset-4 ring-offset-g-blue-tint sm:mx-0 md:size-44">
        {member.image && <Image src={member.image} alt={member.name} fill sizes="176px" className="object-cover" />}
      </div>
      <div className="text-center sm:text-left">
        <p className="eyebrow">Chapter {member.role}</p>
        <h3 className="mt-2 font-display text-3xl font-medium">{member.name}</h3>
        <p className="mt-2 text-muted">Leading GDG On Campus BIET for the {member.year}–{String(member.year + 1).slice(2)} session.</p>
        <SocialLinks member={member} className="mt-4 justify-center sm:justify-start" />
      </div>
    </article>
  );
}

type Socials = { name: string; linkedin: string | null; twitter: string | null; github?: string | null; website?: string | null };

function SocialLinks({ member, className }: { member: Socials; className?: string }) {
  const links = [
    { href: member.linkedin, label: "LinkedIn", Icon: FaLinkedinIn },
    { href: member.twitter, label: "X", Icon: FaXTwitter },
    { href: member.github, label: "GitHub", Icon: FaGithub },
    { href: member.website, label: "website", Icon: FaGlobe },
  ].filter((l) => l.href);
  if (links.length === 0) return null;
  const linkClass = "grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg";
  return (
    <div className={cn("flex gap-1", className)}>
      {links.map(({ href, label, Icon }) => (
        <a key={label} href={href!} target="_blank" rel="noreferrer" aria-label={`${member.name}'s ${label}`} className={linkClass}>
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

const titleLabel = (p: RosterPerson) => (p.title === "lead" ? "Lead" : "Co-lead");

function Avatar({ person, size, ringClass }: { person: { name: string; image: string | null }; size: string; ringClass: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full ring-4 ring-offset-4", size, ringClass)}>
      {person.image ? (
        <Image src={person.image} alt={person.name} fill sizes="176px" className="object-cover" />
      ) : (
        <div className="grid size-full place-items-center bg-surface-2 font-display text-3xl text-muted">{person.name.charAt(0)}</div>
      )}
    </div>
  );
}

/** Club lead / co-lead on the Team page. */
export function ClubLeadCard({ person }: { person: RosterPerson }) {
  return (
    <article data-reveal className="grid items-center gap-6 rounded-4xl bg-g-blue-tint p-6 sm:grid-cols-[auto_1fr] md:p-8">
      <Avatar person={person} size="mx-auto size-32 sm:mx-0 md:size-36" ringClass="ring-g-blue ring-offset-g-blue-tint" />
      <div className="text-center sm:text-left">
        <p className="eyebrow">Club {titleLabel(person)}</p>
        <h3 className="mt-2 font-display text-2xl font-medium md:text-3xl">{person.name}</h3>
        {person.bio && <p className="mt-2 line-clamp-3 text-muted">{person.bio}</p>}
        <SocialLinks member={person} className="mt-3 justify-center sm:justify-start" />
      </div>
    </article>
  );
}

/** Department lead / co-lead on the Team page. */
export function DepartmentLeadCard({ person, index = 0 }: { person: RosterPerson; index?: number }) {
  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${(index % 2) * 80}ms` } as React.CSSProperties}
      className="group flex items-center gap-5 rounded-3xl border border-line bg-bg p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <Avatar person={person} size="size-20" ringClass={cn(ring[index % 4], "ring-offset-bg ring-2 ring-offset-2")} />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{titleLabel(person)}</p>
        <h3 className="font-display text-lg font-medium">{person.name}</h3>
        {person.bio && <p className="mt-1 line-clamp-2 text-sm text-muted">{person.bio}</p>}
        <SocialLinks member={person} className="-ml-2 mt-1" />
      </div>
    </article>
  );
}
