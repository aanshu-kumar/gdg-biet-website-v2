import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/types";

/** Native <details> accordion: accessible and works without JavaScript. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-3xl border border-line bg-bg">
      {faqs.map((faq) => (
        <details key={faq.id} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium">
            {faq.question}
            <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="whitespace-pre-line pb-6 text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
