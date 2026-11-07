"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Send } from "lucide-react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/70 transition-colors hover:border-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function ContactForm() {
  const [state, action] = useFormState<ContactState, FormData>(sendMessage, { status: "idle" });

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-g-green-tint p-10 text-center">
        <CheckCircle2 className="size-10 text-g-green" />
        <h3 className="mt-4 font-display text-2xl font-medium">Message sent</h3>
        <p className="mt-2 text-muted">Thanks for reaching out — we&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    // key forces a remount so defaultValue re-applies after an error.
    <form key={state.attempt} action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Name</span>
          <input name="name" required maxLength={120} autoComplete="name" defaultValue={state.values?.name} className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={fieldClass} />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          defaultValue={state.values?.message}
          placeholder="Questions, collaboration ideas, sponsorship, feedback…"
          className={fieldClass}
        />
      </label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-g-red-tint px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending…" : "Send message"} <Send />
    </Button>
  );
}
