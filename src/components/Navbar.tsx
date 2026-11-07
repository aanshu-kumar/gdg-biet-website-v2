"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    // Floating glass pill. The header is transparent and pulls the page up under itself (-mb = its own height:
    // pt-3 + h-14 = 4.25rem), so page backgrounds run behind the glass. Heroes add top padding to clear it.
    <header className="pointer-events-none sticky top-0 z-50 -mb-[4.25rem] pt-3">
      <div className="container">
        <nav
          className={cn(
            "glass pointer-events-auto relative flex h-14 items-center justify-between gap-4 rounded-full pl-4 pr-2 transition-shadow duration-300 sm:pl-5",
            scrolled ? "[--glass-shadow:0.22]" : "[--glass-shadow:0.08]",
          )}
        >
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                  isActive(link.href) ? "bg-fg/[0.07] text-fg" : "text-muted hover:bg-fg/[0.05] hover:text-fg",
                )}
              >
                {isActive(link.href) && <span className={cn("size-1.5 rounded-full", link.color)} />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                Join chapter
              </a>
            </Button>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full text-muted hover:bg-fg/[0.06] md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="glass pointer-events-auto relative mt-2 rounded-3xl p-2 md:hidden">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium",
                      isActive(link.href) ? "bg-fg/[0.07] text-fg" : "text-muted hover:bg-fg/[0.05]",
                    )}
                  >
                    <span className={cn("size-2 rounded-full", link.color)} />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="px-2 pb-1 pt-2">
                <Button asChild className="w-full">
                  <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                    Join chapter
                  </a>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
