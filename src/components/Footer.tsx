import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { Logo } from "@/components/Logo";
import { navLinks, site } from "@/lib/site";

const columns = [
  {
    title: "Explore",
    links: [{ href: "/", label: "Home" }, ...navLinks.map(({ href, label }) => ({ href, label }))],
  },
  {
    title: "Community",
    links: [
      { href: site.chapterUrl, label: "Join the chapter" },
      { href: "/hackathon", label: "Hackathon" },
      { href: "https://developers.google.com/community/gdg", label: "About GDG" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { href: site.githubUrl, label: "View source" },
      { href: `${site.githubUrl}/issues/new`, label: "Report a bug" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container grid grid-cols-2 gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{site.description}</p>
          <div className="flex gap-1">
            <a href={`mailto:${site.email}`} aria-label="Email us" className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
              <MdOutlineEmail className="size-5" />
            </a>
            <a href={site.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
              <FaGithub className="size-5" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 text-sm font-medium text-fg">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-primary">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted hover:text-primary">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GDG On Campus BIET, Lucknow.</p>
          <p>
            GDG On Campus is a community program supported by Google for Developers. This chapter is run independently by
            students.
          </p>
        </div>
      </div>
    </footer>
  );
}
