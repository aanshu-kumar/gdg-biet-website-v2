import type { Metadata } from "next";
import { EmptyState, PageHeader, Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hackathon",
  description: "The GDG On Campus BIET hackathon — details coming soon.",
};

export default function HackathonPage() {
  return (
    <>
      <PageHeader
        accent="yellow"
        title="Hackathon"
        description="Build something ambitious in a weekend with teammates, mentors and plenty of coffee."
      />
      <Section>
        <EmptyState
          title="Coming soon"
          description="Dates, tracks and registration will be announced on our chapter page. Join to be the first to know."
          action={
            <Button asChild>
              <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                Get notified
              </a>
            </Button>
          }
        />
      </Section>
    </>
  );
}
