import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code2, GraduationCap, Rocket, Users } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { FaqList } from "@/components/FaqList";
import { EmptyState, Section, SectionHeader } from "@/components/Section";
import { Shape, ShapeLayer } from "@/components/Shapes";
import { TechMarquee } from "@/components/TechMarquee";
import { Button } from "@/components/ui/button";
import { getEvents, getFaqs, getSponsors, getStories, getTeam } from "@/lib/data";
import { site } from "@/lib/site";
import type { GdgEvent } from "@/lib/types";

export const revalidate = 300;

const pillars = [
  { icon: GraduationCap, title: "Learn", text: "Workshops, study jams and talks on Android, Cloud, AI, Web and more.", tint: "bg-g-blue-tint", fg: "text-g-blue" },
  { icon: Code2, title: "Build", text: "Ship real projects with peers, from weekend hacks to open source.", tint: "bg-g-red-tint", fg: "text-g-red" },
  { icon: Users, title: "Connect", text: "Meet developers, alumni and Googlers across the GDG network.", tint: "bg-g-yellow-tint", fg: "text-[#b06000] dark:text-g-yellow" },
  { icon: Rocket, title: "Grow", text: "Speak, mentor and lead — and turn what you learn into opportunities.", tint: "bg-g-green-tint", fg: "text-g-green" },
];

export default async function Home() {
  const [events, faqs, sponsors, stories, team] = await Promise.all([
    getEvents(),
    getFaqs(),
    getSponsors(),
    getStories(),
    getTeam(),
  ]);
  const upcoming = events.filter((e) => e.status === "upcoming").slice(0, 3);
  const latestYear = Math.max(...team.map((m) => m.year));
  const currentTeam = team.filter((m) => m.year === latestYear);
  const avatars = currentTeam.filter((m) => m.image).slice(0, 6);
  const story = stories[0];

  return (
    <>
      {/* Hero */}
      <div className="relative isolate">
        <ShapeLayer>
          {/* Left-edge shape lives in the page margin, which is only wide enough from xl up. */}
          <Shape kind="triangle" color="blue" className="bottom-[22%] left-[0.75%] hidden w-14 animate-float [--r:-12deg] xl:block" />
          <Shape kind="arc" color="yellow" className="right-[1%] top-[16%] w-20 animate-spin-slow" />
          <Shape kind="plus" color="green" className="bottom-[6%] right-[2%] w-10 animate-spin-slower" />
        </ShapeLayer>
      <section className="container grid items-center gap-12 pb-16 pt-28 md:pb-24 md:pt-36 lg:grid-cols-[1.15fr_1fr]">
        <div data-reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-muted">
            <span className="size-2 rounded-full bg-g-green" />
            On Campus · BIET, Lucknow
          </p>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-g-blue">Learn</span>, <span className="text-g-red">build</span> and{" "}
            <span className="text-g-green">grow</span> with Google technologies.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                Join the chapter <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outlined">
              <Link href="/events">Explore events</Link>
            </Button>
          </div>
        </div>
        <HeroArt event={upcoming[0]} />
      </section>
      </div>

      <TechMarquee />

      {/* Pillars */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text, tint, fg }, i) => (
            <div
              key={title}
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              className={`group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 ${tint}`}
            >
              <Icon className={`size-7 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 ${fg}`} />
              <h3 className="mt-6 font-display text-xl font-medium">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Events */}
      <div className="bg-surface">
        <Section>
          <SectionHeader
            eyebrow="Events"
            title="What's coming up"
            description="Hands-on sessions run by students, for students. Everyone is welcome — no experience needed."
            action={
              <Button asChild variant="text">
                <Link href="/events">
                  All events <ArrowRight />
                </Link>
              </Button>
            }
          />
          {upcoming.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No events scheduled right now"
              description="Join the chapter to get notified as soon as the next one is announced."
            />
          )}
        </Section>
      </div>

      {/* Team teaser + story */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div data-reveal className="flex flex-col justify-between rounded-4xl border border-line p-8 md:p-10">
            <div>
              <p className="eyebrow">The team</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight">Run by students who love to build</h2>
              <p className="mt-3 text-muted">
                {currentTeam.length} organizers across tech, design, content, events and outreach for {latestYear}–{String(latestYear + 1).slice(2)}.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <div className="flex -space-x-3">
                {avatars.map((m) => (
                  <div key={m.id} className="relative size-12 overflow-hidden rounded-full ring-2 ring-bg">
                    <Image src={m.image!} alt={m.name} fill sizes="48px" className="object-cover" />
                  </div>
                ))}
              </div>
              <Button asChild variant="tonal">
                <Link href="/team">
                  Meet the team <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          {story && (
            <figure
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
              className="relative isolate flex flex-col justify-between overflow-hidden rounded-4xl bg-g-blue p-8 text-white md:p-10"
            >
              <Shape kind="circle" color="none" className="-right-10 -top-10 -z-10 w-40 stroke-white/40" />
              <blockquote className="font-display text-2xl font-medium leading-snug md:text-3xl">“{story.quote}”</blockquote>
              <figcaption className="glass glass-on-color relative mt-8 flex items-center gap-4 self-start rounded-full py-2 pl-2 pr-6">
                {story.image && (
                  <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-white/60">
                    <Image src={story.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{story.name}</p>
                  {story.role && <p className="text-sm text-white/80">{story.role}</p>}
                </div>
              </figcaption>
            </figure>
          )}
        </div>
      </Section>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <Section className="pt-0 md:pt-0">
          <div data-reveal className="rounded-4xl border border-line px-6 py-10 text-center md:px-10">
            <p className="eyebrow">Supported by</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {sponsors.map((s) => {
                const logo = <Image src={s.logo} alt={s.name} width={180} height={56} className="h-12 w-auto object-contain dark:brightness-0 dark:invert" />;
                return s.url ? (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="opacity-80 transition-opacity hover:opacity-100">
                    {logo}
                  </a>
                ) : (
                  <div key={s.id}>{logo}</div>
                );
              })}
            </div>
            <p className="mt-8 text-sm text-muted">
              Want to support student developers?{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Become a sponsor
              </Link>
            </p>
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div data-reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">Questions, answered</h2>
            <p className="mt-3 text-muted">
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <FaqList faqs={faqs} />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="pt-0 md:pt-0">
        <div
          data-reveal
          className="relative isolate overflow-hidden rounded-4xl bg-surface-2 px-4 py-12 md:px-16 md:py-16"
          style={{
            // Static colour blobs for the glass to refract — gradients, not blurred elements, so they cost nothing.
            backgroundImage: [
              "radial-gradient(circle at 12% 20%, rgb(var(--g-blue) / 0.55), transparent 32%)",
              "radial-gradient(circle at 88% 18%, rgb(var(--g-red) / 0.45), transparent 30%)",
              "radial-gradient(circle at 22% 88%, rgb(var(--g-yellow) / 0.55), transparent 32%)",
              "radial-gradient(circle at 82% 85%, rgb(var(--g-green) / 0.5), transparent 32%)",
            ].join(","),
          }}
        >
          {/* Moving shapes stay at the edges, outside the glass panel. */}
          <ShapeLayer>
            <Shape kind="triangle" color="yellow" className="right-[4%] top-8 w-14 animate-float [--r:20deg]" />
            <Shape kind="arc" color="green" className="-bottom-4 -left-4 w-24 animate-spin-slower" />
          </ShapeLayer>
          <div className="glass relative mx-auto max-w-2xl rounded-4xl px-6 py-10 text-center md:px-12">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">Ready to start building?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Join the chapter on the GDG community platform to RSVP for events and stay in the loop.
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                Join GDG On Campus BIET <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

/**
 * Google-colour shape composition with a glass "next up" card floating over it.
 * The tiles are static on purpose: the glass blurs whatever is behind it, and
 * a still backdrop keeps that cheap.
 */
function HeroArt({ event }: { event?: GdgEvent }) {
  return (
    <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-sm lg:max-w-none">
      <div aria-hidden className="grid aspect-square grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
        <div className="rounded-full bg-g-blue" />
        <div className="rounded-[2.5rem] rounded-tr-full bg-g-red" />
        <div className="grid place-items-center rounded-[2.5rem] bg-g-yellow">
          <span className="font-display text-6xl font-semibold text-[#202124] md:text-7xl">{"</>"}</span>
        </div>
        <div className="rounded-full rounded-bl-[2.5rem] bg-g-green" />
      </div>

      <div className="glass absolute inset-x-4 top-1/2 hidden -translate-y-1/2 rounded-3xl p-5 sm:block lg:inset-x-8">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-g-green opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-g-green" />
          </span>
          {event ? "Next up" : "Join us"}
        </p>
        <p className="mt-2 font-display text-xl font-medium leading-snug">{event ? event.title : "Be first to hear about new events"}</p>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            {event ? (event.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Date to be announced") : "GDG community platform"}
          </span>
          <a
            href={event?.registerUrl ?? site.chapterUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {event ? "Register" : "Join"} <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
