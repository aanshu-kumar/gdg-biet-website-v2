"use client";

import { useState } from "react";
import { ClubLeadCard, DepartmentLeadCard, LeadCard, MemberCard } from "@/components/MemberCard";
import type { TeamSession } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamDirectory({ sessions }: { sessions: TeamSession[] }) {
  const [key, setKey] = useState((sessions.find((s) => s.isCurrent) ?? sessions[0])?.key);
  const session = sessions.find((s) => s.key === key);
  if (!session) return null;

  return (
    <div>
      {sessions.length > 1 && (
        <div role="tablist" aria-label="Team year" className="mb-10 inline-flex flex-wrap rounded-full border border-line p-1">
          {sessions.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={s.key === key}
              onClick={() => setKey(s.key)}
              className={cn(
                "h-9 rounded-full px-5 text-sm font-medium transition-colors",
                s.key === key ? "bg-g-blue-tint text-fg" : "text-muted hover:text-fg",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {session.kind === "roster" ? <Leadership session={session} /> : <LegacyTeam members={session.members} />}
    </div>
  );
}

function Leadership({ session }: { session: Extract<TeamSession, { kind: "roster" }> }) {
  return (
    <div className="space-y-14">
      {session.club.length > 0 && (
        <div className={cn("grid gap-6", session.club.length > 1 && "lg:grid-cols-2")}>
          {session.club.map((p) => (
            <ClubLeadCard key={p.id} person={p} />
          ))}
        </div>
      )}

      {session.departments.length > 0 && (
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
          {session.departments.map((d, i) => (
            <section key={d.id} aria-labelledby={`dept-${d.id}`}>
              <h2 id={`dept-${d.id}`} className="mb-4 flex items-center gap-3 font-display text-xl font-medium">
                <span className={cn("size-2.5 rounded-full", ["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green"][i % 4])} />
                {d.name}
              </h2>
              <div className="grid gap-4">
                {d.people.map((p, j) => (
                  <DepartmentLeadCard key={p.id} person={p} index={i * 2 + j} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Original layout for years before leadership was managed in the dashboard. */
function LegacyTeam({ members }: { members: Extract<TeamSession, { kind: "legacy" }>["members"] }) {
  const sorted = [...members].sort((a, b) => a.order - b.order);
  const leads = sorted.filter((m) => m.lead);
  const rest = sorted.filter((m) => !m.lead);
  return (
    <div>
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
