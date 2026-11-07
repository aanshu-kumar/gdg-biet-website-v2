import Link from "next/link";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-8xl font-semibold tracking-tight">
        <span className="text-g-blue">4</span>
        <span className="text-g-red">0</span>
        <span className="text-g-green">4</span>
      </p>
      <h1 className="mt-4 font-display text-2xl font-medium">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">It may have moved, or the link might be wrong.</p>
      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </Section>
  );
}
