import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/Section";
import { TeamDirectory } from "@/components/TeamDirectory";
import { getTeam } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Team",
  description: "Meet the student organizers behind GDG On Campus BIET, Lucknow.",
};

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <PageHeader
        accent="yellow"
        title="Team"
        description="The students who plan the events, build the projects and keep this community running."
      />
      <Section>
        <TeamDirectory members={team} />
      </Section>
    </>
  );
}
