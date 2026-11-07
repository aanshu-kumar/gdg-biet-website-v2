import type { Metadata } from "next";
import { Handshake, Mail, Users } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader, Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GDG On Campus BIET, Lucknow — questions, collaborations and sponsorships.",
};

const ways = [
  { icon: Mail, title: "Email", text: site.email, href: `mailto:${site.email}`, tint: "bg-g-blue-tint" },
  { icon: Users, title: "Join the chapter", text: "RSVP for events on the GDG platform", href: site.chapterUrl, tint: "bg-g-green-tint" },
  { icon: Handshake, title: "Collaborate or sponsor", text: "Use the form — we read every message", href: "#form", tint: "bg-g-yellow-tint" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        accent="green"
        title="Contact"
        description="Questions, collaboration ideas, speaker or sponsorship enquiries — we'd love to hear from you."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            {ways.map(({ icon: Icon, title, text, href, tint }) => (
              <a
                key={title}
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-start gap-4 rounded-3xl border border-line p-5 transition-shadow hover:shadow-card"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${tint}`}>
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block break-all text-sm text-muted">{text}</span>
                </span>
              </a>
            ))}
          </div>
          <div id="form" className="scroll-mt-24 rounded-4xl border border-line p-6 md:p-10">
            <h2 className="mb-6 font-display text-2xl font-medium">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
