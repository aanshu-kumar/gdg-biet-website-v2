import type { Metadata } from "next";
import { EventCard } from "@/components/EventCard";
import { EmptyState, PageHeader, Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, study jams, talks and hackathons from GDG On Campus BIET, Lucknow.",
};

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <>
      <PageHeader
        accent="blue"
        title="Events"
        description="Workshops, study jams, talks and hackathons — open to every student at BIET, whatever your experience."
      />

      <Section>
        <SectionHeader title="Upcoming" />
        {upcoming.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing scheduled yet"
            description="New events are announced on our chapter page first. Join to get notified."
            action={
              <Button asChild>
                <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                  Join the chapter
                </a>
              </Button>
            }
          />
        )}
      </Section>

      {past.length > 0 && (
        <Section className="pt-0 md:pt-0">
          <SectionHeader title="Past events" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
