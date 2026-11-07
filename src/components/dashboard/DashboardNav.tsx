"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, LayoutGrid, LogOut, Settings2, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, show: () => true },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound, show: () => true },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays, show: () => true },
  { href: "/dashboard/posts", label: "Blog posts", icon: FileText, show: () => true },
  { href: "/dashboard/members", label: "Members", icon: Users, show: (lead: boolean) => lead },
  { href: "/dashboard/admin", label: "Admin", icon: Settings2, show: (_: boolean, admin: boolean) => admin },
];

export function DashboardNav({ isLead, isAdmin }: { isLead: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items
        .filter((i) => i.show(isLead || isAdmin, isAdmin))
        .map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active(href) ? "bg-g-blue-tint text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4" />
            {label}
            <PendingDot />
          </Link>
        ))}
      <form action="/auth/signout" method="post" className="lg:mt-4 lg:border-t lg:border-line lg:pt-4">
        <button
          type="submit"
          className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </form>
    </nav>
  );
}

/** Pulses on the tab you just clicked while its page loads, so the click feels instant. */
function PendingDot() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={cn("ml-auto size-1.5 rounded-full bg-primary transition-opacity", pending ? "animate-pulse opacity-100" : "opacity-0")} />;
}
