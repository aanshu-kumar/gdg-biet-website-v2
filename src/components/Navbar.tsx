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
    <header
      className={cn(
        // Solid background, not backdrop-blur: a blur re-renders every frame while anything animates underneath.
        "sticky top-0 z-50 border-b bg-bg transition-colors",
        scrolled || open ? "border-line" : "border-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-6">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative flex h-16 items-center px-4 text-sm font-medium transition-colors",
                isActive(link.href) ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className={cn("absolute inset-x-3 bottom-0 h-[3px] rounded-t-full", link.color)} />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild size="sm" className="ml-2 hidden sm:inline-flex">
            <a href={site.chapterUrl} target="_blank" rel="noreferrer">
              Join chapter
            </a>
          </Button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <ul className="container flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium",
                    isActive(link.href) ? "bg-g-blue-tint text-fg" : "text-muted hover:bg-surface-2",
                  )}
                >
                  <span className={cn("size-2 rounded-full", link.color)} />
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="px-4 pb-2 pt-3">
              <Button asChild className="w-full">
                <a href={site.chapterUrl} target="_blank" rel="noreferrer">
                  Join chapter
                </a>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
