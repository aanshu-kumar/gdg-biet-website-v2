import type { Metadata } from "next";
import Image from "next/image";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RoleBadge } from "@/components/dashboard/ui";
import { requireViewer } from "@/lib/auth";
import { assetUrl } from "@/lib/supabase";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const avatar = assetUrl(viewer.avatarPath);

  return (
    <div className="container grid gap-8 pb-20 pt-24 md:pt-28 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {avatar ? (
              <Image src={avatar} alt="" fill sizes="44px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center font-display text-lg text-muted">{viewer.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{viewer.name}</p>
            <RoleBadge role={viewer.role} />
          </div>
        </div>
        <DashboardNav isLead={viewer.isLead} isAdmin={viewer.isAdmin} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
