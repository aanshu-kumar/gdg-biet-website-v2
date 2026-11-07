import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)} aria-label="GDG On Campus BIET — home">
      <Image src="/brand/gdg-mark.svg" alt="" width={44} height={25} priority />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-medium text-fg">Google Developer Groups</span>
        <span className="block text-xs text-muted">On Campus · BIET Lucknow</span>
      </span>
    </Link>
  );
}
