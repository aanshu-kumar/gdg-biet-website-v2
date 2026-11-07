import Image from "next/image";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Tag } from "@/components/Section";
import type { GdgEvent } from "@/lib/types";
import { TIME_ZONE } from "@/lib/time";

const dateFormat = new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function EventCard({ event }: { event: GdgEvent }) {
  const link = event.status === "upcoming" ? event.registerUrl : event.resourcesUrl ?? event.registerUrl;

  return (
    <article data-reveal className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-bg transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        {event.image && (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span
          className={
            "glass absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-fg [--glass-blur:12px]"
          }
        >
          <span className={"size-1.5 rounded-full " + (event.status === "upcoming" ? "bg-g-green" : "bg-muted")} />
          {event.status === "upcoming" ? "Upcoming" : "Past event"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {event.date ? dateFormat.format(new Date(event.date)) : "Date to be announced"}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {event.location}
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-medium">{event.title}</h3>
        <p className="line-clamp-3 text-muted">{event.description}</p>
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary hover:underline"
          >
            {event.status === "upcoming" ? "Register" : "View recap"}
            <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </article>
  );
}
