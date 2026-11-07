import { Shape, ShapeLayer } from "@/components/Shapes";
import { cn } from "@/lib/utils";

export function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("container py-16 md:py-20", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      data-reveal
      className={cn(
        "mb-10 flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
        {description && <p className="text-lg text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Standard header for inner pages: replaces the old full-screen hero. */
export function PageHeader({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: "blue" | "red" | "yellow" | "green";
}) {
  const bar = { blue: "bg-g-blue", red: "bg-g-red", yellow: "bg-g-yellow", green: "bg-g-green" }[accent];
  return (
    <div className="relative isolate border-b border-line bg-surface">
      {/* Shapes sit in the empty right-hand side, clear of the max-w-2xl text, and below the glass navbar. */}
      <ShapeLayer>
        <Shape kind="circle" color={accent} className="right-[16%] top-[32%] w-24 animate-float" />
        <Shape kind="hexagon" color="none" className="right-[6%] top-[26%] w-16 animate-spin-slow" />
        <Shape kind="triangle" color="yellow" className="bottom-[12%] right-[26%] w-14 -rotate-12" />
      </ShapeLayer>
      <div className="container pb-14 pt-28 md:pb-20 md:pt-36" data-reveal>
        <span className={cn("mb-6 block h-1.5 w-14 rounded-full", bar)} />
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted md:text-xl">{description}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div data-reveal className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      <div className="mb-4 flex gap-1.5">
        {["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green"].map((c) => (
          <span key={c} className={cn("size-2.5 rounded-full", c)} />
        ))}
      </div>
      <h3 className="font-display text-xl font-medium">{title}</h3>
      <p className="mt-2 max-w-md text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-lg border border-line px-2.5 text-xs font-medium text-muted">
      {children}
    </span>
  );
}
