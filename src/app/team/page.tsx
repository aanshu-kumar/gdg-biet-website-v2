import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/Section";
import { TeamDirectory } from "@/components/TeamDirectory";
import { getTeamSessions } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Team",
  description: "Meet the student organizers behind GDG On Campus BIET, Lucknow.",
};

export default async function TeamPage() {
  const sessions = await getTeamSessions();

  return (
    <>
      <PageHeader
        accent="yellow"
        title="Team"
        description="The club and department leads who plan the events, build the projects and keep this community running."
      />
      <Section>
        <TeamDirectory sessions={sessions} />
      </Section>
    </>
  );
}
