"use client";

import { useState } from "react";
import { LeadCard, MemberCard } from "@/components/MemberCard";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamDirectory({ members }: { members: Member[] }) {
  const years = [...new Set(members.map((m) => m.year))].sort((a, b) => b - a);
  const [year, setYear] = useState(years[0]);

  const cohort = members.filter((m) => m.year === year).sort((a, b) => a.order - b.order);
  const leads = cohort.filter((m) => m.lead);
  const rest = cohort.filter((m) => !m.lead);

  return (
    <div>
      <div role="tablist" aria-label="Team year" className="mb-10 inline-flex rounded-full border border-line p-1">
        {years.map((y) => (
          <button
            key={y}
            role="tab"
            aria-selected={y === year}
            onClick={() => setYear(y)}
            className={cn(
              "h-9 rounded-full px-5 text-sm font-medium transition-colors",
              y === year ? "bg-g-blue-tint text-fg" : "text-muted hover:text-fg",
            )}
          >
            {y}–{String(y + 1).slice(2)}
          </button>
        ))}
      </div>

      {leads.length > 0 && (
        <div className={cn("mb-10 grid gap-6", leads.length > 1 && "lg:grid-cols-2")}>
          {leads.map((m) => (
            <LeadCard key={m.id} member={m} />
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rest.map((m, i) => (
          <MemberCard key={m.id} member={m} index={i} />
        ))}
      </div>
    </div>
  );
}
