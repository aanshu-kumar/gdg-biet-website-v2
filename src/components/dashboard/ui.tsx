import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-fg placeholder:text-muted/70 transition-colors hover:border-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl border border-line bg-bg p-6", className)}>{children}</section>;
}

/** Banner for ?ok= / ?error= messages set by server actions. */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
        error ? "bg-g-red-tint" : "bg-g-green-tint",
      )}
    >
      {error ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-g-red" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-g-green" />}
      {error ?? ok}
    </p>
  );
}

const stateStyle = {
  draft: "bg-surface-2 text-muted",
  pending: "bg-g-yellow-tint text-fg",
  published: "bg-g-green-tint text-fg",
} as const;
const stateLabel = { draft: "Draft", pending: "Awaiting review", published: "Published" } as const;

export function StateBadge({ state }: { state: keyof typeof stateStyle }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", stateStyle[state])}>
      {stateLabel[state]}
    </span>
  );
}

export function RoleBadge({ role }: { role: "admin" | "lead" | "member" }) {
  const style = { admin: "bg-g-red-tint", lead: "bg-g-blue-tint", member: "bg-surface-2" }[role];
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium text-fg", style)}>
      {role === "admin" ? "Admin" : role === "lead" ? "Lead" : "Member"}
    </span>
  );
}
