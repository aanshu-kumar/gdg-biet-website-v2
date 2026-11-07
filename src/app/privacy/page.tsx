import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What information the GDG On Campus BIET website collects and how it's used.",
};

const updated = "7 November 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader accent="blue" title="Privacy policy" description={`How this website handles your information. Last updated ${updated}.`} />
      <Section>
        <div className="prose prose-lg max-w-3xl dark:prose-invert prose-headings:font-display prose-headings:font-medium prose-a:text-primary">
          <p>
            This website is run by the student organizers of Google Developer Groups On Campus, BIET Lucknow (&ldquo;we&rdquo;). It is a
            student community project and is not operated by Google.
          </p>

          <h2>Visitors</h2>
          <p>
            You can browse the site without an account. We don&apos;t use advertising or tracking cookies. Our hosting provider (Vercel)
            keeps standard server logs, such as IP address and browser type, to run and protect the site.
          </p>

          <h2>Contact form</h2>
          <p>
            If you send us a message, we store your name, email address and message so we can reply. Only our organizers can read them.
          </p>

          <h2>Team members who sign in</h2>
          <p>
            Team sign-in is invite-only and uses Google. When you sign in, we receive your name, email address and Google account ID from
            Google, and we use them only to confirm you&apos;ve been invited and to show who you are inside the team dashboard. We don&apos;t
            request access to your Gmail, Drive, contacts or any other Google data.
          </p>
          <p>
            Profile details you add in the dashboard (photo, bio, skills and social links) are shown publicly on the Team page if you hold a
            lead or co-lead position, and alongside blog posts you write. Your email address is never shown publicly.
          </p>

          <h2>Where data is stored</h2>
          <p>
            Data is stored with Supabase (database, authentication and file storage) and served through Vercel. We don&apos;t sell or share
            your information with anyone else.
          </p>

          <h2>Your choices</h2>
          <p>
            You can edit your profile at any time from the dashboard. To have your account, profile or a contact message deleted, email us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll remove it.
          </p>

          <h2>Changes</h2>
          <p>If this policy changes, we&apos;ll update this page and the date at the top.</p>
        </div>
      </Section>
    </>
  );
}
