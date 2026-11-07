import Image from "next/image";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { Member } from "@/lib/types";
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

function SocialLinks({ member, className }: { member: Member; className?: string }) {
  if (!member.linkedin && !member.twitter) return null;
  const linkClass = "grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg";
  return (
    <div className={cn("flex gap-1", className)}>
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className={linkClass}>
          <FaLinkedinIn className="size-4" />
        </a>
      )}
      {member.twitter && (
        <a href={member.twitter} target="_blank" rel="noreferrer" aria-label={`${member.name} on X`} className={linkClass}>
          <FaXTwitter className="size-4" />
        </a>
      )}
    </div>
  );
}
