import { cn } from "@/lib/utils";

// The outlined geometric shapes from the original site, redrawn inline so the
// outline follows the theme (dark outline in light mode, light in dark mode).

type Kind = "circle" | "triangle" | "hexagon" | "arc" | "square" | "plus";
type Color = "blue" | "red" | "yellow" | "green" | "none";

const fills: Record<Color, string> = {
  blue: "fill-g-blue",
  red: "fill-g-red",
  yellow: "fill-g-yellow",
  green: "fill-g-green",
  none: "fill-none",
};

const paths: Record<Kind, React.ReactNode> = {
  circle: <circle cx="50" cy="50" r="46" />,
  triangle: <path d="M88 82c-2 13-17 19-27 11L9 54c-10-8-8-24 4-29l59-24c12-5 25 5 23 18z" />,
  hexagon: <path d="M41 4.6a18 18 0 0 1 18 0l28 16.2a18 18 0 0 1 9 15.6v27.2a18 18 0 0 1-9 15.6L59 95.4a18 18 0 0 1-18 0L13 79.2a18 18 0 0 1-9-15.6V36.4a18 18 0 0 1 9-15.6z" />,
  arc: <path d="M92 40a8 8 0 0 1 5 10 48 48 0 0 1-91 0 8 8 0 0 1 15-5 32 32 0 0 0 61 0 8 8 0 0 1 10-5z" />,
  square: <rect x="10" y="10" width="80" height="80" rx="18" />,
  plus: <path d="M40 8h20v32h32v20H60v32H40V60H8V40h32z" />,
};

export function Shape({ kind, color = "blue", className }: { kind: Kind; color?: Color; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("pointer-events-none absolute stroke-fg/80 [stroke-width:2]", fills[color], className)}
    >
      {paths[kind]}
    </svg>
  );
}

/** Wraps a block so its decorative shapes stay clipped inside it and behind its content. */
export function ShapeLayer({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden data-motion className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block">
      {children}
    </div>
  );
}
