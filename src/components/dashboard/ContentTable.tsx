import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StateBadge } from "@/components/dashboard/ui";
import type { PublishState } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function Tabs({ base, current, tabs }: { base: string; current: string; tabs: { key: string; label: string }[] }) {
  return (
    <div role="tablist" className="mb-6 inline-flex rounded-full border border-line p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          role="tab"
          aria-selected={t.key === current}
          href={t.key === "all" ? base : `${base}?tab=${t.key}`}
          className={cn(
            "flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
            t.key === current ? "bg-g-blue-tint text-fg" : "text-muted hover:text-fg",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function ContentTable({
  rows,
  empty,
}: {
  rows: { id: string; href: string; title: string; meta: string; state: PublishState }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-3xl border border-dashed border-line px-6 py-12 text-center text-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={r.href} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.title || "Untitled"}</p>
              <p className="truncate text-sm text-muted">{r.meta}</p>
            </div>
            <StateBadge state={r.state} />
            <ChevronRight className="size-4 shrink-0 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
